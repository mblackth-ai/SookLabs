/* @ds-bundle: {"format":3,"namespace":"SookLabsDesignSystem_9aa38b","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Overline","sourcePath":"components/core/Overline.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"StatTile","sourcePath":"components/data/StatTile.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"}],"sourceHashes":{"components/_lib/styles.js":"59d6b39b4269","components/core/Badge.jsx":"054735f62aaf","components/core/Button.jsx":"3edf0b4020d3","components/core/Card.jsx":"86957d60bf47","components/core/IconButton.jsx":"3a1f00cd5197","components/core/Overline.jsx":"b3d82766f880","components/core/Tag.jsx":"791c5e4ba014","components/data/StatTile.jsx":"bac96f0c01db","components/forms/Input.jsx":"547d406526b7","components/forms/Switch.jsx":"67143d7dbf18","ui_kits/sooklabs-site/hero-scroll.jsx":"a4531a3777ca","ui_kits/sooklabs-site/icons.jsx":"3469ce57de5e","ui_kits/sooklabs-site/kit-ui.jsx":"d298976e8d05","ui_kits/sooklabs-site/sections-body.jsx":"4328bdcd6573","ui_kits/sooklabs-site/sections-hero.jsx":"49dcc0529676","ui_kits/sookly/app.jsx":"cb258c421b22","ui_kits/sookly/data.jsx":"96afaaca82a6"},"inlinedExternals":[],"unexposedExports":[{"name":"injectOnce","sourcePath":"components/_lib/styles.js"}]} */

(() => {

const __ds_ns = (window.SookLabsDesignSystem_9aa38b = window.SookLabsDesignSystem_9aa38b || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/_lib/styles.js
try { (() => {
// Shared helper: inject a component's CSS rules once per document.
// Lets self-contained components use real :hover / :active / :focus-visible
// states while still shipping only token CSS to consumers.
function injectOnce(id, css) {
  if (typeof document === "undefined") return;
  if (document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}
Object.assign(__ds_scope, { injectOnce });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/_lib/styles.js", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.sl-badge{display:inline-flex;align-items:center;gap:6px;height:22px;padding:0 10px;
  font-family:var(--font-mono);font-size:11px;font-weight:500;letter-spacing:.02em;line-height:1;
  border-radius:var(--radius-pill);border:1px solid var(--border);background:var(--surface-card);
  color:var(--text-secondary);white-space:nowrap;}
.sl-badge--dot::before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor;
  box-shadow:0 0 8px currentColor;}
.sl-badge--neutral{color:var(--text-secondary);}
.sl-badge--cyan{background:var(--tint-cyan);color:var(--cyan-300);border-color:rgba(43,210,224,.3);}
.sl-badge--success{background:var(--tint-success);color:var(--success-500);border-color:rgba(63,209,152,.3);}
.sl-badge--warning{background:var(--tint-warning);color:var(--warning-500);border-color:rgba(230,180,80,.3);}
.sl-badge--danger{background:var(--tint-danger);color:var(--danger-500);border-color:rgba(237,107,138,.3);}
.sl-badge--violet{background:var(--tint-violet);color:var(--violet-400);border-color:rgba(142,131,242,.3);}
.sl-badge--blue{background:var(--tint-blue);color:var(--blue-400);border-color:rgba(91,140,240,.3);}
`;
function Badge({
  tone = "neutral",
  dot = false,
  className = "",
  children,
  ...rest
}) {
  __ds_scope.injectOnce("sl-badge", CSS);
  const cls = ["sl-badge", `sl-badge--${tone}`, dot && "sl-badge--dot", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls
  }, rest), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.sl-btn{--_h:40px;--_px:18px;--_fs:14px;display:inline-flex;align-items:center;justify-content:center;
  gap:8px;height:var(--_h);padding:0 var(--_px);font-family:var(--font-sans);font-size:var(--_fs);
  font-weight:600;letter-spacing:.005em;line-height:1;border-radius:var(--radius-md);
  border:1px solid transparent;cursor:pointer;text-decoration:none;white-space:nowrap;
  transition:background var(--dur) var(--ease-out),border-color var(--dur) var(--ease-out),
  color var(--dur) var(--ease-out),box-shadow var(--dur) var(--ease-out),transform var(--dur-fast) var(--ease-out);
  -webkit-font-smoothing:antialiased;user-select:none;}
.sl-btn:focus-visible{outline:none;box-shadow:0 0 0 3px var(--focus-ring);}
.sl-btn:active{transform:translateY(1px) scale(.99);}
.sl-btn[disabled],.sl-btn[aria-disabled="true"]{opacity:.45;pointer-events:none;}
.sl-btn--sm{--_h:32px;--_px:13px;--_fs:13px;}
.sl-btn--lg{--_h:50px;--_px:26px;--_fs:15px;}
.sl-btn--block{display:flex;width:100%;}
/* primary — cyan fill */
.sl-btn--primary{background:var(--cyan-500);color:var(--on-accent);border-color:var(--cyan-400);}
.sl-btn--primary:hover{background:var(--cyan-400);box-shadow:var(--glow-cyan);}
/* secondary — matte glass */
.sl-btn--secondary{background:var(--glass-fill-light);color:var(--text-primary);border-color:var(--border-strong);
  backdrop-filter:blur(var(--blur-glass));-webkit-backdrop-filter:blur(var(--blur-glass));}
.sl-btn--secondary:hover{background:var(--surface-elevated);border-color:var(--cyan-600);color:var(--text-strong);}
/* ghost */
.sl-btn--ghost{background:transparent;color:var(--text-secondary);border-color:transparent;}
.sl-btn--ghost:hover{background:var(--line-soft);color:var(--text-strong);}
/* danger */
.sl-btn--danger{background:var(--tint-danger);color:var(--danger-500);border-color:rgba(237,107,138,.35);}
.sl-btn--danger:hover{background:rgba(237,107,138,.2);border-color:var(--danger-500);}
.sl-btn__spin{width:14px;height:14px;border-radius:50%;border:2px solid currentColor;border-top-color:transparent;
  animation:sl-btn-spin .6s linear infinite;}
@keyframes sl-btn-spin{to{transform:rotate(360deg)}}
`;
function Button({
  variant = "primary",
  size = "md",
  iconLeft,
  iconRight,
  fullWidth = false,
  loading = false,
  disabled = false,
  href,
  className = "",
  children,
  ...rest
}) {
  __ds_scope.injectOnce("sl-button", CSS);
  const cls = ["sl-btn", `sl-btn--${variant}`, size !== "md" && `sl-btn--${size}`, fullWidth && "sl-btn--block", className].filter(Boolean).join(" ");
  const inner = /*#__PURE__*/React.createElement(React.Fragment, null, loading && /*#__PURE__*/React.createElement("span", {
    className: "sl-btn__spin",
    "aria-hidden": "true"
  }), !loading && iconLeft, children && /*#__PURE__*/React.createElement("span", null, children), !loading && iconRight);
  if (href && !disabled) {
    return /*#__PURE__*/React.createElement("a", _extends({
      href: href,
      className: cls
    }, rest), inner);
  }
  return /*#__PURE__*/React.createElement("button", _extends({
    className: cls,
    disabled: disabled || loading
  }, rest), inner);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * SookLabs Card — the matte-glass surface.
 * appearance: "glass" (translucent + blur), "solid" (opaque card), "outline".
 * Optional accent glow and hover lift. Composes freely.
 */
function Card({
  children,
  appearance = "solid",
  glow = false,
  hover = false,
  padding = "24px",
  radius = "var(--radius-xl)",
  style = {},
  ...rest
}) {
  const [isHover, setHover] = React.useState(false);
  const appearances = {
    glass: {
      background: "var(--glass-bg)",
      backdropFilter: "blur(var(--blur-md))",
      WebkitBackdropFilter: "blur(var(--blur-md))",
      border: "1px solid var(--glass-border)"
    },
    solid: {
      background: "var(--surface-card)",
      border: "1px solid var(--border-default)"
    },
    raised: {
      background: "var(--surface-raised)",
      border: "1px solid var(--border-subtle)"
    },
    outline: {
      background: "transparent",
      border: "1px solid var(--border-default)"
    }
  };
  const base = appearances[appearance] || appearances.solid;
  const lift = hover && isHover;
  return /*#__PURE__*/React.createElement("div", _extends({
    onMouseEnter: () => hover && setHover(true),
    onMouseLeave: () => hover && setHover(false),
    style: {
      position: "relative",
      padding,
      borderRadius: radius,
      boxShadow: lift ? "var(--shadow-lg), var(--inset-top)" : "var(--shadow-md), var(--inset-top)",
      borderColor: lift ? "var(--border-strong)" : undefined,
      transition: "box-shadow var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out)",
      transform: lift ? "translateY(-2px)" : "translateY(0)",
      ...base,
      ...style
    }
  }, rest), glow && /*#__PURE__*/React.createElement("div", {
    "aria-hidden": true,
    style: {
      position: "absolute",
      inset: 0,
      borderRadius: radius,
      background: "radial-gradient(120% 80% at 50% -10%, var(--glow-blue), transparent 60%)",
      pointerEvents: "none",
      opacity: 0.7
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, children));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.sl-iconbtn{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;
  border-radius:var(--radius-md);border:1px solid transparent;background:transparent;cursor:pointer;
  color:var(--text-secondary);transition:background var(--dur) var(--ease-out),color var(--dur) var(--ease-out),
  border-color var(--dur) var(--ease-out),box-shadow var(--dur) var(--ease-out),transform var(--dur-fast);}
.sl-iconbtn svg{width:18px;height:18px;display:block;}
.sl-iconbtn:focus-visible{outline:none;box-shadow:0 0 0 3px var(--focus-ring);}
.sl-iconbtn:active{transform:scale(.94);}
.sl-iconbtn[disabled]{opacity:.4;pointer-events:none;}
.sl-iconbtn--sm{width:32px;height:32px;}
.sl-iconbtn--sm svg{width:16px;height:16px;}
.sl-iconbtn--lg{width:48px;height:48px;}
.sl-iconbtn--lg svg{width:20px;height:20px;}
.sl-iconbtn--ghost:hover{background:var(--line-soft);color:var(--text-strong);}
.sl-iconbtn--solid{background:var(--surface-card);border-color:var(--border);color:var(--text-secondary);}
.sl-iconbtn--solid:hover{background:var(--surface-elevated);color:var(--text-strong);border-color:var(--border-strong);}
.sl-iconbtn--accent{background:var(--tint-cyan);color:var(--cyan-300);border-color:rgba(43,210,224,.3);}
.sl-iconbtn--accent:hover{background:rgba(43,210,224,.2);box-shadow:var(--glow-cyan);}
`;
function IconButton({
  variant = "ghost",
  size = "md",
  label,
  className = "",
  children,
  ...rest
}) {
  __ds_scope.injectOnce("sl-iconbtn", CSS);
  const cls = ["sl-iconbtn", `sl-iconbtn--${variant}`, size !== "md" && `sl-iconbtn--${size}`, className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("button", _extends({
    className: cls,
    "aria-label": label,
    title: label
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Overline.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * SookLabs Overline — the recurring mono eyebrow label.
 * Optional leading tick/dot. Use above headings and section starts.
 */
function Overline({
  children,
  dot = false,
  tone = "muted",
  style = {},
  ...rest
}) {
  const colors = {
    muted: "var(--text-muted)",
    accent: "var(--accent-glow)",
    primary: "var(--text-secondary)"
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "9px",
      fontFamily: "var(--font-mono)",
      fontSize: "12px",
      fontWeight: 500,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: colors[tone] || colors.muted,
      ...style
    }
  }, rest), dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 5,
      height: 5,
      borderRadius: 999,
      background: "var(--accent-glow)",
      boxShadow: "0 0 8px var(--accent-glow)",
      flex: "none"
    }
  }), children);
}
Object.assign(__ds_scope, { Overline });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Overline.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.sl-tag{display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 12px;
  font-family:var(--font-sans);font-size:13px;font-weight:500;line-height:1;border-radius:var(--radius-pill);
  border:1px solid var(--border);background:var(--glass-fill-light);color:var(--text-secondary);
  white-space:nowrap;transition:background var(--dur) var(--ease-out),color var(--dur) var(--ease-out),
  border-color var(--dur) var(--ease-out);}
.sl-tag svg{width:13px;height:13px;}
.sl-tag--interactive{cursor:pointer;}
.sl-tag--interactive:hover{color:var(--text-strong);border-color:var(--border-strong);background:var(--surface-elevated);}
.sl-tag--active{background:var(--tint-cyan);color:var(--cyan-300);border-color:rgba(43,210,224,.4);}
.sl-tag__x{display:inline-flex;margin:0 -4px 0 2px;opacity:.6;}
.sl-tag__x:hover{opacity:1;}
`;
function Tag({
  active = false,
  interactive = false,
  icon,
  onRemove,
  className = "",
  children,
  ...rest
}) {
  __ds_scope.injectOnce("sl-tag", CSS);
  const cls = ["sl-tag", (interactive || onRemove) && "sl-tag--interactive", active && "sl-tag--active", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls
  }, rest), icon, children, onRemove && /*#__PURE__*/React.createElement("span", {
    className: "sl-tag__x",
    role: "button",
    "aria-label": "Remove",
    onClick: e => {
      e.stopPropagation();
      onRemove(e);
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 16 16",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 4l8 8M12 4l-8 8",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round"
  }))));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/data/StatTile.jsx
try { (() => {
/**
 * SookLabs StatTile — a calm metric cell. Mono value, optional delta + label.
 * Used in dashboards, proof-of-work strips, and snapshots.
 */
function StatTile({
  value,
  label,
  delta,
  deltaTone = "success",
  caption,
  align = "left",
  style = {}
}) {
  const tones = {
    success: "var(--signal-success)",
    warning: "var(--signal-warning)",
    danger: "var(--signal-danger)",
    info: "var(--signal-info)",
    neutral: "var(--text-muted)"
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      alignItems: align === "center" ? "center" : "flex-start",
      textAlign: align,
      padding: "18px 20px",
      background: "var(--surface-card)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--inset-top)",
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "10px",
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: "var(--text-muted)"
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: "9px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "30px",
      fontWeight: 500,
      letterSpacing: "-0.01em",
      color: "var(--text-primary)",
      lineHeight: 1
    }
  }, value), delta && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "12px",
      fontWeight: 500,
      color: tones[deltaTone] || tones.neutral
    }
  }, delta)), caption && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "13px",
      color: "var(--text-muted)",
      lineHeight: 1.45
    }
  }, caption));
}
Object.assign(__ds_scope, { StatTile });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/StatTile.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * SookLabs Input — calm dark field with a quiet focus glow.
 * Supports label, optional leading icon, hint, and error state.
 */
function Input({
  label,
  hint,
  error,
  iconLeft = null,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled = false,
  id,
  style = {},
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const fid = id || React.useId();
  const borderColor = error ? "var(--danger-400)" : focus ? "var(--accent)" : "var(--border-default)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "7px",
      width: "100%",
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: fid,
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "13px",
      fontWeight: 500,
      color: "var(--text-secondary)"
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "0 14px",
      height: "44px",
      background: "var(--surface-inset)",
      border: `1px solid ${borderColor}`,
      borderRadius: "12px",
      boxShadow: focus && !error ? "var(--focus-ring)" : "none",
      transition: "border-color var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)",
      opacity: disabled ? 0.5 : 1
    }
  }, iconLeft && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      width: 17,
      height: 17,
      color: "var(--text-muted)",
      flex: "none"
    }
  }, iconLeft), /*#__PURE__*/React.createElement("input", _extends({
    id: fid,
    type: type,
    value: value,
    onChange: onChange,
    placeholder: placeholder,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      minWidth: 0,
      background: "transparent",
      border: "none",
      outline: "none",
      fontFamily: "var(--font-body)",
      fontSize: "14px",
      color: "var(--text-primary)"
    }
  }, rest))), (hint || error) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "12px",
      color: error ? "var(--danger-400)" : "var(--text-muted)"
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
/**
 * SookLabs Switch — quiet toggle. Off = inset track; On = accent fill.
 */
function Switch({
  checked = false,
  onChange,
  disabled = false,
  label,
  id,
  style = {}
}) {
  const fid = id || React.useId();
  const toggle = () => {
    if (!disabled && onChange) onChange(!checked);
  };
  const sw = /*#__PURE__*/React.createElement("button", {
    id: fid,
    type: "button",
    role: "switch",
    "aria-checked": checked,
    disabled: disabled,
    onClick: toggle,
    style: {
      position: "relative",
      width: 42,
      height: 24,
      flex: "none",
      borderRadius: 999,
      border: "1px solid",
      borderColor: checked ? "var(--accent)" : "var(--border-strong)",
      background: checked ? "var(--accent)" : "var(--surface-inset)",
      boxShadow: checked ? "0 0 14px rgba(47,124,240,0.40)" : "inset 0 1px 2px rgba(0,0,0,0.4)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      transition: "background var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)",
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 2,
      left: checked ? 20 : 2,
      width: 18,
      height: 18,
      borderRadius: 999,
      background: checked ? "#fff" : "var(--silver-300)",
      transition: "left var(--dur-base) var(--ease-out), background var(--dur-base) var(--ease-out)"
    }
  }));
  if (!label) return sw;
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: fid,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "11px",
      cursor: disabled ? "not-allowed" : "pointer",
      ...style
    }
  }, sw, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "14px",
      color: "var(--text-secondary)"
    }
  }, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// ui_kits/sooklabs-site/hero-scroll.jsx
try { (() => {
// SookLabs hero — scroll-linked "structured intelligence unfolding" scene.
// Lightweight: a single rAF-throttled scroll listener drives transforms only (GPU-cheap).
// No scroll hijacking, no pinning. Respects prefers-reduced-motion (stays at rest state).

function usePrefersReducedMotion() {
  const [reduce, setReduce] = React.useState(false);
  React.useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduce(m.matches);
    on();
    m.addEventListener ? m.addEventListener("change", on) : m.addListener(on);
    return () => {
      m.removeEventListener ? m.removeEventListener("change", on) : m.removeListener(on);
    };
  }, []);
  return reduce;
}

// Scroll progress 0→1 over the first ~85vh of scroll (capped). 0 = at rest.
function useScrollProgress(reduce) {
  const [p, setP] = React.useState(0);
  React.useEffect(() => {
    if (reduce) {
      setP(0);
      return;
    }
    let raf = 0;
    const read = () => {
      raf = 0;
      const dist = Math.min((window.innerHeight || 800) * 0.85, 640);
      setP(Math.max(0, Math.min(1, (window.scrollY || window.pageYOffset || 0) / dist)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    window.addEventListener("scroll", onScroll, {
      passive: true
    });
    read();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduce]);
  return p;
}
const smooth = t => t * t * (3 - 2 * t);
const HERO_PARTICLES = Array.from({
  length: 9
}, (_, i) => {
  const ang = i / 9 * Math.PI * 2 + 0.4;
  return {
    x: Math.cos(ang),
    y: Math.sin(ang),
    s: 0.62 + i % 4 * 0.12,
    c: i % 3 === 0 ? "var(--violet-400)" : "var(--cyan-400)"
  };
});
function HeroScrollScene() {
  const reduce = usePrefersReducedMotion();
  const p = useScrollProgress(reduce);

  // Two overlapping phases: compress (logo → dot), then expand (quiet bloom).
  const a = smooth(Math.min(1, p / 0.5)); // compression
  const b = smooth(Math.max(0, Math.min(1, (p - 0.4) / 0.6))); // expansion

  const glyphScale = 1 - a * 0.8; // 1 → 0.2
  const glyphRadius = 22 + a * 30; // square → round dot
  const restOpacity = 1 - a; // static orbit fades as it compresses
  const dotGlow = 0.32 + a * 0.42 + Math.sin(b * Math.PI) * 0.3;
  const rings = [0, 1, 2].map(i => {
    const local = Math.max(0, Math.min(1, b * 1.25 - i * 0.2));
    return {
      scale: 0.18 + local * 2.4,
      opacity: Math.sin(local * Math.PI) * 0.42
    };
  });
  const partR = b * 190;
  const partOpacity = Math.sin(b * Math.PI);
  const ring = (w, extra) => ({
    position: "absolute",
    width: w,
    height: w,
    borderRadius: "50%",
    ...extra
  });
  return /*#__PURE__*/React.createElement("div", {
    "aria-hidden": true,
    style: {
      position: "relative",
      width: 320,
      height: 320,
      maxWidth: "82vw",
      display: "grid",
      placeItems: "center",
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      display: "grid",
      placeItems: "center",
      opacity: restOpacity,
      transition: "opacity .1s linear"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: ring(320, {
      border: "1px solid var(--border-subtle)"
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: ring(224, {
      border: "1px solid var(--border-default)"
    })
  }), /*#__PURE__*/React.createElement("div", {
    className: "sl-spin",
    style: ring(224, {
      border: "1px solid transparent",
      borderTopColor: "rgba(52,207,234,0.5)",
      borderRightColor: "rgba(47,124,240,0.25)"
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: ring(130, {
      border: "1px solid var(--border-default)"
    })
  }), /*#__PURE__*/React.createElement("div", {
    className: "sl-spin-slow",
    style: {
      position: "absolute",
      width: 320,
      height: 320
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: -4,
      left: "50%",
      width: 8,
      height: 8,
      borderRadius: 999,
      background: "var(--cyan-400)",
      boxShadow: "0 0 12px var(--cyan-400)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      bottom: 28,
      right: 30,
      width: 6,
      height: 6,
      borderRadius: 999,
      background: "var(--violet-400)",
      boxShadow: "0 0 10px var(--violet-400)"
    }
  }))), rings.map((r, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: ring(220, {
      border: "1px solid rgba(52,207,234,0.55)",
      transform: `scale(${r.scale})`,
      opacity: r.opacity,
      willChange: "transform, opacity"
    })
  })), HERO_PARTICLES.map((pt, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      position: "absolute",
      width: 4 * pt.s + 2,
      height: 4 * pt.s + 2,
      borderRadius: 999,
      background: pt.c,
      boxShadow: `0 0 8px ${pt.c}`,
      transform: `translate(${pt.x * partR}px, ${pt.y * partR}px)`,
      opacity: partOpacity * pt.s,
      willChange: "transform, opacity"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: ring(220, {
      background: "radial-gradient(circle, var(--glow-cyan), transparent 65%)",
      opacity: 0.5 + a * 0.5
    })
  }), /*#__PURE__*/React.createElement("img", {
    src: window.__resources && window.__resources.glyph || "../../assets/sooklabs-glyph.png",
    alt: "SookLabs",
    style: {
      position: "relative",
      width: 92,
      height: 92,
      borderRadius: glyphRadius,
      transform: `scale(${glyphScale})`,
      boxShadow: `0 0 0 1px var(--border-strong), var(--shadow-lg), 0 0 ${40 + dotGlow * 60}px rgba(52,207,234,${dotGlow})`,
      willChange: "transform"
    }
  }));
}

// Reveal-on-enter for the project cards. Drives opacity/transform from JS state only —
// NO CSS transition or @keyframes (those timelines freeze in some preview iframes, stranding
// cards at opacity 0). A requestAnimationFrame tween smooths it where the clock runs; a
// setTimeout fallback guarantees the visible end-state everywhere.
function useReveal() {
  const ref = React.useRef(null);
  const [prog, setProg] = React.useState(0); // 0 = hidden, 1 = shown
  React.useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setProg(1);
      return;
    }
    const el = ref.current;
    if (!el) {
      setProg(1);
      return;
    }
    const DUR = 560;
    let started = false,
      rafId = 0,
      startT = 0,
      scrollRaf = 0,
      fallback = 0,
      hard = 0;
    const tick = now => {
      if (!startT) startT = now;
      const t = Math.min(1, (now - startT) / DUR);
      setProg(t < 1 ? 0.001 + t * 0.999 : 1);
      if (t < 1) rafId = requestAnimationFrame(tick);
    };
    const start = () => {
      if (started) return;
      started = true;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      clearTimeout(hard);
      // Guarantee the end-state even if the rAF clock never advances.
      fallback = setTimeout(() => {
        if (rafId) cancelAnimationFrame(rafId);
        setProg(1);
      }, DUR + 200);
      rafId = requestAnimationFrame(tick);
    };
    const inView = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      return r.top < vh * 0.92 && r.bottom > 0;
    };
    const onScroll = () => {
      if (!scrollRaf) scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        if (inView()) start();
      });
    };
    window.addEventListener("scroll", onScroll, {
      passive: true
    });
    window.addEventListener("resize", onScroll, {
      passive: true
    });
    if (inView()) start();
    hard = setTimeout(start, 900); // ultimate safety: never leave a card hidden

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      clearTimeout(fallback);
      clearTimeout(hard);
    };
  }, []);
  return [ref, prog];
}
function Reveal({
  children,
  delay = 0
}) {
  const [ref, prog] = useReveal();
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      display: "flex",
      opacity: prog,
      transform: prog >= 1 ? "none" : `translateY(${(1 - prog) * 16}px)`,
      willChange: "transform, opacity"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, children));
}
Object.assign(window, {
  HeroScrollScene,
  Reveal,
  usePrefersReducedMotion
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/sooklabs-site/hero-scroll.jsx", error: String((e && e.message) || e) }); }

// ui_kits/sooklabs-site/icons.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Shared Lucide-style line icons (1.75 stroke, currentColor) for the SookLabs kit.
// Exported to window for use across the kit's JSX files.
function Icon({
  d,
  size = 20,
  stroke = 1.75,
  children,
  viewBox = "0 0 24 24",
  style
}) {
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: viewBox,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: style
  }, children || /*#__PURE__*/React.createElement("path", {
    d: d
  }));
}
const Icons = {
  // Products
  Sookly: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
  })),
  Seos: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 2a10 10 0 0 1 10 10"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 6a6 6 0 0 1 6 6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M2 12a10 10 0 0 0 10 10"
  })),
  Roast: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m9 12 2 2 4-4"
  })),
  Community: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "9",
    cy: "7",
    r: "4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M23 21v-2a4 4 0 0 0-3-3.87"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 3.13a4 4 0 0 1 0 7.75"
  })),
  // UI
  Arrow: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M13 6l6 6-6 6"
  })),
  Menu: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "M3 6h18M3 12h18M3 18h18"
  })),
  Close: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18M6 6l12 12"
  })),
  Plus: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "M12 5v14M5 12h14"
  })),
  Inbox: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "M22 12h-6l-2 3h-4l-2-3H2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"
  })),
  Workflow: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "3",
    width: "6",
    height: "6",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "15",
    y: "15",
    width: "6",
    height: "6",
    rx: "1"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 9v3a3 3 0 0 0 3 3h6"
  })),
  Clock: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 7v5l3 2"
  })),
  Layers: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "m12 2 9 5-9 5-9-5 9-5z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m3 12 9 5 9-5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m3 17 9 5 9-5"
  })),
  Brain: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "M12 5a3 3 0 0 0-5.9-.6 3 3 0 0 0-1.9 5A2.5 2.5 0 0 0 4 14a3 3 0 0 0 4 2.8A2.5 2.5 0 0 0 12 19zM12 5a3 3 0 0 1 5.9-.6 3 3 0 0 1 1.9 5A2.5 2.5 0 0 1 20 14a3 3 0 0 1-4 2.8A2.5 2.5 0 0 1 12 19z"
  })),
  Trend: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "M22 7 13.5 15.5l-5-5L2 17"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 7h6v6"
  })),
  Check: p => /*#__PURE__*/React.createElement(Icon, p, /*#__PURE__*/React.createElement("path", {
    d: "M20 6 9 17l-5-5"
  })),
  Dot: p => /*#__PURE__*/React.createElement(Icon, _extends({}, p, {
    viewBox: "0 0 24 24"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "4",
    fill: "currentColor",
    stroke: "none"
  }))
};
Object.assign(window, {
  Icon,
  Icons
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/sooklabs-site/icons.jsx", error: String((e && e.message) || e) }); }

// ui_kits/sooklabs-site/kit-ui.jsx
try { (() => {
// Lightweight presentational primitives for the SookLabs site kit — mirror the
// design-system components (Button, Card, Overline, Badge) using the shared tokens.
// Self-contained so the kit renders without the compiled bundle.

function Overline({
  children,
  dot,
  tone = "muted",
  style
}) {
  const c = {
    muted: "var(--text-muted)",
    accent: "var(--accent-glow)"
  }[tone] || "var(--text-muted)";
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 9,
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      fontWeight: 500,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: c,
      ...style
    }
  }, dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 5,
      height: 5,
      borderRadius: 999,
      background: "var(--accent-glow)",
      boxShadow: "0 0 8px var(--accent-glow)"
    }
  }), children);
}
function Button({
  children,
  variant = "primary",
  size = "md",
  iconRight,
  iconLeft,
  onClick,
  style
}) {
  const [h, setH] = React.useState(false);
  const [a, setA] = React.useState(false);
  const S = {
    sm: {
      p: "9px 16px",
      f: 13,
      r: 11
    },
    md: {
      p: "12px 22px",
      f: 14,
      r: 13
    },
    lg: {
      p: "15px 28px",
      f: 15,
      r: 14
    }
  }[size];
  const V = {
    primary: {
      background: h ? "var(--accent-hover)" : "var(--accent)",
      color: "#fff",
      boxShadow: h ? "0 0 0 1px var(--border-accent), 0 10px 30px rgba(47,124,240,0.32)" : "0 1px 2px rgba(0,0,0,.35)",
      border: "1px solid transparent"
    },
    secondary: {
      background: h ? "var(--surface-hover)" : "var(--surface-card)",
      color: "var(--text-primary)",
      border: "1px solid var(--border-default)",
      boxShadow: "var(--inset-top)"
    },
    ghost: {
      background: h ? "rgba(174,187,206,.06)" : "transparent",
      color: h ? "var(--text-primary)" : "var(--text-secondary)",
      border: "1px solid transparent"
    }
  }[variant];
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    onMouseEnter: () => setH(true),
    onMouseLeave: () => {
      setH(false);
      setA(false);
    },
    onMouseDown: () => setA(true),
    onMouseUp: () => setA(false),
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 9,
      padding: S.p,
      fontFamily: "var(--font-body)",
      fontSize: S.f,
      fontWeight: 600,
      borderRadius: S.r,
      cursor: "pointer",
      whiteSpace: "nowrap",
      outline: "none",
      transform: a ? "scale(0.98)" : "scale(1)",
      transition: "background .2s var(--ease-out), box-shadow .2s var(--ease-out), color .2s var(--ease-out), transform .14s var(--ease-out)",
      ...V,
      ...style
    }
  }, iconLeft, children, iconRight);
}
function Card({
  children,
  appearance = "solid",
  glow,
  hover,
  padding = 24,
  radius = "var(--radius-xl)",
  style
}) {
  const [h, setH] = React.useState(false);
  const A = {
    glass: {
      background: "var(--glass-bg)",
      backdropFilter: "blur(var(--blur-md))",
      WebkitBackdropFilter: "blur(var(--blur-md))",
      border: "1px solid var(--glass-border)"
    },
    solid: {
      background: "var(--surface-card)",
      border: "1px solid var(--border-default)"
    },
    outline: {
      background: "transparent",
      border: "1px solid var(--border-default)"
    }
  }[appearance];
  const lift = hover && h;
  return /*#__PURE__*/React.createElement("div", {
    onMouseEnter: () => hover && setH(true),
    onMouseLeave: () => hover && setH(false),
    style: {
      position: "relative",
      padding,
      borderRadius: radius,
      boxShadow: lift ? "var(--shadow-lg), var(--inset-top)" : "var(--shadow-md), var(--inset-top)",
      borderColor: lift ? "var(--border-strong)" : undefined,
      transform: lift ? "translateY(-3px)" : "none",
      transition: "box-shadow .25s var(--ease-out), border-color .25s var(--ease-out), transform .25s var(--ease-out)",
      ...A,
      ...style
    }
  }, glow && /*#__PURE__*/React.createElement("div", {
    "aria-hidden": true,
    style: {
      position: "absolute",
      inset: 0,
      borderRadius: radius,
      pointerEvents: "none",
      background: "radial-gradient(120% 80% at 50% -10%, var(--glow-blue), transparent 60%)",
      opacity: .7
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, children));
}
function Badge({
  children,
  tone = "neutral",
  dot,
  mono,
  style
}) {
  const T = {
    neutral: ["var(--silver-300)", "rgba(174,187,206,.10)", "var(--silver-400)"],
    blue: ["var(--blue-300)", "rgba(47,124,240,.14)", "var(--blue-400)"],
    cyan: ["var(--cyan-300)", "rgba(52,207,234,.13)", "var(--cyan-400)"],
    violet: ["var(--violet-300)", "rgba(124,99,238,.15)", "var(--violet-400)"],
    success: ["var(--success-400)", "rgba(33,184,132,.14)", "var(--success-400)"]
  }[tone];
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "4px 11px",
      borderRadius: 999,
      fontFamily: mono ? "var(--font-mono)" : "var(--font-body)",
      fontSize: mono ? 11 : 12,
      fontWeight: mono ? 500 : 600,
      letterSpacing: mono ? "0.10em" : 0,
      textTransform: mono ? "uppercase" : "none",
      color: T[0],
      background: T[1],
      whiteSpace: "nowrap",
      ...style
    }
  }, dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: 999,
      background: T[2]
    }
  }), children);
}
const Container = ({
  children,
  style
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 32px",
    ...style
  }
}, children);
Object.assign(window, {
  Overline,
  Button,
  Card,
  Badge,
  Container
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/sooklabs-site/kit-ui.jsx", error: String((e && e.message) || e) }); }

// ui_kits/sooklabs-site/sections-body.jsx
try { (() => {
// SookLabs site — body sections
const {
  Overline: OL,
  Card: KCard,
  Badge: KBadge,
  Button: KBtn,
  Container: Ct
} = window;
function SectionHead({
  eyebrow,
  title,
  sub,
  align = "center",
  max = 640
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: align,
      marginBottom: 56,
      maxWidth: align === "center" ? max : "none",
      marginLeft: align === "center" ? "auto" : 0,
      marginRight: align === "center" ? "auto" : 0
    }
  }, /*#__PURE__*/React.createElement(OL, {
    dot: true,
    tone: "accent",
    style: {
      marginBottom: 18
    }
  }, eyebrow), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: "clamp(30px, 4vw, 44px)",
      lineHeight: 1.1,
      letterSpacing: "-0.03em",
      color: "var(--text-primary)",
      textWrap: "balance"
    }
  }, title), sub && /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 18,
      lineHeight: 1.6,
      color: "var(--text-secondary)",
      marginTop: 18,
      maxWidth: max,
      marginInline: align === "center" ? "auto" : 0
    }
  }, sub));
}

// 2 — Operating rule
function OperatingRule() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: "96px 0",
      borderTop: "1px solid var(--border-subtle)",
      background: "var(--bg-section-alt)"
    }
  }, /*#__PURE__*/React.createElement(Ct, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 0.9fr)",
      gap: 56,
      alignItems: "center"
    },
    className: "sl-2col"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(OL, {
    dot: true,
    tone: "accent",
    style: {
      marginBottom: 20
    }
  }, "The operating rule"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: "clamp(26px, 3.4vw, 38px)",
      lineHeight: 1.22,
      letterSpacing: "-0.02em",
      color: "var(--text-primary)"
    }
  }, "If it does not reduce ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--accent-glow)"
    }
  }, "repetition"), ", ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--accent-glow)"
    }
  }, "interruptions"), ", ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--accent-glow)"
    }
  }, "cognitive load"), ", or ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--accent-glow)"
    }
  }, "waiting time"), " \u2014 it does not belong in SookLabs.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 12
    }
  }, [{
    icon: /*#__PURE__*/React.createElement(Icons.Workflow, {
      size: 18
    }),
    t: "Repetition",
    d: "Turned into infrastructure, not redone by hand."
  }, {
    icon: /*#__PURE__*/React.createElement(Icons.Inbox, {
      size: 18
    }),
    t: "Interruptions",
    d: "Captured, routed, and quieted into one place."
  }, {
    icon: /*#__PURE__*/React.createElement(Icons.Brain, {
      size: 18
    }),
    t: "Cognitive load",
    d: "Removed through clear systems and defaults."
  }, {
    icon: /*#__PURE__*/React.createElement(Icons.Clock, {
      size: 18
    }),
    t: "Waiting time",
    d: "Compressed — answers arrive before the ask."
  }].map(r => /*#__PURE__*/React.createElement("div", {
    key: r.t,
    style: {
      display: "flex",
      gap: 14,
      alignItems: "flex-start",
      padding: "14px 16px",
      borderRadius: 14,
      background: "var(--surface-card)",
      border: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "grid",
      placeItems: "center",
      width: 38,
      height: 38,
      borderRadius: 10,
      background: "rgba(52,207,234,0.10)",
      color: "var(--accent-glow)",
      flex: "none"
    }
  }, r.icon), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontWeight: 600,
      fontSize: 15,
      color: "var(--text-primary)"
    }
  }, r.t), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 13.5,
      color: "var(--text-muted)",
      marginTop: 2
    }
  }, r.d))))))));
}

// 3 — Ecosystem (current projects)
const PRODUCTS = [{
  key: "Sookly",
  icon: Icons.Sookly,
  tone: "cyan",
  status: "Live",
  tag: "Omnichat · AI receptionist",
  desc: "Handles enquiries, routes messages, reduces missed leads, and gives teams one calm inbox."
}, {
  key: "SEOS",
  icon: Icons.Seos,
  tone: "blue",
  status: "In progress",
  tag: "Search Expansion OS",
  desc: "SEO diagnostics, website audits, content systems, and growth operations — measurable visibility."
}, {
  key: "RoastMyOpSec",
  icon: Icons.Roast,
  tone: "violet",
  status: "In progress",
  tag: "Security auditor",
  desc: "Plain-English exposure checks for founders and small teams. Know what is leaking, first."
}, {
  key: "SookLabs Community",
  icon: Icons.Community,
  tone: "neutral",
  status: "Open",
  tag: "Builder community",
  desc: "A focused community around technology, psychology, and investment. Sharper thinking, long-term leverage."
}];
function Ecosystem() {
  const accent = {
    cyan: "var(--cyan-400)",
    blue: "var(--blue-400)",
    violet: "var(--violet-400)",
    neutral: "var(--silver-300)"
  };
  const glow = {
    cyan: "var(--glow-cyan)",
    blue: "var(--glow-blue)",
    violet: "var(--glow-violet)",
    neutral: "rgba(174,187,206,0.10)"
  };
  return /*#__PURE__*/React.createElement("section", {
    id: "ecosystem",
    style: {
      padding: "96px 0"
    }
  }, /*#__PURE__*/React.createElement(Ct, null, /*#__PURE__*/React.createElement(SectionHead, {
    eyebrow: "Current projects",
    title: "One principle. Four systems unfolding.",
    sub: "Everything begins from one central rule. From that point, the SookLabs ecosystem expands \u2014 each product a quiet system that returns time to focus."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
      gap: 16
    }
  }, PRODUCTS.map((p, i) => /*#__PURE__*/React.createElement(Reveal, {
    key: p.key,
    delay: i * 90
  }, /*#__PURE__*/React.createElement(KCard, {
    appearance: "solid",
    hover: true,
    padding: 26,
    style: {
      height: "100%",
      boxSizing: "border-box"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "grid",
      placeItems: "center",
      width: 46,
      height: 46,
      borderRadius: 13,
      background: glow[p.tone],
      color: accent[p.tone],
      border: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement(p.icon, {
    size: 22
  })), /*#__PURE__*/React.createElement(KBadge, {
    tone: p.tone === "neutral" ? "neutral" : p.tone,
    mono: true,
    dot: true
  }, p.status)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "var(--text-faint)",
      marginBottom: 8
    }
  }, p.tag), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: 22,
      letterSpacing: "-0.02em",
      color: "var(--text-primary)",
      marginBottom: 10
    }
  }, p.key), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 14,
      lineHeight: 1.55,
      color: "var(--text-muted)",
      marginBottom: 20
    }
  }, p.desc), /*#__PURE__*/React.createElement("a", {
    href: "#",
    className: "sl-cardlink",
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      fontFamily: "var(--font-body)",
      fontSize: 13.5,
      fontWeight: 600,
      color: accent[p.tone]
    }
  }, "Open ", p.key.split(" ")[0], " ", /*#__PURE__*/React.createElement(Icons.Arrow, {
    size: 15
  }))))))));
}

// 4 — Why SookLabs exists
function WhySection() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: "96px 0",
      background: "var(--bg-section-alt)",
      borderTop: "1px solid var(--border-subtle)",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement(Ct, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "minmax(0,0.9fr) minmax(0,1.1fr)",
      gap: 56,
      alignItems: "center"
    },
    className: "sl-2col"
  }, /*#__PURE__*/React.createElement(SectionHead, {
    align: "left",
    eyebrow: "Why SookLabs exists",
    title: "Businesses don't need more noise. They need clearer systems.",
    sub: "Most software adds surface area: more tabs, more pings, more dashboards to check. SookLabs moves the other way \u2014 fewer repeated conversations, fewer places to look, fewer decisions to carry."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12
    }
  }, [{
    v: "4",
    l: "Systems",
    c: "Sookly · SEOS · RoastMyOpSec · Community"
  }, {
    v: "1",
    l: "Operating rule",
    c: "Applied to every feature, without exception"
  }, {
    v: "0",
    l: "Hype",
    c: "No vague AI, no loud gradients, no noise"
  }, {
    v: "∞",
    l: "Discipline",
    c: "Reduce. Protect. Build. Repeat."
  }].map(s => /*#__PURE__*/React.createElement("div", {
    key: s.l,
    style: {
      padding: "20px 18px",
      borderRadius: 16,
      background: "var(--surface-card)",
      border: "1px solid var(--border-subtle)",
      boxShadow: "var(--inset-top)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: 38,
      color: "var(--text-primary)",
      lineHeight: 1
    }
  }, s.v), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: "var(--accent-glow)",
      margin: "8px 0 6px"
    }
  }, s.l), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 12.5,
      color: "var(--text-muted)",
      lineHeight: 1.45
    }
  }, s.c)))))));
}

// 5 — Product philosophy
function Philosophy() {
  return /*#__PURE__*/React.createElement("section", {
    id: "philosophy",
    style: {
      padding: "96px 0"
    }
  }, /*#__PURE__*/React.createElement(Ct, {
    style: {
      maxWidth: 920
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement(OL, {
    dot: true,
    tone: "accent",
    style: {
      marginBottom: 24
    }
  }, "Product philosophy"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: "clamp(32px, 4.6vw, 56px)",
      lineHeight: 1.08,
      letterSpacing: "-0.035em",
      color: "var(--text-primary)"
    }
  }, "Boring is the point."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 19,
      lineHeight: 1.65,
      color: "var(--text-secondary)",
      maxWidth: 620,
      margin: "24px auto 0"
    }
  }, "Reliable systems should feel obvious, dependable, and easy to trust. No theatre, no surprises \u2014 just infrastructure that quietly does its job, every time."))));
}

// 6 — Pillars
function Pillars() {
  const items = [{
    icon: Icons.Layers,
    t: "Technology",
    d: "Calm infrastructure: omnichat, audits, automation, security. Tools that compound."
  }, {
    icon: Icons.Brain,
    t: "Psychology",
    d: "How attention, trust, and habit actually work — designed for, not against."
  }, {
    icon: Icons.Trend,
    t: "Investment",
    d: "Long-term leverage over short-term noise. Build assets, not interruptions."
  }];
  return /*#__PURE__*/React.createElement("section", {
    id: "pillars",
    style: {
      padding: "96px 0",
      background: "var(--bg-section-alt)",
      borderTop: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement(Ct, null, /*#__PURE__*/React.createElement(SectionHead, {
    eyebrow: "The three pillars",
    title: "Technology, psychology, investment."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
      gap: 16
    }
  }, items.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.t,
    style: {
      padding: 30,
      borderRadius: 20,
      background: "var(--surface-card)",
      border: "1px solid var(--border-subtle)",
      boxShadow: "var(--inset-top)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "grid",
      placeItems: "center",
      width: 48,
      height: 48,
      borderRadius: 14,
      background: "rgba(47,124,240,0.10)",
      color: "var(--accent)",
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement(p.icon, {
    size: 24
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: 21,
      letterSpacing: "-0.02em",
      color: "var(--text-primary)",
      marginBottom: 10
    }
  }, p.t), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 14.5,
      lineHeight: 1.55,
      color: "var(--text-muted)"
    }
  }, p.d))))));
}

// 7 — Mantra + CTA
function Mantra() {
  const lines = ["Reduce the noise.", "Protect the focus.", "Build the system.", "Repeat with discipline."];
  return /*#__PURE__*/React.createElement("section", {
    id: "community",
    style: {
      padding: "112px 0",
      position: "relative",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    "aria-hidden": true,
    style: {
      position: "absolute",
      inset: 0,
      background: "radial-gradient(ellipse at 50% 120%, var(--glow-violet), transparent 60%)"
    }
  }), /*#__PURE__*/React.createElement(Ct, {
    style: {
      position: "relative",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: window.__resources && window.__resources.glyph || "../../assets/sooklabs-glyph.png",
    alt: "",
    style: {
      width: 56,
      height: 56,
      borderRadius: 16,
      marginBottom: 32,
      boxShadow: "0 0 40px rgba(52,207,234,0.4)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 4
    }
  }, lines.map((l, i) => /*#__PURE__*/React.createElement("span", {
    key: l,
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: "clamp(28px, 4vw, 46px)",
      letterSpacing: "-0.03em",
      lineHeight: 1.16,
      color: i === lines.length - 1 ? "var(--accent-glow)" : "var(--text-primary)"
    }
  }, l))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      gap: 12,
      marginTop: 44,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(KBtn, {
    variant: "primary",
    size: "lg",
    iconRight: /*#__PURE__*/React.createElement(Icons.Arrow, {
      size: 18
    })
  }, "Join the community"), /*#__PURE__*/React.createElement(KBtn, {
    variant: "secondary",
    size: "lg"
  }, "Explore Sookly"))));
}
function Footer() {
  const cols = [{
    h: "Ecosystem",
    links: ["Sookly", "SEOS", "RoastMyOpSec", "Community"]
  }, {
    h: "Company",
    links: ["Operating rule", "Philosophy", "Pillars", "Contact"]
  }, {
    h: "Resources",
    links: ["Clinic SEO Snapshot", "Documentation", "Changelog"]
  }];
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      borderTop: "1px solid var(--border-subtle)",
      padding: "56px 0 36px"
    }
  }, /*#__PURE__*/React.createElement(Ct, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.6fr 1fr 1fr 1fr",
      gap: 40
    },
    className: "sl-foot"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 11,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: window.__resources && window.__resources.glyph || "../../assets/sooklabs-glyph.png",
    alt: "",
    style: {
      width: 28,
      height: 28,
      borderRadius: 8
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: 18,
      color: "var(--text-primary)"
    }
  }, "SookLabs")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 13.5,
      lineHeight: 1.55,
      color: "var(--text-muted)",
      maxWidth: 260
    }
  }, "Calm digital systems that reduce repetition, interruptions, cognitive load, and waiting time.")), cols.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.h
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      color: "var(--text-faint)",
      marginBottom: 16
    }
  }, c.h), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: "none",
      margin: 0,
      padding: 0,
      display: "grid",
      gap: 11
    }
  }, c.links.map(l => /*#__PURE__*/React.createElement("li", {
    key: l
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    className: "sl-navlink",
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 13.5,
      color: "var(--text-secondary)"
    }
  }, l))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--border-subtle)",
      marginTop: 40,
      paddingTop: 22,
      display: "flex",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      color: "var(--text-faint)"
    }
  }, "\xA9 2026 SookLabs \u2014 Compress the diamond."), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      color: "var(--text-faint)"
    }
  }, "Reduce \xB7 Protect \xB7 Build \xB7 Repeat"))));
}
Object.assign(window, {
  OperatingRule,
  Ecosystem,
  WhySection,
  Philosophy,
  Pillars,
  Mantra,
  Footer
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/sooklabs-site/sections-body.jsx", error: String((e && e.message) || e) }); }

// ui_kits/sooklabs-site/sections-hero.jsx
try { (() => {
// SookLabs site — Header + Hero (logo as origin point of the ecosystem)
const {
  Overline,
  Button,
  Container
} = window;
function Header() {
  const [open, setOpen] = React.useState(false);
  const links = [{
    label: "Ecosystem",
    href: "#ecosystem"
  }, {
    label: "Philosophy",
    href: "#philosophy"
  }, {
    label: "Pillars",
    href: "#pillars"
  }, {
    label: "Community",
    href: "#community"
  }];
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: "sticky",
      top: 0,
      zIndex: 50,
      background: "rgba(10,14,22,0.72)",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement(Container, {
    style: {
      height: 68,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      display: "flex",
      alignItems: "center",
      gap: 11
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: window.__resources && window.__resources.glyph || "../../assets/sooklabs-glyph.png",
    alt: "",
    style: {
      width: 30,
      height: 30,
      borderRadius: 8
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: 19,
      letterSpacing: "-0.02em",
      color: "var(--text-primary)"
    }
  }, "SookLabs")), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 30
    },
    className: "sl-desk"
  }, links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l.label,
    href: l.href,
    className: "sl-navlink",
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 14,
      fontWeight: 500,
      color: "var(--text-muted)"
    }
  }, l.label))), /*#__PURE__*/React.createElement("div", {
    className: "sl-desk",
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm"
  }, "Sign in"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "sm",
    iconRight: /*#__PURE__*/React.createElement(Icons.Arrow, {
      size: 15
    })
  }, "Explore Sookly")), /*#__PURE__*/React.createElement("button", {
    className: "sl-mob",
    onClick: () => setOpen(!open),
    "aria-label": "Menu",
    style: {
      background: "none",
      border: "none",
      color: "var(--text-secondary)",
      cursor: "pointer",
      padding: 6
    }
  }, open ? /*#__PURE__*/React.createElement(Icons.Close, null) : /*#__PURE__*/React.createElement(Icons.Menu, null))), open && /*#__PURE__*/React.createElement("div", {
    className: "sl-mob",
    style: {
      borderTop: "1px solid var(--border-subtle)",
      padding: "16px 32px",
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l.label,
    href: l.href,
    onClick: () => setOpen(false),
    style: {
      color: "var(--text-secondary)",
      fontSize: 15
    }
  }, l.label)), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "sm"
  }, "Explore Sookly")));
}
function OrbitField() {
  // Subtle orbital geometry + the glyph as the origin point.
  return /*#__PURE__*/React.createElement("div", {
    className: "sl-orbit",
    "aria-hidden": true,
    style: {
      position: "relative",
      width: 320,
      height: 320,
      display: "grid",
      placeItems: "center",
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sl-ring",
    style: {
      position: "absolute",
      width: 320,
      height: 320,
      borderRadius: "50%",
      border: "1px solid var(--border-subtle)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "sl-ring",
    style: {
      position: "absolute",
      width: 224,
      height: 224,
      borderRadius: "50%",
      border: "1px solid var(--border-default)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "sl-ring sl-spin",
    style: {
      position: "absolute",
      width: 224,
      height: 224,
      borderRadius: "50%",
      border: "1px solid transparent",
      borderTopColor: "rgba(52,207,234,0.5)",
      borderRightColor: "rgba(47,124,240,0.25)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "sl-ring",
    style: {
      position: "absolute",
      width: 130,
      height: 130,
      borderRadius: "50%",
      border: "1px solid var(--border-default)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "sl-spin-slow",
    style: {
      position: "absolute",
      width: 320,
      height: 320
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: -4,
      left: "50%",
      width: 8,
      height: 8,
      borderRadius: 999,
      background: "var(--cyan-400)",
      boxShadow: "0 0 12px var(--cyan-400)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      bottom: 28,
      right: 30,
      width: 6,
      height: 6,
      borderRadius: 999,
      background: "var(--violet-400)",
      boxShadow: "0 0 10px var(--violet-400)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      width: 220,
      height: 220,
      borderRadius: "50%",
      background: "radial-gradient(circle, var(--glow-cyan), transparent 65%)"
    }
  }), /*#__PURE__*/React.createElement("img", {
    className: "sl-glyph-pulse",
    src: window.__resources && window.__resources.glyph || "../../assets/sooklabs-glyph.png",
    alt: "SookLabs",
    style: {
      position: "relative",
      width: 92,
      height: 92,
      borderRadius: 22,
      boxShadow: "0 0 0 1px var(--border-strong), var(--shadow-lg), 0 0 50px rgba(52,207,234,0.35)"
    }
  }));
}
function Hero() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      position: "relative",
      overflow: "hidden",
      paddingTop: 64,
      paddingBottom: 96
    }
  }, /*#__PURE__*/React.createElement("div", {
    "aria-hidden": true,
    className: "sl-grid-bg"
  }), /*#__PURE__*/React.createElement("div", {
    "aria-hidden": true,
    style: {
      position: "absolute",
      top: -120,
      left: "50%",
      transform: "translateX(-50%)",
      width: 1000,
      height: 620,
      background: "radial-gradient(ellipse at center, var(--glow-blue), transparent 68%)",
      pointerEvents: "none"
    }
  }), /*#__PURE__*/React.createElement(Container, {
    style: {
      position: "relative",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sl-fade",
    style: {
      display: "flex",
      justifyContent: "center",
      marginBottom: 40
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 9,
      padding: "6px 14px",
      borderRadius: 999,
      border: "1px solid var(--border-default)",
      background: "var(--surface-card)"
    }
  }, /*#__PURE__*/React.createElement(Overline, {
    dot: true,
    tone: "accent"
  }, "SookLabs \u2014 quiet infrastructure"))), /*#__PURE__*/React.createElement("div", {
    className: "sl-fade sl-d1"
  }, /*#__PURE__*/React.createElement(HeroScrollScene, null)), /*#__PURE__*/React.createElement("h1", {
    className: "sl-fade sl-d2",
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: "clamp(40px, 6vw, 72px)",
      lineHeight: 1.05,
      letterSpacing: "-0.035em",
      color: "var(--text-primary)",
      maxWidth: 880,
      margin: "36px auto 0",
      textWrap: "balance"
    }
  }, "Systems that turn repetition into infrastructure."), /*#__PURE__*/React.createElement("p", {
    className: "sl-fade sl-d3",
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "clamp(16px, 2vw, 20px)",
      lineHeight: 1.6,
      color: "var(--text-secondary)",
      maxWidth: 620,
      margin: "24px auto 0"
    }
  }, "SookLabs builds calm digital systems for businesses, operators, and builders who need fewer interruptions, clearer workflows, and more time to focus."), /*#__PURE__*/React.createElement("div", {
    className: "sl-fade sl-d4",
    style: {
      display: "flex",
      justifyContent: "center",
      gap: 12,
      marginTop: 36,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    iconRight: /*#__PURE__*/React.createElement(Icons.Arrow, {
      size: 18
    })
  }, "Explore the ecosystem"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "lg"
  }, "Read the operating rule"))));
}
Object.assign(window, {
  Header,
  Hero
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/sooklabs-site/sections-hero.jsx", error: String((e && e.message) || e) }); }

// ui_kits/sookly/app.jsx
try { (() => {
// Sookly inbox app
const {
  Ico: K,
  CH: CHN,
  ST: STS,
  SEED: DATA,
  AI_SUGGEST: AIS
} = window;
function Rail({
  active,
  setActive
}) {
  const items = [{
    id: "all",
    icon: K.inbox,
    label: "All inboxes"
  }, {
    id: "line",
    icon: K.dot,
    label: "LINE"
  }, {
    id: "fb",
    icon: K.dot,
    label: "Messenger"
  }, {
    id: "wa",
    icon: K.dot,
    label: "WhatsApp"
  }, {
    id: "web",
    icon: K.dot,
    label: "Website"
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: 64,
      flex: "none",
      background: "var(--bg-void)",
      borderRight: "1px solid var(--border-subtle)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "16px 0",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/sooklabs-glyph.png",
    alt: "Sookly",
    style: {
      width: 34,
      height: 34,
      borderRadius: 9,
      marginBottom: 14
    }
  }), items.map(it => {
    const on = active === it.id;
    const tint = it.id !== "all" ? CHN[it.id].c : "var(--accent-glow)";
    return /*#__PURE__*/React.createElement("button", {
      key: it.id,
      title: it.label,
      onClick: () => setActive(it.id),
      style: {
        width: 42,
        height: 42,
        borderRadius: 12,
        display: "grid",
        placeItems: "center",
        cursor: "pointer",
        border: "1px solid transparent",
        background: on ? "var(--surface-hover)" : "transparent",
        color: on ? tint : "var(--text-muted)",
        transition: "background .2s, color .2s"
      }
    }, /*#__PURE__*/React.createElement(it.icon, {
      s: it.id === "all" ? 20 : 13,
      w: it.id === "all" ? 1.75 : 2
    }));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "auto",
      display: "grid",
      placeItems: "center",
      width: 42,
      height: 42,
      borderRadius: 12,
      color: "var(--text-muted)",
      cursor: "pointer"
    },
    title: "Settings"
  }, /*#__PURE__*/React.createElement(K.settings, {
    s: 19
  })));
}
function ConvList({
  list,
  sel,
  setSel,
  filter,
  setFilter,
  query,
  setQuery
}) {
  const tabs = [["open", "Open"], ["assigned", "Assigned"], ["booked", "Done"]];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: 332,
      flex: "none",
      borderRight: "1px solid var(--border-subtle)",
      display: "flex",
      flexDirection: "column",
      background: "var(--bg-page)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "18px 18px 12px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: 20,
      letterSpacing: "-0.02em",
      color: "var(--text-primary)"
    }
  }, "Inbox"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      color: "var(--text-faint)"
    }
  }, list.filter(c => c.unread).length, " unread")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9,
      padding: "0 12px",
      height: 38,
      background: "var(--surface-inset)",
      border: "1px solid var(--border-default)",
      borderRadius: 11
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-muted)",
      display: "flex"
    }
  }, /*#__PURE__*/React.createElement(K.search, {
    s: 16
  })), /*#__PURE__*/React.createElement("input", {
    value: query,
    onChange: e => setQuery(e.target.value),
    placeholder: "Search conversations\u2026",
    style: {
      flex: 1,
      minWidth: 0,
      background: "transparent",
      border: "none",
      outline: "none",
      color: "var(--text-primary)",
      fontFamily: "var(--font-body)",
      fontSize: 13.5
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      marginTop: 14
    }
  }, tabs.map(([k, lbl]) => {
    const on = filter === k;
    return /*#__PURE__*/React.createElement("button", {
      key: k,
      onClick: () => setFilter(k),
      style: {
        flex: 1,
        padding: "7px 0",
        fontFamily: "var(--font-body)",
        fontSize: 12.5,
        fontWeight: 600,
        borderRadius: 9,
        cursor: "pointer",
        border: "1px solid",
        borderColor: on ? "var(--border-strong)" : "transparent",
        background: on ? "var(--surface-card)" : "transparent",
        color: on ? "var(--text-primary)" : "var(--text-muted)"
      }
    }, lbl);
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      padding: "4px 10px 12px"
    }
  }, list.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--text-faint)",
      fontFamily: "var(--font-body)",
      fontSize: 13,
      padding: "32px 0"
    }
  }, "No conversations here."), list.map(c => {
    const ch = CHN[c.ch],
      st = STS[c.status],
      on = sel === c.id;
    return /*#__PURE__*/React.createElement("button", {
      key: c.id,
      onClick: () => setSel(c.id),
      style: {
        width: "100%",
        textAlign: "left",
        display: "flex",
        gap: 12,
        padding: "12px",
        borderRadius: 13,
        cursor: "pointer",
        marginBottom: 2,
        border: "1px solid",
        borderColor: on ? "var(--border-default)" : "transparent",
        background: on ? "var(--surface-card)" : "transparent",
        transition: "background .15s"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        position: "relative",
        flex: "none"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 38,
        height: 38,
        borderRadius: 11,
        display: "grid",
        placeItems: "center",
        background: ch.bg,
        color: ch.c,
        fontFamily: "var(--font-mono)",
        fontSize: 13,
        fontWeight: 500
      }
    }, c.name[0]), /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        bottom: -2,
        right: -2,
        width: 13,
        height: 13,
        borderRadius: 999,
        background: ch.c,
        border: "2px solid var(--bg-page)"
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-body)",
        fontSize: 14,
        fontWeight: c.unread ? 700 : 600,
        color: "var(--text-primary)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }
    }, c.name), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: 10.5,
        color: "var(--text-faint)",
        flex: "none"
      }
    }, c.time)), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "block",
        fontFamily: "var(--font-body)",
        fontSize: 12.5,
        color: c.unread ? "var(--text-secondary)" : "var(--text-muted)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        marginTop: 3
      }
    }, c.preview), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        marginTop: 7
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 5,
        height: 5,
        borderRadius: 999,
        background: st.c
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: st.c
      }
    }, st.label))));
  })));
}
function Thread({
  conv,
  onSend,
  onBook
}) {
  const [draft, setDraft] = React.useState("");
  const [usedAI, setUsedAI] = React.useState(false);
  const endRef = React.useRef(null);
  React.useEffect(() => {
    setDraft("");
    setUsedAI(false);
  }, [conv && conv.id]);
  React.useEffect(() => {
    if (endRef.current) endRef.current.scrollTop = endRef.current.scrollHeight;
  }, [conv && conv.msgs.length]);
  if (!conv) return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "grid",
      placeItems: "center",
      color: "var(--text-faint)",
      fontFamily: "var(--font-body)"
    }
  }, "Select a conversation");
  const ch = CHN[conv.ch],
    st = STS[conv.status];
  const suggestion = AIS[conv.id];
  const send = () => {
    if (!draft.trim()) return;
    onSend(conv.id, draft.trim());
    setDraft("");
    setUsedAI(false);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      minWidth: 0,
      background: "var(--bg-page)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 64,
      flex: "none",
      borderBottom: "1px solid var(--border-subtle)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 22px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 38,
      height: 38,
      borderRadius: 11,
      display: "grid",
      placeItems: "center",
      background: ch.bg,
      color: ch.c,
      fontFamily: "var(--font-mono)",
      fontWeight: 500
    }
  }, conv.name[0]), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontWeight: 600,
      fontSize: 15,
      color: "var(--text-primary)"
    }
  }, conv.name), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 7,
      marginTop: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 10.5,
      color: ch.c
    }
  }, ch.label), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 3,
      height: 3,
      borderRadius: 999,
      background: "var(--text-faint)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 10.5,
      color: "var(--text-faint)"
    }
  }, "Patient enquiry")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "5px 11px",
      borderRadius: 999,
      background: "rgba(174,187,206,0.08)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: 999,
      background: st.c
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 10.5,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: st.c
    }
  }, st.label)), /*#__PURE__*/React.createElement("button", {
    onClick: () => onBook(conv.id),
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      padding: "8px 14px",
      borderRadius: 10,
      cursor: "pointer",
      border: "1px solid var(--border-default)",
      background: "var(--surface-card)",
      color: "var(--text-primary)",
      fontFamily: "var(--font-body)",
      fontSize: 13,
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement(K.calendar, {
    s: 15
  }), " Mark booked"))), /*#__PURE__*/React.createElement("div", {
    ref: endRef,
    style: {
      flex: 1,
      overflowY: "auto",
      padding: "26px 22px",
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      fontFamily: "var(--font-mono)",
      fontSize: 10.5,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: "var(--text-faint)",
      marginBottom: 4
    }
  }, "Today"), conv.msgs.map((m, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      justifyContent: m.from === "me" ? "flex-end" : "flex-start"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "72%",
      padding: "11px 15px",
      borderRadius: m.from === "me" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
      background: m.from === "me" ? "var(--accent)" : "var(--surface-card)",
      color: m.from === "me" ? "#fff" : "var(--text-secondary)",
      border: m.from === "me" ? "none" : "1px solid var(--border-subtle)",
      boxShadow: m.from === "me" ? "0 4px 16px rgba(47,124,240,0.25)" : "none"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 14,
      lineHeight: 1.45
    }
  }, m.t), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 9.5,
      marginTop: 5,
      opacity: 0.6,
      textAlign: "right"
    }
  }, m.at))))), suggestion && !usedAI && /*#__PURE__*/React.createElement("div", {
    style: {
      margin: "0 22px 10px",
      padding: "12px 14px",
      borderRadius: 14,
      background: "rgba(52,207,234,0.07)",
      border: "1px solid rgba(52,207,234,0.22)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 7,
      marginBottom: 7
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--accent-glow)",
      display: "flex"
    }
  }, /*#__PURE__*/React.createElement(K.spark, {
    s: 14
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "var(--accent-glow)"
    }
  }, "AI receptionist \xB7 suggested reply")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 13.5,
      color: "var(--text-secondary)",
      lineHeight: 1.5,
      marginBottom: 10
    }
  }, suggestion), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setDraft(suggestion);
      setUsedAI(true);
    },
    style: {
      padding: "7px 13px",
      borderRadius: 9,
      cursor: "pointer",
      border: "none",
      background: "var(--accent-glow)",
      color: "var(--bg-void)",
      fontFamily: "var(--font-body)",
      fontSize: 12.5,
      fontWeight: 700
    }
  }, "Use reply"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setUsedAI(true),
    style: {
      padding: "7px 13px",
      borderRadius: 9,
      cursor: "pointer",
      border: "1px solid var(--border-default)",
      background: "transparent",
      color: "var(--text-muted)",
      fontFamily: "var(--font-body)",
      fontSize: 12.5,
      fontWeight: 600
    }
  }, "Dismiss"))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "none",
      borderTop: "1px solid var(--border-subtle)",
      padding: "14px 22px 18px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      gap: 10,
      padding: "8px 8px 8px 16px",
      background: "var(--surface-inset)",
      border: "1px solid var(--border-default)",
      borderRadius: 14
    }
  }, /*#__PURE__*/React.createElement("textarea", {
    value: draft,
    onChange: e => setDraft(e.target.value),
    rows: 1,
    placeholder: "Write a reply\u2026",
    onKeyDown: e => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    },
    style: {
      flex: 1,
      resize: "none",
      background: "transparent",
      border: "none",
      outline: "none",
      color: "var(--text-primary)",
      fontFamily: "var(--font-body)",
      fontSize: 14,
      lineHeight: 1.5,
      padding: "6px 0",
      maxHeight: 90
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: send,
    disabled: !draft.trim(),
    style: {
      width: 40,
      height: 40,
      flex: "none",
      borderRadius: 11,
      display: "grid",
      placeItems: "center",
      cursor: draft.trim() ? "pointer" : "default",
      border: "none",
      background: draft.trim() ? "var(--accent)" : "var(--surface-hover)",
      color: draft.trim() ? "#fff" : "var(--text-faint)",
      transition: "background .2s"
    }
  }, /*#__PURE__*/React.createElement(K.send, {
    s: 18
  })))));
}
function App() {
  const [convs, setConvs] = React.useState(DATA);
  const [active, setActive] = React.useState("all");
  const [filter, setFilter] = React.useState("open");
  const [query, setQuery] = React.useState("");
  const [sel, setSel] = React.useState(1);
  const list = convs.filter(c => {
    if (active !== "all" && c.ch !== active) return false;
    if (filter === "open" && c.status === "booked") return false;
    if (filter === "assigned" && c.status !== "assigned") return false;
    if (filter === "booked" && c.status !== "booked") return false;
    if (query && !(c.name + c.preview).toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });
  const conv = convs.find(c => c.id === sel) || null;
  const onSend = (id, t) => setConvs(cs => cs.map(c => c.id === id ? {
    ...c,
    unread: false,
    status: c.status === "new" ? "assigned" : c.status,
    preview: t,
    time: "now",
    msgs: [...c.msgs, {
      from: "me",
      t,
      at: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })
    }]
  } : c));
  const onBook = id => setConvs(cs => cs.map(c => c.id === id ? {
    ...c,
    status: "booked"
  } : c));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100vh",
      display: "flex",
      overflow: "hidden",
      background: "var(--bg-void)"
    }
  }, /*#__PURE__*/React.createElement(Rail, {
    active: active,
    setActive: setActive
  }), /*#__PURE__*/React.createElement(ConvList, {
    list: list,
    sel: sel,
    setSel: setSel,
    filter: filter,
    setFilter: setFilter,
    query: query,
    setQuery: setQuery
  }), /*#__PURE__*/React.createElement(Thread, {
    conv: list.find(c => c.id === sel) ? conv : list[0] || conv,
    onSend: onSend,
    onBook: onBook
  }));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/sookly/app.jsx", error: String((e && e.message) || e) }); }

// ui_kits/sookly/data.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Sookly — omnichat + AI receptionist inbox. Self-contained interactive kit.

function I({
  d,
  s = 20,
  w = 1.75,
  c,
  vb = "0 0 24 24"
}) {
  return /*#__PURE__*/React.createElement("svg", {
    width: s,
    height: s,
    viewBox: vb,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: w,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, c || /*#__PURE__*/React.createElement("path", {
    d: d
  }));
}
const Ico = {
  inbox: p => /*#__PURE__*/React.createElement(I, _extends({}, p, {
    c: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M22 12h-6l-2 3h-4l-2-3H2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"
    }))
  })),
  send: p => /*#__PURE__*/React.createElement(I, _extends({}, p, {
    c: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "m22 2-7 20-4-9-9-4Z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M22 2 11 13"
    }))
  })),
  search: p => /*#__PURE__*/React.createElement(I, _extends({}, p, {
    c: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "11",
      cy: "11",
      r: "7"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M21 21l-4.3-4.3"
    }))
  })),
  spark: p => /*#__PURE__*/React.createElement(I, _extends({}, p, {
    c: /*#__PURE__*/React.createElement("path", {
      d: "M12 3v3m0 12v3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1M3 12h3m12 0h3M5.6 18.4l2.1-2.1m8.6-8.6 2.1-2.1"
    })
  })),
  user: p => /*#__PURE__*/React.createElement(I, _extends({}, p, {
    c: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "8",
      r: "4"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"
    }))
  })),
  calendar: p => /*#__PURE__*/React.createElement(I, _extends({}, p, {
    c: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "4",
      width: "18",
      height: "18",
      rx: "2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M16 2v4M8 2v4M3 10h18"
    }))
  })),
  settings: p => /*#__PURE__*/React.createElement(I, _extends({}, p, {
    c: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "3"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
    }))
  })),
  check: p => /*#__PURE__*/React.createElement(I, _extends({}, p, {
    c: /*#__PURE__*/React.createElement("path", {
      d: "M20 6 9 17l-5-5"
    })
  })),
  dot: p => /*#__PURE__*/React.createElement(I, _extends({}, p, {
    c: /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "9"
    })
  })),
  bolt: p => /*#__PURE__*/React.createElement(I, _extends({}, p, {
    c: /*#__PURE__*/React.createElement("path", {
      d: "M13 2 3 14h7l-1 8 10-12h-7l1-8z"
    })
  }))
};

// Channel meta — restrained tints, not brand-loud
const CH = {
  line: {
    label: "LINE",
    c: "var(--success-400)",
    bg: "rgba(33,184,132,0.14)"
  },
  fb: {
    label: "Messenger",
    c: "var(--blue-400)",
    bg: "rgba(47,124,240,0.14)"
  },
  wa: {
    label: "WhatsApp",
    c: "var(--cyan-400)",
    bg: "rgba(52,207,234,0.13)"
  },
  web: {
    label: "Website",
    c: "var(--violet-400)",
    bg: "rgba(124,99,238,0.15)"
  }
};
const ST = {
  new: {
    label: "New",
    c: "var(--cyan-400)"
  },
  assigned: {
    label: "Assigned",
    c: "var(--warning-400)"
  },
  booked: {
    label: "Booked",
    c: "var(--success-400)"
  }
};
const SEED = [{
  id: 1,
  ch: "line",
  name: "Naphat K.",
  preview: "What times are available this week?",
  time: "2m",
  status: "new",
  unread: true,
  msgs: [{
    from: "them",
    t: "Hi, what times are available this week?",
    at: "09:41"
  }, {
    from: "them",
    t: "Looking for an afternoon if possible.",
    at: "09:41"
  }]
}, {
  id: 2,
  ch: "fb",
  name: "Sunisa T.",
  preview: "Is Dr. Aom available on Monday?",
  time: "14m",
  status: "assigned",
  msgs: [{
    from: "them",
    t: "Is Dr. Aom available on Monday morning?",
    at: "09:28"
  }, {
    from: "me",
    t: "Let me check the schedule for you.",
    at: "09:30"
  }]
}, {
  id: 3,
  ch: "wa",
  name: "Maria L.",
  preview: "I'd like to book a check-up please",
  time: "1h",
  status: "booked",
  msgs: [{
    from: "them",
    t: "I'd like to book a check-up please.",
    at: "08:50"
  }, {
    from: "me",
    t: "Booked you for Thursday 2pm. See you then.",
    at: "08:54"
  }]
}, {
  id: 4,
  ch: "web",
  name: "James W.",
  preview: "First-time patient — need information",
  time: "3h",
  status: "new",
  unread: true,
  msgs: [{
    from: "them",
    t: "First-time patient here. What do I need to bring?",
    at: "07:12"
  }]
}, {
  id: 5,
  ch: "line",
  name: "Areeya P.",
  preview: "Thank you, see you tomorrow",
  time: "5h",
  status: "booked",
  msgs: [{
    from: "them",
    t: "Thank you, see you tomorrow!",
    at: "05:30"
  }]
}];
const AI_SUGGEST = {
  1: "We have Tuesday 2:00pm and Thursday 4:30pm open this week. Would either suit you?",
  2: "Dr. Aom has 9:30am and 11:00am free on Monday. Shall I reserve one?",
  4: "Welcome! Please bring a photo ID and any prior records. Your first visit takes about 30 minutes."
};
Object.assign(window, {
  Ico,
  CH,
  ST,
  SEED,
  AI_SUGGEST
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/sookly/data.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Overline = __ds_scope.Overline;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.StatTile = __ds_scope.StatTile;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Switch = __ds_scope.Switch;

})();
