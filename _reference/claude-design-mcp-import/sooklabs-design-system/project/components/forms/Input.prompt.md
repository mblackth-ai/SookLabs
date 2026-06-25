Dark text field with a quiet blue focus ring. Supports label, leading icon, hint, and error.

```jsx
<Input label="Work email" placeholder="you@company.com" iconLeft={<MailIcon />} />
<Input label="Domain" error="Enter a valid URL" value={v} onChange={e => set(e.target.value)} />
```

`error` overrides `hint` and turns the border/text red. Omit `label` for inline/search fields (e.g. inbox search with `iconLeft`).
