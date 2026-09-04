import Link from "next/link";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/hq/TopBar";
import { Badge } from "@/components/hq/Badge";
import { ProjectDetailEditor } from "@/components/seos/ProjectDetailEditor";
import { getCommandCenterProject, getProjectRollup } from "@/lib/seos/command-center";
import { seosPath } from "@/lib/seos/paths";

export default async function CommandCenterProjectPage({ params }) {
  const { projectId } = await params;
  const project = await getCommandCenterProject(projectId);
  if (!project) notFound();

  const rollup = getProjectRollup(project);

  return (
    <div>
      <TopBar
        title={project.name}
        subtitle={project.tagline}
        crumbs={[
          { label: "Command Center", href: seosPath("/command-center") },
          { label: project.name },
        ]}
        actions={
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Badge variant="outline" size="sm">
              {rollup.connectionsActive}/{rollup.connectionsTotal} active
            </Badge>
            <Badge variant="neutral" size="sm">
              Connected {rollup.connectionsConnected}
            </Badge>
          </div>
        }
      />
      <div className="hq-page-content">
        <p className="hq-text-sm-secondary" style={{ marginBottom: 16 }}>
          <Link href={seosPath("/command-center")} className="hq-navlink">
            ← All projects
          </Link>
        </p>
        <ProjectDetailEditor project={project} />
      </div>
    </div>
  );
}
