# Cross-repo agent relay index

Status: PROPOSED discovery index; verify each linked PR's current head and comments before acting.  
Placement rules: [README.md](./README.md)  
Analysis and improvement gate: [agent relay thesis](../SOOKLABS_AGENT_SWARM_LEARNING_GATE_THESIS.md)

| Front | Current discovery link | Existing product records |
| --- | --- | --- |
| SookLabs HQ | [Operating model PR #9](https://github.com/mblackth-ai/SookLabs/pull/9); [relay thesis and placement PR #10](https://github.com/mblackth-ai/SookLabs/pull/10) | `docs/HQ-MCP-CONTROL-PLANE.md`, `docs/HQ-AGENTS.md` |
| Sookly | [Relay entrypoint PR #67](https://github.com/mblackth-ai/sookly-omnichat/pull/67); [Journey PR #64](https://github.com/mblackth-ai/sookly-omnichat/pull/64) for deployment/live acceptance; [cross-repo findings PR #65](https://github.com/mblackth-ai/sookly-omnichat/pull/65) | `sookly-control/agent-reports/`, `sookly-control/decision-log.md` |
| SEOS | [Relay entrypoint PR #7](https://github.com/mblackth-ai/SEOS/pull/7); [Social connect PR #5](https://github.com/mblackth-ai/SEOS/pull/5); [operating model PR #6](https://github.com/mblackth-ai/SEOS/pull/6) | `docs/agent/DECISIONS.md` |
| RDUSA | [Relay entrypoint PR #5](https://github.com/mblackth-ai/rdusa/pull/5); [Operating model PR #4](https://github.com/mblackth-ai/rdusa/pull/4) | `PROJECT_CONTROL_RDUSA_SEO_2026.md`, `article-harness/reports/` |

An index row is a route to evidence, not acceptance. The owning PR thread carries the live baton. When the PR changes, the HQ reconciler checks its exact head, CI, deployed SHA and product decision before updating this index. Do not make every specialist edit this shared file.
