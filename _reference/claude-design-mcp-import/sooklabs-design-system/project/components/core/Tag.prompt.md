Channel / category / filter chip — softer and larger than `Badge`. Use for chat channels, content filters, and topic labels.

```jsx
<Tag icon={<LineIcon />}>LINE</Tag>
<Tag interactive active>WhatsApp</Tag>
<Tag onRemove={() => drop(id)}>Clinics</Tag>
```

Props: `active` (cyan selected state), `interactive` (hover affordance), `icon` (leading node), `onRemove` (renders a removable ×). For terse system statuses use `Badge` instead.
