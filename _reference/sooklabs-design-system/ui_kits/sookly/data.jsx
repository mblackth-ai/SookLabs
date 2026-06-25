// Sookly — omnichat + AI receptionist inbox. Self-contained interactive kit.

function I({ d, s = 20, w = 1.75, c, vb = "0 0 24 24" }) {
  return <svg width={s} height={s} viewBox={vb} fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">{c || <path d={d} />}</svg>;
}
const Ico = {
  inbox: (p) => <I {...p} c={<><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></>} />,
  send: (p) => <I {...p} c={<><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></>} />,
  search: (p) => <I {...p} c={<><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></>} />,
  spark: (p) => <I {...p} c={<path d="M12 3v3m0 12v3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1M3 12h3m12 0h3M5.6 18.4l2.1-2.1m8.6-8.6 2.1-2.1"/>} />,
  user: (p) => <I {...p} c={<><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/></>} />,
  calendar: (p) => <I {...p} c={<><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>} />,
  settings: (p) => <I {...p} c={<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>} />,
  check: (p) => <I {...p} c={<path d="M20 6 9 17l-5-5"/>} />,
  dot: (p) => <I {...p} c={<circle cx="12" cy="12" r="9"/>} />,
  bolt: (p) => <I {...p} c={<path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z"/>} />,
};

// Channel meta — restrained tints, not brand-loud
const CH = {
  line: { label: "LINE", c: "var(--success-400)", bg: "rgba(33,184,132,0.14)" },
  fb: { label: "Messenger", c: "var(--blue-400)", bg: "rgba(47,124,240,0.14)" },
  wa: { label: "WhatsApp", c: "var(--cyan-400)", bg: "rgba(52,207,234,0.13)" },
  web: { label: "Website", c: "var(--violet-400)", bg: "rgba(124,99,238,0.15)" },
};
const ST = {
  new: { label: "New", c: "var(--cyan-400)" },
  assigned: { label: "Assigned", c: "var(--warning-400)" },
  booked: { label: "Booked", c: "var(--success-400)" },
};

const SEED = [
  { id: 1, ch: "line", name: "Naphat K.", preview: "What times are available this week?", time: "2m", status: "new", unread: true,
    msgs: [{ from: "them", t: "Hi, what times are available this week?", at: "09:41" }, { from: "them", t: "Looking for an afternoon if possible.", at: "09:41" }] },
  { id: 2, ch: "fb", name: "Sunisa T.", preview: "Is Dr. Aom available on Monday?", time: "14m", status: "assigned",
    msgs: [{ from: "them", t: "Is Dr. Aom available on Monday morning?", at: "09:28" }, { from: "me", t: "Let me check the schedule for you.", at: "09:30" }] },
  { id: 3, ch: "wa", name: "Maria L.", preview: "I'd like to book a check-up please", time: "1h", status: "booked",
    msgs: [{ from: "them", t: "I'd like to book a check-up please.", at: "08:50" }, { from: "me", t: "Booked you for Thursday 2pm. See you then.", at: "08:54" }] },
  { id: 4, ch: "web", name: "James W.", preview: "First-time patient — need information", time: "3h", status: "new", unread: true,
    msgs: [{ from: "them", t: "First-time patient here. What do I need to bring?", at: "07:12" }] },
  { id: 5, ch: "line", name: "Areeya P.", preview: "Thank you, see you tomorrow", time: "5h", status: "booked",
    msgs: [{ from: "them", t: "Thank you, see you tomorrow!", at: "05:30" }] },
];

const AI_SUGGEST = {
  1: "We have Tuesday 2:00pm and Thursday 4:30pm open this week. Would either suit you?",
  2: "Dr. Aom has 9:30am and 11:00am free on Monday. Shall I reserve one?",
  4: "Welcome! Please bring a photo ID and any prior records. Your first visit takes about 30 minutes.",
};

Object.assign(window, { Ico, CH, ST, SEED, AI_SUGGEST });
