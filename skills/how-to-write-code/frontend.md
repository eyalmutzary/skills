# Frontend and React

Apply the main skill plus these frontend rules.

## Component shape

- Keep the main component first and focused on the primary UI flow.
- Extract loading, empty, error, and similar states into named components.
- One small feature-specific state component may stay below the main component.
  When a file has multiple helper components, move them to separate files.
- Put a collection wrapper that owns `.map` in its own component file.
- For every collection rendered with `.map`, move the rendered item to its own
  component file.
- Move substantial stateful logic to a custom hook.
- Put all prop and state types in `types.ts`, including types for local
  components; use `constants.ts` when there are more than two constants.

## Rendering

- Render Vibe components or focused custom components, not raw HTML elements
  such as `div`, `section`, `ul`, or `li`.
- Use external SCSS. Do not use inline style objects.
- Keep JSX shallow. Extract a meaningful component when the visual flow becomes
  difficult to scan.

## Text

- Use translation keys for every user-facing heading, label, button, empty
  state, error, and message.
- Dynamic copy should select or interpolate translation keys rather than
  concatenate visible text.

## Preferred collection shape

```tsx
<UserRows
  users={users}
  onEdit={onEditUser}
  onDelete={onDeleteUser}
/>
```

`UserRows` belongs in `user-rows.tsx`; each mapped `UserRow` belongs in
`user-row.tsx`.
