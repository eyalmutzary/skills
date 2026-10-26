"""Condense a Claude Code jsonl transcript into a readable text log, plus parts sized for one Haiku agent.

Usage: python3 -I condense.py <in.jsonl> <out.txt> [--since <ISO time>] [--result-chars 300] [--part-kb 100]

Writes <out.txt> (the whole log) and <out>.part01.txt, <out>.part02.txt, ... (split on line ends).
"""
import argparse, json

BYTES_PER_KB = 1000
KEY_TOOLS = ("SendMessage", "Agent", "Skill", "AskUserQuestion", "mcp__inbox__add_item")
USER_CHARS = 3000
ASSISTANT_CHARS = 1500
KEY_TOOL_CHARS = 1500
TOOL_CHARS = 400
SYSTEM_CHARS = 300
SYNTHETIC_MODEL = "<synthetic>"


def main():
    args = parse_args()
    lines = condense(args.source, since=args.since, result_chars=args.result_chars)

    write_file(args.destination, lines)
    print(args.destination, len(lines), "lines")
    for path in write_parts(args.destination, lines, args.part_kb * BYTES_PER_KB):
        print(path)


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("source")
    parser.add_argument("destination")
    parser.add_argument("--since")
    parser.add_argument("--result-chars", type=int, default=300)
    parser.add_argument("--part-kb", type=int, default=100)
    return parser.parse_args()


def condense(source, since, result_chars):
    lines = []
    current_model = None
    for entry in read_entries(source):
        if since and (entry.get("timestamp") or "") < since:
            continue
        model = entry_model(entry)
        if model and model != current_model:
            lines.append(f"[{short_time(entry)}] MODEL: {model}")
            current_model = model
        lines += format_entry(entry, result_chars)
    return lines


def write_parts(destination, lines, part_bytes):
    stem = destination.removesuffix(".txt")
    parts = [[]]
    part_size = 0
    for line in lines:
        line_size = len(line.encode()) + 1
        is_part_full = parts[-1] and part_size + line_size > part_bytes
        if is_part_full:
            parts.append([])
            part_size = 0
        parts[-1].append(line)
        part_size += line_size

    paths = [f"{stem}.part{index:02d}.txt" for index in range(1, len(parts) + 1)]
    for path, part in zip(paths, parts):
        write_file(path, part)
    return paths


def write_file(path, lines):
    with open(path, "w") as f:
        f.write("\n".join(lines))


def read_entries(path):
    with open(path, errors="replace") as f:
        for line in f:
            try:
                yield json.loads(line)
            except json.JSONDecodeError:
                continue


def format_entry(entry, result_chars):
    kind = entry.get("type")
    if kind not in ("user", "assistant", "system"):
        return []

    prefix = f"[{short_time(entry)}] {'sub ' if entry.get('isSidechain') else ''}"
    if kind == "system":
        return [f"{prefix}SYSTEM: {cut(entry['content'], SYSTEM_CHARS)}"] if entry.get("content") else []

    role = "USER" if kind == "user" else "ASSISTANT"
    text_chars = USER_CHARS if kind == "user" else ASSISTANT_CHARS
    content = (entry.get("message") or {}).get("content")
    if isinstance(content, str):
        return [f"{prefix}{role}: {cut(content, text_chars)}"]
    return [line for block in content or [] for line in format_block(block, prefix, role, text_chars, result_chars)]


def format_block(block, prefix, role, text_chars, result_chars):
    block_type = block.get("type")
    if block_type == "text":
        return [f"{prefix}{role}: {cut(block.get('text', ''), text_chars)}"]
    if block_type == "tool_use":
        name = block.get("name")
        limit = KEY_TOOL_CHARS if name in KEY_TOOLS else TOOL_CHARS
        return [f"{prefix}TOOL {name}: {cut(block.get('input', {}), limit)}"]
    if block_type == "tool_result":
        result = block.get("content")
        if isinstance(result, list):
            result = " ".join(part.get("text", "") for part in result if isinstance(part, dict))
        error = "ERROR " if block.get("is_error") else ""
        return [f"{prefix}RESULT {error}{cut(result or '', result_chars)}"]
    return []


def entry_model(entry):
    if entry.get("type") != "assistant":
        return None
    model = (entry.get("message") or {}).get("model")
    return None if model == SYNTHETIC_MODEL else model


def short_time(entry):
    return (entry.get("timestamp") or "")[5:19].replace("T", " ")


def cut(value, limit):
    text = value if isinstance(value, str) else json.dumps(value, ensure_ascii=False)
    text = text.replace("\n", " ⏎ ")
    return text if len(text) <= limit else text[:limit] + f" …[+{len(text) - limit}]"


if __name__ == "__main__":
    main()
