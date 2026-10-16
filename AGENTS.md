<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# SookLabs HQ / MCP / swarm work

Before changing HQ, the swarm room, agent routing, MCP, control-plane state, deployment evidence, or related orchestration, read:

1. `docs/HQ-MCP-CONTROL-PLANE.md`
2. `docs/HQ-AGENTS.md`

The control-plane document contains the current shared operating direction and acceptance target. Treat it as architecture context, not as permission to bypass tests, review, deployment, credential, billing, or production approval gates.

## Cross-repository direction (proposed on documentation branch)

Read `docs/architecture/SOOKLABS_SYSTEM_CONTRACT.md` and `docs/architecture/DOCUMENT_AUTHORITY_REGISTER.md` before changing cross-system responsibilities, client portals, connectors, reporting or HQ Rooms. The contract is proposed until reviewed and merged; it must not be cited as production acceptance. For the RDUSA pilot use `docs/acceptance/RDUSA_VERTICAL_SLICE.md` alongside each domain's current acceptance rules.

Preserve `docs/HQ-MCP-CONTROL-PLANE.md` as HQ's domain architecture. Never rewrite historical evidence, self-approve architectural exceptions, or mark provider integration Connected without a verified probe. File any incompatible requirement as a decision request referencing both sources.
