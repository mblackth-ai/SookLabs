Quiet on/off toggle. Off shows an inset track; on fills with the accent and a soft glow.

```jsx
<Switch checked={on} onChange={setOn} label="Auto-route enquiries" />
```

Controlled — pass `checked` and `onChange(next)`. Omit `label` for a bare switch in dense rows.
