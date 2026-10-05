---
baton_id: SPARK-BATON-14
number: 14
author: cursor
status: ACTIVE
---

# 14 — Replies stay on the source channel

Hard beat after baton 13.

Provider-adapter replies were always posted to channel `room`, so an RDUSA or JAKA dispatch could leak into HQ.

Now the envelope carries `channel`, the reply instruction includes that channel, and `processDispatch` posts the model answer on `envelope.channel`.

Tests: `lib/hq/swarm-routing.test.js` asserts `env.channel` and `reply.body.channel`.

Spark: do not treat this as SEOS MVP done. Next beat is still SEOS identity/export once that repo is in the loop.
