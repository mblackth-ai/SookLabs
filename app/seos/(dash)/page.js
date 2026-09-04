import { redirect } from "next/navigation";
import { seosPath } from "@/lib/seos/paths";

export default function SeosHomePage() {
  redirect(seosPath("/command-center"));
}
