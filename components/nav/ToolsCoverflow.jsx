"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

const STEP_DESKTOP = 300;
const STEP_MOBILE = 248;
const DRAG_THRESHOLD = 8;
const WHEEL_THRESHOLD = 48;
/** Slow follow — cards ease behind the cursor (~650–900ms). */
const LERP_HOVER = 3.4;
const LERP_SNAP = 4.2;
const LERP_TOUCH = 9;
const REDUCED_LERP = 40;
const MAX_TILT = 1.6;

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

function useDesktopPointer() {
  const [desktop, setDesktop] = useState(true);
  useEffect(() => {
    const hover = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setDesktop(hover.matches);
    sync();
    hover.addEventListener("change", sync);
    return () => hover.removeEventListener("change", sync);
  }, []);
  return desktop;
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
  const desktop = useDesktopPointer();
  const step = desktop ? STEP_DESKTOP : STEP_MOBILE;

  const trackRef = useRef(null);
  const offsetRef = useRef(0);
  const targetRef = useRef(0);
  const settlingRef = useRef(false);
  const hoveringRef = useRef(false);
  const draggingRef = useRef(false);
  const rafRef = useRef(0);
  const lastTsRef = useRef(0);
  const pointerIdRef = useRef(null);
  const dragOriginRef = useRef({ x: 0, y: 0, offset: 0 });
  const movedRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, t: 0 });
  const velocityRef = useRef(0);
  const wheelAccRef = useRef(0);
  const wheelLockRef = useRef(false);
  const stepRef = useRef(step);
  const lerpModeRef = useRef("snap"); // "hover" | "snap" | "touch"

  const [activeIndex, setActiveIndex] = useState(0);
  const [visual, setVisual] = useState({ offset: 0 });

  const count = tools.length;
  const total = count * step;

  useEffect(() => {
    const prev = stepRef.current;
    if (prev === step || count === 0) {
      stepRef.current = step;
      return;
    }
    const idx = nearestIndex(offsetRef.current, count, prev);
    offsetRef.current = idx * step;
    targetRef.current = offsetRef.current;
    settlingRef.current = false;
    stepRef.current = step;
    setVisual({ offset: offsetRef.current });
    setActiveIndex(idx);
  }, [step, count]);

  const syncActive = useCallback(
    (offset) => {
      const idx = nearestIndex(offset, count, step);
      setActiveIndex((prev) => (prev === idx ? prev : idx));
    },
    [count, step],
  );

  const paint = useCallback(() => {
    setVisual({ offset: offsetRef.current });
    syncActive(offsetRef.current);
  }, [syncActive]);

  const setTargetShortest = useCallback(
    (desiredNormalized) => {
      const current = normalizeOffset(offsetRef.current, total);
      const desired = normalizeOffset(desiredNormalized, total);
      const delta = wrapDelta(desired - current, total);
      targetRef.current = offsetRef.current + delta;
      settlingRef.current = true;
    },
    [total],
  );

  const snapToNearest = useCallback(() => {
    if (count === 0) return;
    const idx = nearestIndex(offsetRef.current, count, step);
    setTargetShortest(idx * step);
    lerpModeRef.current = "snap";
    velocityRef.current = 0;
  }, [count, step, setTargetShortest]);

  const centerIndex = useCallback(
    (index, { immediate = false } = {}) => {
      if (count === 0) return;
      const target = (((index % count) + count) % count) * step;
      setTargetShortest(target);
      lerpModeRef.current = desktop ? "snap" : "touch";
      velocityRef.current = 0;
      if (immediate || reduced) {
        offsetRef.current = targetRef.current;
        settlingRef.current = false;
        paint();
      }
    },
    [count, step, setTargetShortest, desktop, reduced, paint],
  );

  const stepBy = useCallback(
    (dir) => {
      if (count === 0) return;
      const idx = nearestIndex(targetRef.current, count, step);
      centerIndex(idx + dir);
    },
    [centerIndex, count, step],
  );

  /** Map cursor X across the track to a floating card position (infinite-friendly). */
  const scrubFromClientX = useCallback(
    (clientX) => {
      const el = trackRef.current;
      if (!el || count === 0) return;

      const rect = el.getBoundingClientRect();
      if (rect.width <= 0) return;

      // Soft edge padding so extremes are reachable without hugging the border
      const pad = Math.min(72, rect.width * 0.1);
      const x = Math.min(rect.width - pad, Math.max(pad, clientX - rect.left));
      const t = (x - pad) / (rect.width - pad * 2); // 0..1

      // Sweep through the full deck; slight overshoot keeps loop feeling open
      const floatIndex = t * count;
      setTargetShortest(floatIndex * step);
      lerpModeRef.current = "hover";
      settlingRef.current = true;
      velocityRef.current = 0;
    },
    [count, step, setTargetShortest],
  );

  useEffect(() => {
    const tick = (ts) => {
      rafRef.current = requestAnimationFrame(tick);
      const last = lastTsRef.current || ts;
      const dt = Math.min(0.033, (ts - last) / 1000);
      lastTsRef.current = ts;

      if (draggingRef.current) {
        paint();
        return;
      }

      if (!desktop && !settlingRef.current && Math.abs(velocityRef.current) > 0.03) {
        offsetRef.current += velocityRef.current * dt * 1000;
        velocityRef.current *= Math.pow(0.88, dt * 60);
        if (Math.abs(velocityRef.current) < 0.05) {
          velocityRef.current = 0;
          snapToNearest();
        }
        paint();
        return;
      }

      if (settlingRef.current) {
        let k = LERP_SNAP;
        if (reduced) k = REDUCED_LERP;
        else if (lerpModeRef.current === "hover") k = LERP_HOVER;
        else if (lerpModeRef.current === "touch") k = LERP_TOUCH;

        const target = targetRef.current;
        const alpha = 1 - Math.exp(-k * dt);
        offsetRef.current += (target - offsetRef.current) * alpha;

        const closeEnough = lerpModeRef.current === "hover" ? 0.8 : 0.3;
        if (Math.abs(offsetRef.current - target) < closeEnough) {
          if (lerpModeRef.current !== "hover") {
            offsetRef.current = target;
            settlingRef.current = false;
          }
        }
        paint();
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [paint, snapToNearest, desktop, reduced]);

  const onWheel = useCallback(
    (e) => {
      if (!trackRef.current?.contains(e.target)) return;
      e.preventDefault();
      if (wheelLockRef.current) return;

      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      wheelAccRef.current += delta;
      if (Math.abs(wheelAccRef.current) < WHEEL_THRESHOLD) return;

      const dir = wheelAccRef.current > 0 ? 1 : -1;
      wheelAccRef.current = 0;
      wheelLockRef.current = true;
      hoveringRef.current = false;
      stepBy(dir);

      window.setTimeout(() => {
        wheelLockRef.current = false;
      }, reduced ? 140 : 420);
    },
    [stepBy, reduced],
  );

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  const onTrackPointerEnter = (e) => {
    if (!desktop || e.pointerType === "touch") return;
    hoveringRef.current = true;
    scrubFromClientX(e.clientX);
  };

  const onTrackPointerMove = (e) => {
    if (desktop && e.pointerType !== "touch" && hoveringRef.current && !draggingRef.current) {
      scrubFromClientX(e.clientX);
      return;
    }

    if (!draggingRef.current || e.pointerId !== pointerIdRef.current) return;
    const dx = e.clientX - dragOriginRef.current.x;
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(e.clientY - dragOriginRef.current.y) > DRAG_THRESHOLD) {
      movedRef.current = true;
    }
    offsetRef.current = dragOriginRef.current.offset - dx;
    const now = performance.now();
    const dt = Math.max(1, now - lastPointerRef.current.t);
    const vx = ((e.clientX - lastPointerRef.current.x) / dt) * -12;
    velocityRef.current = Math.max(-1.8, Math.min(1.8, vx));
    lastPointerRef.current = { x: e.clientX, t: now };
    paint();
  };

  const onTrackPointerLeave = (e) => {
    if (!desktop || e.pointerType === "touch") return;
    // Leaving into a child card still fires leave on track in some browsers — ignore if still inside
    if (trackRef.current?.contains(e.relatedTarget)) return;
    hoveringRef.current = false;
    snapToNearest();
  };

  const onPointerDown = (e) => {
    if (desktop || e.pointerType === "mouse") return;
    pointerIdRef.current = e.pointerId;
    draggingRef.current = true;
    settlingRef.current = false;
    movedRef.current = false;
    velocityRef.current = 0;
    dragOriginRef.current = { x: e.clientX, y: e.clientY, offset: offsetRef.current };
    lastPointerRef.current = { x: e.clientX, t: performance.now() };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const endDrag = (e) => {
    if (!draggingRef.current || (e && e.pointerId !== pointerIdRef.current)) return;
    draggingRef.current = false;
    pointerIdRef.current = null;
    if (Math.abs(velocityRef.current) > 0.25 && !reduced) {
      window.setTimeout(() => {
        if (!draggingRef.current) snapToNearest();
      }, 140);
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
      // On desktop, cursor already scrubs — click neighbour gently centres then user clicks again
      if (!desktop) centerIndex(index);
      else centerIndex(index);
      return;
    }
    if (tool.status === "live" && tool.href) {
      onNavigate?.();
      return;
    }
    e.preventDefault();
  };

  const cardStyle = (index) => {
    const base = index * step;
    const delta = wrapDelta(base - normalizeOffset(visual.offset, total), total);
    const dist = Math.abs(delta) / step;
    const t = Math.min(dist, 2);

    let scale = 1.05;
    let opacity = 1;
    let rotateY = 0;
    let z = 3;

    if (t >= 0.12) {
      if (t < 1) {
        const k = (t - 0.12) / 0.88;
        scale = 1.05 - k * (1.05 - 0.94);
        opacity = 1 - k * 0.28;
        rotateY = (delta > 0 ? -1 : 1) * (MAX_TILT * k);
        z = 2;
      } else {
        const k = Math.min(1, (t - 1) / 1);
        scale = 0.94 - k * (0.94 - 0.88);
        opacity = 0.72 - k * 0.22;
        rotateY = (delta > 0 ? -1 : 1) * MAX_TILT;
        z = 1;
      }
    }

    if (reduced) {
      scale = t < 0.5 ? 1.03 : 0.92;
      rotateY = 0;
      opacity = t < 0.5 ? 1 : 0.58;
    }

    const active = dist < 0.4;
    return {
      transform: `translate3d(calc(-50% + ${delta}px), -50%, 0) rotateY(${rotateY}deg) scale(${scale})`,
      opacity,
      zIndex: z + (active ? 2 : 0),
    };
  };

  return (
    <div
      className={`sl-tools-coverflow${desktop ? " is-desktop" : " is-touch"}${reduced ? " is-reduced" : ""}${
        className ? ` ${className}` : ""
      }`}
      role="listbox"
      aria-label="SookLabs tools carousel"
      aria-activedescendant={tools[activeIndex] ? `sl-tool-card-${tools[activeIndex].id}` : undefined}
    >
      <div
        ref={trackRef}
        className="sl-tools-coverflow-track"
        onPointerEnter={onTrackPointerEnter}
        onPointerMove={onTrackPointerMove}
        onPointerLeave={onTrackPointerLeave}
        onPointerDown={onPointerDown}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
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
                onFocus={() => centerIndex(index)}
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
              onFocus={() => centerIndex(index)}
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
      <p className="sl-tools-coverflow-hint">
        {desktop
          ? "Move cursor left or right to browse · click centre card to open"
          : "Swipe to browse · tap centre card to open"}
      </p>
    </div>
  );
}
