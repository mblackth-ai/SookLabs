# HQ Growth Continuity Acceptance

**As of:** 2 Oct 2026 (Asia/Bangkok)

This document converts two founder pain points into bounded HQ work:

1. scheduled social content silently running out;
2. RoastMyOpSec going inactive between manual content pushes.

## A. Social coverage alert

### Goal

For every managed brand/channel, HQ should answer:

- how many scheduled posts remain;
- the date/time of the last scheduled post;
- estimated days of coverage at the current cadence;
- whether the lane is healthy, low, empty or unknown;
- who owns replenishment.

### Truth rule

Do not infer schedule inventory from mock data. If a platform/calendar source is not connected, show `unknown` or `manual`.

### Suggested thresholds

Thresholds are configuration, not universal truth:

- healthy: more than 7 days of scheduled coverage;
- low: 3 to 7 days;
- urgent: less than 3 days;
- empty: 0 scheduled future posts.

The founder may change thresholds per brand.

### Attention event

When a lane crosses a configured threshold, emit one deduplicated HQ attention item:

```yaml
attention:
  type: social_coverage_low
  brand: sooklabs
  channel: linkedin
  coverage_days: 2
  owner: content
  requires_mark: false
```

Do not repeatedly notify on every poll. Re-notify only on state change, material deterioration or a configured reminder window.

## B. RoastMyOpSec security content loop

### Goal

Keep RoastMyOpSec useful and current without pretending it has a live intelligence feed before one exists.

### Slice 1 — Read-only alert carousel

Cursor owns implementation after the current critical-path work permits it.

Acceptance:

- use attributed public security sources;
- store source URL, title, published date, retrieved date and short normalized summary;
- show freshness visibly;
- no fabricated "live" badge;
- deduplicate the same vulnerability/event across sources;
- support API key exposure, web OPSEC, dependency/security incidents and adjacent operational-security topics;
- clicking a card opens source context before any editorial derivative.

### Slice 2 — Weekly Claude synthesis

Claude receives a bounded source packet, not arbitrary full-web copy.

Claude output must be original analysis/synthesis with citations/links. Do not lightly rewrite or reproduce full news articles.

Suggested output:

- what happened;
- why it matters operationally;
- who is affected;
- practical defensive checks;
- source links;
- confidence/uncertainty where relevant.

### Slice 3 — Recurring queue

The Butler/automation layer creates the weekly work item and evidence receipt. It may draft automatically, but publishing remains behind the configured approval policy.

## C. Founder exception model

HQ is successful when Mark no longer discovers gaps by manually visiting every Facebook page, Threads account or repository.

Mark should be pulled in for:

- approval gates;
- blockers only he can resolve;
- social/content lanes approaching configured depletion;
- broken or stale integrations;
- material contradictions between reported state and source-of-truth evidence.

Everything else should remain visible but quiet.
