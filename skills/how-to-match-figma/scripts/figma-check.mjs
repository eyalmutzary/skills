// Compares a live page with Figma values from a spec file. Needs only a Playwright `page`.
// Usage in a steps file:
//   const { figmaCheck } = await import(`${process.env.HOME}/.claude/skills/how-to-match-figma/scripts/figma-check.mjs`);
//   await figmaCheck(page, { spec: '/tmp/<id>-figma-spec.json', out: '/tmp/<id>-figma/round-1' });
// Spec:
//   root:      selector; element selectors are scoped inside it (':scope' = the root)
//   elements:  [{ name, selector, index?, expect: { width, height, paddingTop, rowGap, columnGap, fontSize,
//                fontWeight, lineHeight, letterSpacing, fontFamily (substring), color, backgroundColor,
//                opacity, borderRadius, borderWidth, borderColor } }]   numbers are px
//   relations: [{ from, to, measure, expect }]   measure = gapX | gapY | left | top | right | bottom | centerX | centerY,
//                "to" relative to "from" (gapY = to.top - from.bottom, right = from.right - to.right)
//   areas:     [{ name, selector, index?, figmaImage }]   figmaImage = a 1x Figma screenshot
import fs from 'node:fs';
import path from 'node:path';

const PX_TOLERANCE = 0.5;
const PIXEL_DIFF_THRESHOLD = 48;
const VIEW_SCALE = 2;
const MEASURED_STYLES = {
  paddingTop: 'padding-top', paddingRight: 'padding-right', paddingBottom: 'padding-bottom', paddingLeft: 'padding-left',
  rowGap: 'row-gap', columnGap: 'column-gap',
  fontSize: 'font-size', fontWeight: 'font-weight', lineHeight: 'line-height', letterSpacing: 'letter-spacing',
  fontFamily: 'font-family', color: 'color', backgroundColor: 'background-color', opacity: 'opacity',
  borderRadius: 'border-top-left-radius', borderWidth: 'border-top-width', borderColor: 'border-top-color',
};

export async function figmaCheck(page, { spec: specInput, out }) {
  const spec = typeof specInput === 'string' ? JSON.parse(fs.readFileSync(specInput, 'utf8')) : specInput;
  fs.mkdirSync(out, { recursive: true });

  const boxes = await measureElements(page, spec);
  const rows = [...elementRows(spec.elements ?? [], boxes), ...relationRows(spec.relations ?? [], boxes)];
  const images = await compareAreas(page, spec.areas ?? [], out);

  const report = renderReport(rows, images);
  fs.writeFileSync(path.join(out, 'report.md'), report);
  console.log(report);
  return { pass: rows.every((row) => row.pass), rows, images };
}

// Selectors are scoped inside spec.root, so a class name used elsewhere on the page cannot match.
async function measureElements(page, { root, elements = [] }) {
  const scope = root ? page.locator(root).first() : page;
  const boxes = {};
  for (const element of elements) {
    const matches = scope.locator(element.selector);
    const matchCount = await matches.count();
    const isFound = matchCount > (element.index ?? 0);
    boxes[element.name] = isFound ? { ...(await matches.nth(element.index ?? 0).evaluate(readBox, MEASURED_STYLES)), matchCount } : null;
  }
  return boxes;
}

function readBox(el, measuredStyles) {
  const rect = el.getBoundingClientRect();
  const computed = getComputedStyle(el);
  const styles = Object.fromEntries(
    Object.entries(measuredStyles).map(([key, cssName]) => [key, computed.getPropertyValue(cssName)]),
  );
  return {
    left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom,
    width: rect.width, height: rect.height,
    centerX: rect.left + rect.width / 2, centerY: rect.top + rect.height / 2,
    styles,
  };
}

function elementRows(elements, boxes) {
  return elements.flatMap((element) => {
    const box = boxes[element.name];
    if (!box) {
      return [{ name: element.name, property: 'found', figma: 'yes', actual: 'NOT FOUND', pass: false }];
    }
    const isAmbiguous = element.index === undefined && box.matchCount > 1;
    if (isAmbiguous) {
      return [{ name: element.name, property: 'unique', figma: '1 match', actual: `${box.matchCount} matches: add index or a narrower selector`, pass: false }];
    }
    return Object.entries(element.expect ?? {}).map(([property, figma]) => {
      const actual = property in box ? box[property] : box.styles[property];
      return { name: element.name, property, figma, actual: formatValue(actual), pass: isMatch(property, figma, actual) };
    });
  });
}

// Each relation reads as "to" relative to "from": a gap, an inset inside a parent, or an alignment offset.
const RELATION_MEASURES = {
  gapX: (from, to) => to.left - from.right,
  gapY: (from, to) => to.top - from.bottom,
  left: (from, to) => to.left - from.left,
  top: (from, to) => to.top - from.top,
  right: (from, to) => from.right - to.right,
  bottom: (from, to) => from.bottom - to.bottom,
  centerX: (from, to) => to.centerX - from.centerX,
  centerY: (from, to) => to.centerY - from.centerY,
};

function relationRows(relations, boxes) {
  return relations.map(({ from, to, measure, expect }) => {
    const name = `${to} ${measure} from ${from}`;
    const isMissing = !boxes[from] || !boxes[to];
    if (isMissing) {
      return { name, property: measure, figma: expect, actual: 'NOT FOUND', pass: false };
    }
    const actual = RELATION_MEASURES[measure](boxes[from], boxes[to]);
    return { name, property: measure, figma: expect, actual: formatValue(actual), pass: isPxMatch(expect, actual) };
  });
}

function isMatch(property, figma, actual) {
  if (typeof figma === 'number') {
    return isPxMatch(figma, parseFloat(actual));
  }
  const isColor = /color/i.test(property);
  if (isColor) {
    return toHex(String(figma)) === toHex(String(actual));
  }
  if (property === 'fontFamily') {
    return String(actual).toLowerCase().includes(String(figma).toLowerCase());
  }
  return String(figma).trim() === String(actual).trim();
}

function isPxMatch(figma, actual) {
  return Number.isFinite(actual) && Math.abs(actual - figma) <= PX_TOLERANCE;
}

function toHex(color) {
  const rgb = color.match(/rgba?\(([^)]+)\)/);
  if (!rgb) {
    return color.trim().toLowerCase();
  }
  const [r, g, b, alpha = '1'] = rgb[1].split(/[\s,/]+/).filter(Boolean);
  const hex = [r, g, b].map((channel) => Number(channel).toString(16).padStart(2, '0')).join('');
  return Number(alpha) === 1 ? `#${hex}` : `#${hex}@${alpha}`;
}

function formatValue(value) {
  return typeof value === 'number' ? Math.round(value * 100) / 100 : value;
}

async function compareAreas(page, areas, out) {
  const images = [];
  for (const area of areas) {
    const browserPath = path.join(out, `${area.name}-browser.png`);
    await page.locator(area.selector).nth(area.index ?? 0).screenshot({ path: browserPath });
    const comparison = await renderComparison(page, { figmaPath: area.figmaImage, browserPath });
    const comparePath = path.join(out, `${area.name}-compare.png`);
    fs.writeFileSync(comparePath, Buffer.from(comparison.png, 'base64'));
    images.push({ name: area.name, comparePath, ...comparison.stats });
  }
  return images;
}

// Draws Figma | browser | diff side by side at VIEW_SCALE, in a blank page of the same browser.
async function renderComparison(page, { figmaPath, browserPath }) {
  const canvasPage = await page.context().newPage();
  try {
    return await canvasPage.evaluate(drawComparison, {
      figma: toDataUrl(figmaPath),
      browser: toDataUrl(browserPath),
      devicePixelRatio: await page.evaluate(() => window.devicePixelRatio),
      threshold: PIXEL_DIFF_THRESHOLD,
      scale: VIEW_SCALE,
    });
  } finally {
    await canvasPage.close();
  }
}

function toDataUrl(file) {
  return `data:image/png;base64,${fs.readFileSync(file).toString('base64')}`;
}

async function drawComparison({ figma, browser, devicePixelRatio, threshold, scale }) {
  const load = (src) => new Promise((resolve) => { const img = new Image(); img.onload = () => resolve(img); img.src = src; });
  const [figmaImage, browserImage] = await Promise.all([load(figma), load(browser)]);
  const browserSize = { width: browserImage.width / devicePixelRatio, height: browserImage.height / devicePixelRatio };
  const width = Math.max(figmaImage.width, browserSize.width);
  const height = Math.max(figmaImage.height, browserSize.height);

  const pixelsOf = (img, size) => {
    const canvas = Object.assign(document.createElement('canvas'), { width, height });
    const context = canvas.getContext('2d');
    context.fillStyle = '#fff';
    context.fillRect(0, 0, width, height);
    context.drawImage(img, 0, 0, size.width, size.height);
    return { canvas, data: context.getImageData(0, 0, width, height) };
  };
  const figmaPixels = pixelsOf(figmaImage, figmaImage);
  const browserPixels = pixelsOf(browserImage, browserSize);

  const diff = new ImageData(width, height);
  let differentPixels = 0;
  for (let i = 0; i < diff.data.length; i += 4) {
    const delta = Math.max(...[0, 1, 2].map((c) => Math.abs(figmaPixels.data.data[i + c] - browserPixels.data.data[i + c])));
    const isDifferent = delta > threshold;
    differentPixels += isDifferent ? 1 : 0;
    const faded = 255 - (255 - browserPixels.data.data[i]) * 0.2;
    diff.data.set(isDifferent ? [230, 0, 60, 255] : [faded, faded, faded, 255], i);
  }
  const diffCanvas = Object.assign(document.createElement('canvas'), { width, height });
  diffCanvas.getContext('2d').putImageData(diff, 0, 0);

  const gap = 8;
  const sheet = Object.assign(document.createElement('canvas'), { width: (width * 3 + gap * 2) * scale, height: height * scale });
  const sheetContext = sheet.getContext('2d');
  sheetContext.imageSmoothingEnabled = false;
  sheetContext.fillStyle = '#888';
  sheetContext.fillRect(0, 0, sheet.width, sheet.height);
  [figmaPixels.canvas, browserPixels.canvas, diffCanvas].forEach((canvas, column) => {
    sheetContext.drawImage(canvas, column * (width + gap) * scale, 0, width * scale, height * scale);
  });

  return {
    png: sheet.toDataURL('image/png').split(',')[1],
    stats: {
      figmaSize: `${figmaImage.width}x${figmaImage.height}`,
      browserSize: `${browserSize.width}x${browserSize.height}`,
      differentPercent: Math.round((differentPixels / (width * height)) * 1000) / 10,
      isSameSize: Math.abs(figmaImage.width - browserSize.width) <= 1 && Math.abs(figmaImage.height - browserSize.height) <= 1,
    },
  };
}

function renderReport(rows, images) {
  const failed = rows.filter((row) => !row.pass).length;
  const lines = [
    `# Figma check: ${failed === 0 ? 'PASS' : `${failed} FAIL`} (${rows.length} checks)`,
    '',
    '| | element | property | figma | actual |',
    '|---|---|---|---|---|',
    ...rows.map((row) => `| ${row.pass ? '✅' : '❌'} | ${row.name} | ${row.property} | ${row.figma} | ${row.actual} |`),
  ];
  if (images.length > 0) {
    lines.push('', '## Images (figma | browser | diff)', '');
    lines.push(...images.map((image) => {
      const sizeNote = image.isSameSize ? '' : ' (sizes differ: the diff % is not reliable, compare by eye)';
      return `- ${image.name}: ${image.comparePath} — figma ${image.figmaSize}, browser ${image.browserSize}, ${image.differentPercent}% pixels differ${sizeNote}`;
    }));
  }
  return lines.join('\n');
}
