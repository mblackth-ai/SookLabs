Square icon-only control — use in toolbars, inbox rows, and compact headers where a labelled button would be too heavy. Always pass `label` for accessibility.

```jsx
<IconButton label="Search" variant="ghost"><SearchIcon /></IconButton>
<IconButton label="New chat" variant="accent"><PlusIcon /></IconButton>
<IconButton label="Settings" variant="solid" size="sm"><GearIcon /></IconButton>
```

Variants: `ghost` (default, transparent), `solid` (card surface), `accent` (cyan tint). Sizes: `sm | md | lg`. Children should be one ~18px icon — Lucide SVGs are the house set.
