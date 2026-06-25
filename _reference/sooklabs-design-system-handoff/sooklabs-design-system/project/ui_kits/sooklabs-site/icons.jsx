// Shared Lucide-style line icons (1.75 stroke, currentColor) for the SookLabs kit.
// Exported to window for use across the kit's JSX files.
function Icon({ d, size = 20, stroke = 1.75, children, viewBox = "0 0 24 24", style }) {
  return (
    <svg width={size} height={size} viewBox={viewBox} fill="none" stroke="currentColor"
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>
      {children || <path d={d} />}
    </svg>
  );
}

const Icons = {
  // Products
  Sookly: (p) => <Icon {...p}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></Icon>,
  Seos: (p) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M12 2a10 10 0 0 1 10 10"/><path d="M12 6a6 6 0 0 1 6 6"/><path d="M2 12a10 10 0 0 0 10 10"/></Icon>,
  Roast: (p) => <Icon {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></Icon>,
  Community: (p) => <Icon {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Icon>,
  // UI
  Arrow: (p) => <Icon {...p}><path d="M5 12h14M13 6l6 6-6 6"/></Icon>,
  Menu: (p) => <Icon {...p}><path d="M3 6h18M3 12h18M3 18h18"/></Icon>,
  Close: (p) => <Icon {...p}><path d="M18 6 6 18M6 6l12 12"/></Icon>,
  Plus: (p) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>,
  Inbox: (p) => <Icon {...p}><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></Icon>,
  Workflow: (p) => <Icon {...p}><rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="15" width="6" height="6" rx="1"/><path d="M6 9v3a3 3 0 0 0 3 3h6"/></Icon>,
  Clock: (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>,
  Layers: (p) => <Icon {...p}><path d="m12 2 9 5-9 5-9-5 9-5z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/></Icon>,
  Brain: (p) => <Icon {...p}><path d="M12 5a3 3 0 0 0-5.9-.6 3 3 0 0 0-1.9 5A2.5 2.5 0 0 0 4 14a3 3 0 0 0 4 2.8A2.5 2.5 0 0 0 12 19zM12 5a3 3 0 0 1 5.9-.6 3 3 0 0 1 1.9 5A2.5 2.5 0 0 1 20 14a3 3 0 0 1-4 2.8A2.5 2.5 0 0 1 12 19z"/></Icon>,
  Trend: (p) => <Icon {...p}><path d="M22 7 13.5 15.5l-5-5L2 17"/><path d="M16 7h6v6"/></Icon>,
  Check: (p) => <Icon {...p}><path d="M20 6 9 17l-5-5"/></Icon>,
  Dot: (p) => <Icon {...p} viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"/></Icon>,
};

Object.assign(window, { Icon, Icons });
