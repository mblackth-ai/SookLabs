import { redirect } from "next/navigation";

/** Orphan mock agents page — send founders to the real LLM coordination surface. */
export default function AgentsPage() {
  redirect("/hq/automation");
}
