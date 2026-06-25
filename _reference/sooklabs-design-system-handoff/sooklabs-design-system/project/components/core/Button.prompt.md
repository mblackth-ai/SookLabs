Primary action control for SookLabs — use for the main action in any view; cyan-fill `primary` for the single most important action, `secondary` (matte glass) for adjacent actions, `ghost` for low-emphasis, `danger` for calm destructive actions.

```jsx
<Button variant="primary" iconRight={<ArrowIcon />}>Explore Sookly</Button>
<Button variant="secondary" size="sm">Request snapshot</Button>
<Button variant="ghost">Cancel</Button>
<Button variant="danger" loading>Removing…</Button>
```

Variants: `primary | secondary | ghost | danger`. Sizes: `sm | md | lg`. Props: `iconLeft`, `iconRight`, `fullWidth`, `loading`, `disabled`, `href` (renders an `<a>`). On dark surfaces, never place two primary buttons side by side — pair primary with secondary or ghost.
