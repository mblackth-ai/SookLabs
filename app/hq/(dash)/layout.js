import { Sidebar } from "@/components/hq/Sidebar";

export default function DashLayout({ children }) {
  return (
    <div style={{ display: "flex", width: "100%", height: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, height: "100vh", overflowY: "auto", background: "var(--bg-base)" }}>{children}</main>
    </div>
  );
}
