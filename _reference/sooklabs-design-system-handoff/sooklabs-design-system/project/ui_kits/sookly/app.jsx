// Sookly inbox app
const { Ico: K, CH: CHN, ST: STS, SEED: DATA, AI_SUGGEST: AIS } = window;

function Rail({ active, setActive }) {
  const items = [
    { id: "all", icon: K.inbox, label: "All inboxes" },
    { id: "line", icon: K.dot, label: "LINE" },
    { id: "fb", icon: K.dot, label: "Messenger" },
    { id: "wa", icon: K.dot, label: "WhatsApp" },
    { id: "web", icon: K.dot, label: "Website" },
  ];
  return (
    <div style={{ width: 64, flex: "none", background: "var(--bg-void)", borderRight: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0", gap: 6 }}>
      <img src="../../assets/sooklabs-glyph.png" alt="Sookly" style={{ width: 34, height: 34, borderRadius: 9, marginBottom: 14 }} />
      {items.map((it) => {
        const on = active === it.id;
        const tint = it.id !== "all" ? CHN[it.id].c : "var(--accent-glow)";
        return (
          <button key={it.id} title={it.label} onClick={() => setActive(it.id)}
            style={{ width: 42, height: 42, borderRadius: 12, display: "grid", placeItems: "center", cursor: "pointer", border: "1px solid transparent",
              background: on ? "var(--surface-hover)" : "transparent", color: on ? tint : "var(--text-muted)",
              transition: "background .2s, color .2s" }}>
            <it.icon s={it.id === "all" ? 20 : 13} w={it.id === "all" ? 1.75 : 2} />
          </button>
        );
      })}
      <div style={{ marginTop: "auto", display: "grid", placeItems: "center", width: 42, height: 42, borderRadius: 12, color: "var(--text-muted)", cursor: "pointer" }} title="Settings"><K.settings s={19} /></div>
    </div>
  );
}

function ConvList({ list, sel, setSel, filter, setFilter, query, setQuery }) {
  const tabs = [["open", "Open"], ["assigned", "Assigned"], ["booked", "Done"]];
  return (
    <div style={{ width: 332, flex: "none", borderRight: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", background: "var(--bg-page)" }}>
      <div style={{ padding: "18px 18px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>Inbox</h1>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-faint)" }}>{list.filter(c => c.unread).length} unread</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 12px", height: 38, background: "var(--surface-inset)", border: "1px solid var(--border-default)", borderRadius: 11 }}>
          <span style={{ color: "var(--text-muted)", display: "flex" }}><K.search s={16} /></span>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search conversations…"
            style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none", color: "var(--text-primary)", fontFamily: "var(--font-body)", fontSize: 13.5 }} />
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
          {tabs.map(([k, lbl]) => {
            const on = filter === k;
            return <button key={k} onClick={() => setFilter(k)}
              style={{ flex: 1, padding: "7px 0", fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 600, borderRadius: 9, cursor: "pointer",
                border: "1px solid", borderColor: on ? "var(--border-strong)" : "transparent", background: on ? "var(--surface-card)" : "transparent",
                color: on ? "var(--text-primary)" : "var(--text-muted)" }}>{lbl}</button>;
          })}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 10px 12px" }}>
        {list.length === 0 && <div style={{ textAlign: "center", color: "var(--text-faint)", fontFamily: "var(--font-body)", fontSize: 13, padding: "32px 0" }}>No conversations here.</div>}
        {list.map((c) => {
          const ch = CHN[c.ch], st = STS[c.status], on = sel === c.id;
          return (
            <button key={c.id} onClick={() => setSel(c.id)}
              style={{ width: "100%", textAlign: "left", display: "flex", gap: 12, padding: "12px", borderRadius: 13, cursor: "pointer", marginBottom: 2,
                border: "1px solid", borderColor: on ? "var(--border-default)" : "transparent", background: on ? "var(--surface-card)" : "transparent", transition: "background .15s" }}>
              <span style={{ position: "relative", flex: "none" }}>
                <span style={{ width: 38, height: 38, borderRadius: 11, display: "grid", placeItems: "center", background: ch.bg, color: ch.c, fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 500 }}>{c.name[0]}</span>
                <span style={{ position: "absolute", bottom: -2, right: -2, width: 13, height: 13, borderRadius: 999, background: ch.c, border: "2px solid var(--bg-page)" }} />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: c.unread ? 700 : 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-faint)", flex: "none" }}>{c.time}</span>
                </span>
                <span style={{ display: "block", fontFamily: "var(--font-body)", fontSize: 12.5, color: c.unread ? "var(--text-secondary)" : "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 3 }}>{c.preview}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 7 }}>
                  <span style={{ width: 5, height: 5, borderRadius: 999, background: st.c }} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: st.c }}>{st.label}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Thread({ conv, onSend, onBook }) {
  const [draft, setDraft] = React.useState("");
  const [usedAI, setUsedAI] = React.useState(false);
  const endRef = React.useRef(null);
  React.useEffect(() => { setDraft(""); setUsedAI(false); }, [conv && conv.id]);
  React.useEffect(() => { if (endRef.current) endRef.current.scrollTop = endRef.current.scrollHeight; }, [conv && conv.msgs.length]);

  if (!conv) return <div style={{ flex: 1, display: "grid", placeItems: "center", color: "var(--text-faint)", fontFamily: "var(--font-body)" }}>Select a conversation</div>;
  const ch = CHN[conv.ch], st = STS[conv.status];
  const suggestion = AIS[conv.id];

  const send = () => { if (!draft.trim()) return; onSend(conv.id, draft.trim()); setDraft(""); setUsedAI(false); };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "var(--bg-page)" }}>
      {/* header */}
      <div style={{ height: 64, flex: "none", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 38, height: 38, borderRadius: 11, display: "grid", placeItems: "center", background: ch.bg, color: ch.c, fontFamily: "var(--font-mono)", fontWeight: 500 }}>{conv.name[0]}</span>
          <div>
            <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15, color: "var(--text-primary)" }}>{conv.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 2 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: ch.c }}>{ch.label}</span>
              <span style={{ width: 3, height: 3, borderRadius: 999, background: "var(--text-faint)" }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-faint)" }}>Patient enquiry</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 999, background: "rgba(174,187,206,0.08)" }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: st.c }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.06em", textTransform: "uppercase", color: st.c }}>{st.label}</span>
          </span>
          <button onClick={() => onBook(conv.id)} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 10, cursor: "pointer", border: "1px solid var(--border-default)", background: "var(--surface-card)", color: "var(--text-primary)", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600 }}>
            <K.calendar s={15} /> Mark booked
          </button>
        </div>
      </div>
      {/* messages */}
      <div ref={endRef} style={{ flex: 1, overflowY: "auto", padding: "26px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 4 }}>Today</div>
        {conv.msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.from === "me" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "72%", padding: "11px 15px", borderRadius: m.from === "me" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              background: m.from === "me" ? "var(--accent)" : "var(--surface-card)", color: m.from === "me" ? "#fff" : "var(--text-secondary)",
              border: m.from === "me" ? "none" : "1px solid var(--border-subtle)", boxShadow: m.from === "me" ? "0 4px 16px rgba(47,124,240,0.25)" : "none" }}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.45 }}>{m.t}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, marginTop: 5, opacity: 0.6, textAlign: "right" }}>{m.at}</div>
            </div>
          </div>
        ))}
      </div>
      {/* AI receptionist suggestion */}
      {suggestion && !usedAI && (
        <div style={{ margin: "0 22px 10px", padding: "12px 14px", borderRadius: 14, background: "rgba(52,207,234,0.07)", border: "1px solid rgba(52,207,234,0.22)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
            <span style={{ color: "var(--accent-glow)", display: "flex" }}><K.spark s={14} /></span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent-glow)" }}>AI receptionist · suggested reply</span>
          </div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 10 }}>{suggestion}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setDraft(suggestion); setUsedAI(true); }} style={{ padding: "7px 13px", borderRadius: 9, cursor: "pointer", border: "none", background: "var(--accent-glow)", color: "var(--bg-void)", fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 700 }}>Use reply</button>
            <button onClick={() => setUsedAI(true)} style={{ padding: "7px 13px", borderRadius: 9, cursor: "pointer", border: "1px solid var(--border-default)", background: "transparent", color: "var(--text-muted)", fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 600 }}>Dismiss</button>
          </div>
        </div>
      )}
      {/* composer */}
      <div style={{ flex: "none", borderTop: "1px solid var(--border-subtle)", padding: "14px 22px 18px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, padding: "8px 8px 8px 16px", background: "var(--surface-inset)", border: "1px solid var(--border-default)", borderRadius: 14 }}>
          <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={1} placeholder="Write a reply…"
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            style={{ flex: 1, resize: "none", background: "transparent", border: "none", outline: "none", color: "var(--text-primary)", fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.5, padding: "6px 0", maxHeight: 90 }} />
          <button onClick={send} disabled={!draft.trim()} style={{ width: 40, height: 40, flex: "none", borderRadius: 11, display: "grid", placeItems: "center", cursor: draft.trim() ? "pointer" : "default",
            border: "none", background: draft.trim() ? "var(--accent)" : "var(--surface-hover)", color: draft.trim() ? "#fff" : "var(--text-faint)", transition: "background .2s" }}>
            <K.send s={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [convs, setConvs] = React.useState(DATA);
  const [active, setActive] = React.useState("all");
  const [filter, setFilter] = React.useState("open");
  const [query, setQuery] = React.useState("");
  const [sel, setSel] = React.useState(1);

  const list = convs.filter(c => {
    if (active !== "all" && c.ch !== active) return false;
    if (filter === "open" && c.status === "booked") return false;
    if (filter === "assigned" && c.status !== "assigned") return false;
    if (filter === "booked" && c.status !== "booked") return false;
    if (query && !(c.name + c.preview).toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });
  const conv = convs.find(c => c.id === sel) || null;

  const onSend = (id, t) => setConvs(cs => cs.map(c => c.id === id ? { ...c, unread: false, status: c.status === "new" ? "assigned" : c.status, preview: t, time: "now",
    msgs: [...c.msgs, { from: "me", t, at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }] } : c));
  const onBook = (id) => setConvs(cs => cs.map(c => c.id === id ? { ...c, status: "booked" } : c));

  return (
    <div style={{ height: "100vh", display: "flex", overflow: "hidden", background: "var(--bg-void)" }}>
      <Rail active={active} setActive={setActive} />
      <ConvList list={list} sel={sel} setSel={setSel} filter={filter} setFilter={setFilter} query={query} setQuery={setQuery} />
      <Thread conv={list.find(c => c.id === sel) ? conv : (list[0] || conv)} onSend={onSend} onBook={onBook} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
