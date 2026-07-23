"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

const STEP = 236;
const DRAG_THRESHOLD = 6;
const SETTLE_MS = 280;
const SPRING = { stiffness: 210, damping: 26, mass: 1 };
const REDUCED_SPRING = { stiffness: 900, damping: 60, mass: 1 };

function wrapDelta(delta, total) {
  const half = total / 2;
  let d = delta;
  while (d > half) d -= total;
  while (d < -half) d += total;
  return d;
}

function normalizeOffset(offset, total) {
  if (total <= 0) return 0;
  let o = offset % total;
  if (o < 0) o += total;
  return o;
}

function nearestIndex(offset, count, step) {
  if (count === 0) return 0;
  const total = count * step;
  const o = normalizeOffset(offset, total);
  return Math.round(o / step) % count;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduced;
}

function ToolStatus({ status, label }) {
  return (
    <span className={`sl-tools-status sl-tools-status--${status}`}>
      <span className="sl-tools-status-dot" aria-hidden />
      {label}
    </span>
  );
}

function actionLabel(tool) {
  if (tool.status === "live" && tool.href) return "Open tool";
  if (tool.status === "soon") return "Coming soon";
  return "Planned";
}

export function ToolsCoverflow({ tools, onNavigate, className = "" }) {
  const reduced = usePrefersReducedMotion();
  const trackRef = useRef(null);
  const offsetRef = useRef(0);
  const velocityRef = useRef(0);
  const targetRef = useRef(0);
  const settlingRef = useRef(false);
  const draggingRef = useRef(false);
  const pausedRef = useRef(false);
  const rafRef = useRef(0);
  const lastTsRef = useRef(0);
  const pointerIdRef = useRef(null);
  const dragOriginRef = useRef({ x: 0, y: 0, offset: 0 });
  const movedRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, t: 0 });
  const [activeIndex, setActiveIndex] = useState(0);
  const [visual, setVisual] = useState({ offset: 0 });

  const count = tools.length;
  const total = count * STEP;
  const spring = reduced ? REDUCED_SPRING : SPRING;

  const syncActive = useCallback(
    (offset) => {
      const idx = nearestIndex(offset, count, STEP);
      setActiveIndex((prev) => (prev === idx ? prev : idx));
    },
    [count],
  );

  const paint = useCallback(() => {
    setVisual({ offset: offsetRef.current });
    syncActive(offsetRef.current);
  }, [syncActive]);

  const snapToNearest = useCallback(() => {
    if (count === 0) return;
    const idx = nearestIndex(offsetRef.current, count, STEP);
    const current = normalizeOffset(offsetRef.current, total);
    let target = idx * STEP;
    const delta = wrapDelta(target - current, total);
    targetRef.current = offsetRef.current + delta;
    settlingRef.current = true;
    velocityRef.current = 0;
  }, [count, total]);

  const centerIndex = useCallback(
    (index) => {
      if (count === 0) return;
      const current = normalizeOffset(offsetRef.current, total);
      const target = ((index % count) + count) % count * STEP;
      const delta = wrapDelta(target - current, total);
      targetRef.current = offsetRef.current + delta;
      settlingRef.current = true;
      if (reduced) {
        offsetRef.current = targetRef.current;
        velocityRef.current = 0;
        settlingRef.current = false;
        paint();
        return;
      }
      velocityRef.current = 0;
    },
    [count, total, reduced, paint],
  );

  useEffect(() => {
    const tick = (ts) => {
      rafRef.current = requestAnimationFrame(tick);
      const last = lastTsRef.current || ts;
      const dt = Math.min(0.032, (ts - last) / 1000);
      lastTsRef.current = ts;

      if (draggingRef.current || pausedRef.current) {
        paint();
        return;
      }

      if (!settlingRef.current && Math.abs(velocityRef.current) > 0.02) {
        offsetRef.current += velocityRef.current * dt * 1000;
        const friction = reduced ? 0.72 : 0.92;
        velocityRef.current *= Math.pow(friction, dt * 60);
        if (Math.abs(velocityRef.current) < 0.04) {
          velocityRef.current = 0;
          snapToNearest();
        }
        paint();
        return;
      }

      if (settlingRef.current) {
        const { stiffness, damping, mass } = spring;
        const x = offsetRef.current;
        const v = velocityRef.current;
        const target = targetRef.current;
        const force = -stiffness * (x - target) - damping * v;
        const a = force / mass;
        velocityRef.current = v + a * dt;
        offsetRef.current = x + velocityRef.current * dt;

        const dist = Math.abs(offsetRef.current - target);
        if (dist < 0.35 && Math.abs(velocityRef.current) < 0.08) {
          offsetRef.current = target;
          velocityRef.current = 0;
          settlingRef.current = false;
        }
        paint();
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [paint, snapToNearest, spring, reduced]);

  const onWheel = useCallback(
    (e) => {
      if (!trackRef.current?.contains(e.target)) return;
      e.preventDefault();
      settlingRef.current = false;
      pausedRef.current = false;
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      offsetRef.current += delta;
      velocityRef.current = delta * 0.35;
      paint();
      window.clearTimeout(onWheel._t);
      onWheel._t = window.setTimeout(() => {
        if (!draggingRef.current) snapToNearest();
      }, reduced ? 40 : 90);
    },
    [paint, snapToNearest, reduced],
  );

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  const onPointerDown = (e) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    pointerIdRef.current = e.pointerId;
    draggingRef.current = true;
    settlingRef.current = false;
    pausedRef.current = false;
    movedRef.current = false;
    velocityRef.current = 0;
    dragOriginRef.current = { x: e.clientX, y: e.clientY, offset: offsetRef.current };
    lastPointerRef.current = { x: e.clientX, t: performance.now() };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!draggingRef.current || e.pointerId !== pointerIdRef.current) return;
    const dx = e.clientX - dragOriginRef.current.x;
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(e.clientY - dragOriginRef.current.y) > DRAG_THRESHOLD) {
      movedRef.current = true;
    }
    offsetRef.current = dragOriginRef.current.offset - dx;
    const now = performance.now();
    const dt = Math.max(1, now - lastPointerRef.current.t);
    const vx = ((e.clientX - lastPointerRef.current.x) / dt) * -16;
    velocityRef.current = vx;
    lastPointerRef.current = { x: e.clientX, t: now };
    paint();
  };

  const endDrag = (e) => {
    if (!draggingRef.current || (e && e.pointerId !== pointerIdRef.current)) return;
    draggingRef.current = false;
    pointerIdRef.current = null;
    const momentum = reduced ? 0 : velocityRef.current;
    if (Math.abs(momentum) > 0.35) {
      settlingRef.current = false;
      // let friction + snap handle it
      window.setTimeout(() => {
        if (!draggingRef.current && Math.abs(velocityRef.current) < 0.05) snapToNearest();
      }, SETTLE_MS);
    } else {
      snapToNearest();
    }
  };

  const handleCardActivate = (tool, index, e) => {
    if (movedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (index !== activeIndex) {
      e.preventDefault();
      e.stopPropagation();
      centerIndex(index);
      return;
    }
    if (tool.status === "live" && tool.href) {
      onNavigate?.();
      return;
    }
    e.preventDefault();
  };

  const cardStyle = (index) => {
    const base = index * STEP;
    const delta = wrapDelta(base - normalizeOffset(visual.offset, total), total);
    const dist = Math.abs(delta) / STEP;
    const t = Math.min(dist, 2.2);

    let scale = 1.06;
    let opacity = 1;
    let rotateY = 0;
    let z = 3;

    if (t >= 0.15) {
      if (t < 1.1) {
        const k = (t - 0.15) / 0.95;
        scale = 1.06 - k * (1.06 - 0.92);
        opacity = 1 - k * 0.38;
        rotateY = (delta > 0 ? -1 : 1) * (2 + k * 2);
        z = 2;
      } else {
        const k = Math.min(1, (t - 1.1) / 1.1);
        scale = 0.92 - k * (0.92 - 0.82);
        opacity = 0.62 - k * 0.28;
        rotateY = (delta > 0 ? -1 : 1) * (4 + k * 2);
        z = 1;
      }
    }

    if (reduced) {
      scale = t < 0.5 ? 1.04 : 0.9;
      rotateY = 0;
      opacity = t < 0.5 ? 1 : 0.55;
    }

    const active = dist < 0.45;
    return {
      transform: `translate3d(calc(-50% + ${delta}px), -50%, 0) rotateY(${rotateY}deg) scale(${scale})`,
      opacity,
      zIndex: z + (active ? 2 : 0),
      "--card-emphasis": active ? 1 : Math.max(0, 1 - t),
    };
  };

  return (
    <div
      className={`sl-tools-coverflow${className ? ` ${className}` : ""}${reduced ? " is-reduced" : ""}`}
      role="listbox"
      aria-label="SookLabs tools carousel"
      aria-activedescendant={tools[activeIndex] ? `sl-tool-card-${tools[activeIndex].id}` : undefined}
    >
      <div
        ref={trackRef}
        className="sl-tools-coverflow-track"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={() => {
          pausedRef.current = false;
        }}
      >
        <div className="sl-tools-coverflow-fade sl-tools-coverflow-fade--left" aria-hidden />
        <div className="sl-tools-coverflow-fade sl-tools-coverflow-fade--right" aria-hidden />

        {tools.map((tool, index) => {
          const isLive = tool.status === "live" && tool.href;
          const isActive = index === activeIndex;
          const statusKey =
            tool.status === "live" ? "live" : tool.status === "soon" ? "soon" : "planned";
          const style = cardStyle(index);
          const classNameCard = [
            "sl-tools-cover-card",
            isLive ? "sl-tools-cover-card--live" : "sl-tools-cover-card--disabled",
            isActive ? "is-active" : "is-neighbor",
            statusKey === "live" ? "is-live-status" : "",
          ]
            .filter(Boolean)
            .join(" ");

          const body = (
            <>
              <div className="sl-tools-item-head">
                <span className="sl-tools-item-title">{tool.title}</span>
                <ToolStatus status={statusKey} label={tool.statusLabel} />
              </div>
              <p className="sl-tools-item-desc">{tool.description}</p>
              <span className={`sl-tools-cover-action${isLive ? " is-live" : ""}`}>
                {actionLabel(tool)}
                {isLive ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : null}
              </span>
            </>
          );

          if (isLive) {
            return (
              <Link
                key={tool.id}
                id={`sl-tool-card-${tool.id}`}
                href={tool.href}
                role="option"
                aria-selected={isActive}
                className={classNameCard}
                style={style}
                tabIndex={isActive ? 0 : -1}
                onClick={(e) => handleCardActivate(tool, index, e)}
                onPointerEnter={() => {
                  if (isActive) pausedRef.current = true;
                }}
                onPointerLeave={() => {
                  pausedRef.current = false;
                }}
                onFocus={() => {
                  if (!isActive) centerIndex(index);
                  pausedRef.current = true;
                }}
                onBlur={() => {
                  pausedRef.current = false;
                }}
              >
                {body}
              </Link>
            );
          }

          return (
            <div
              key={tool.id}
              id={`sl-tool-card-${tool.id}`}
              role="option"
              aria-selected={isActive}
              aria-disabled="true"
              className={classNameCard}
              style={style}
              tabIndex={isActive ? 0 : -1}
              onClick={(e) => handleCardActivate(tool, index, e)}
              onPointerEnter={() => {
                if (isActive) pausedRef.current = true;
              }}
              onPointerLeave={() => {
                pausedRef.current = false;
              }}
              onFocus={() => {
                if (!isActive) centerIndex(index);
                pausedRef.current = true;
              }}
              onBlur={() => {
                pausedRef.current = false;
              }}
            >
              {body}
            </div>
          );
        })}
      </div>

      <div className="sl-tools-coverflow-dots" aria-hidden>
        {tools.map((tool, index) => (
          <button
            key={tool.id}
            type="button"
            className={`sl-tools-coverflow-dot${index === activeIndex ? " is-active" : ""}`}
            tabIndex={-1}
            onClick={() => centerIndex(index)}
            aria-label={`Show ${tool.title}`}
          />
        ))}
      </div>
      <p className="sl-tools-coverflow-hint">Drag, scroll, or swipe — centre card opens</p>
    </div>
  );
}
