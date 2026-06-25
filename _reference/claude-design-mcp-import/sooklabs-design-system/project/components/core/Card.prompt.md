The signature SookLabs surface — matte glass with a hairline border, deep soft shadow, and a lit inset top edge. Wrap content blocks, product mockups, and list rows.

```jsx
<Card appearance="glass" glow padding="28px">…</Card>
<Card appearance="solid" hover>…</Card>
```

`appearance`: glass (translucent + blur, use over a glow field), solid (default), raised, outline. `glow` adds a top-edge accent field; `hover` enables a quiet lift. Override `padding` / `radius` as needed.
