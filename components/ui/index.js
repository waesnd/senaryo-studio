import { cloneElement, forwardRef, isValidElement, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

const cx = (...classes) => classes.filter(Boolean).join(" ");
const modalStack = [];
let previousBodyOverflow = "";
function updateModalStack() {
  const top = modalStack[modalStack.length - 1];
  for (const entry of modalStack) {
    const active = entry === top;
    entry.dialog.inert = !active;
    entry.dialog.setAttribute("aria-modal", String(active));
    if (active) entry.dialog.removeAttribute("aria-hidden");
    else entry.dialog.setAttribute("aria-hidden", "true");
  }
}

export function Spinner({ className, label = "Yükleniyor", ...props }) {
  return <span role="status" className={cx("spinner", className)} {...props}><span className="sr-only">{label}</span></span>;
}

export const Button = forwardRef(function Button({ children, variant = "primary", size = "md", loading = false, className, disabled, href, type = "button", ...props }, ref) {
  const classes = cx("btn", `btn-${variant}`, `btn-${size}`, className);
  if (href && !disabled && !loading) return <Link ref={ref} href={href} className={classes} {...props}>{children}</Link>;
  return <button ref={ref} type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>{loading && <Spinner />}{children}</button>;
});

export const Card = forwardRef(function Card({ children, className, as: Component = "section", ...props }, ref) {
  return <Component ref={ref} className={cx("card", className)} {...props}>{children}</Component>;
});

export function Badge({ tone = "neutral", children, className, ...props }) {
  return <span className={cx("badge", `badge-${tone}`, className)} {...props}>{children}</span>;
}

export const Input = forwardRef(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cx("input", className)} {...props} />;
});
export const Textarea = forwardRef(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cx("input", "textarea", className)} {...props} />;
});
export const Select = forwardRef(function Select({ className, children, ...props }, ref) {
  return <select ref={ref} className={cx("input", "select", className)} {...props}>{children}</select>;
});

export function Field({ label, hint, error, children, htmlFor, className }) {
  const generatedId = useId();
  const singleChild = isValidElement(children);
  const controlId = htmlFor || (singleChild && children.props.id) || `field-${generatedId}`;
  const descriptionId = `${controlId}-description`;
  const describedBy = singleChild ? [children.props["aria-describedby"], (error || hint) && descriptionId].filter(Boolean).join(" ") : undefined;
  const control = singleChild ? cloneElement(children, {
    id: controlId,
    "aria-describedby": describedBy || undefined,
    "aria-invalid": error ? true : children.props["aria-invalid"],
  }) : children;
  return <div className={cx("field", className)}>
    {label && <label className="field-label" htmlFor={controlId}>{label}</label>}
    {control}
    {error ? <p id={descriptionId} className="field-error" role="alert">{error}</p> : hint ? <p id={descriptionId} className="field-hint">{hint}</p> : null}
  </div>;
}

export function EmptyState({ icon: Icon, title, description, action, className, children }) {
  return <div className={cx("empty-state", className)}>
    <div className="empty-state-icon" aria-hidden="true">{typeof Icon === "function" || (typeof Icon === "object" && Icon?.$$typeof && !Icon?.props) ? <Icon size={26} strokeWidth={1.5} /> : Icon || <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v5h4M10 12h5M10 16h5"/></svg>}</div>
    <h3>{title}</h3>
    {description && <p>{description}</p>}
    {children}
    {action && <div className="empty-state-action">{action}</div>}
  </div>;
}

export function PageHeader({ title, eyebrow, description, actions, className }) {
  return <div className={cx("page-header", className)}><div>
    {eyebrow && <p className="section-label">{eyebrow}</p>}
    <h1>{title}</h1>
    {description && <p className="page-description">{description}</p>}
  </div>{actions && <div className="page-actions">{actions}</div>}</div>;
}

export function Alert({ tone = "info", title, children, onDismiss, className, ...props }) {
  return <div role={tone === "danger" || tone === "error" ? "alert" : "status"} className={cx("alert", `alert-${tone}`, className)} {...props}>
    <div className="alert-copy">{title && <strong>{title}</strong>}{children && <div>{children}</div>}</div>
    {onDismiss && <button type="button" className="icon-button" onClick={onDismiss} aria-label="Bildirimi kapat">×</button>}
  </div>;
}

export function Toast({ open = true, tone = "info", title, children, onDismiss, className, ...props }) {
  if (!open) return null;
  return <div className={cx("toast", className)}><Alert tone={tone} title={title} onDismiss={onDismiss} {...props}>{children}</Alert></div>;
}

export function Dialog({ open, onClose, title, children, actions, className, description }) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);
  const [mounted, setMounted] = useState(false);
  closeRef.current = onClose;
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (!open || !mounted) return;
    const previousFocus = document.activeElement;
    if (!modalStack.length) previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = dialogRef.current;
    const entry = { dialog };
    modalStack.push(entry);
    updateModalStack();
    const isTop = () => modalStack[modalStack.length - 1] === entry;
    const focusable = () => Array.from(dialog?.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex="0"]') || []).filter(node => !node.hidden && node.getAttribute("aria-hidden") !== "true" && node.getClientRects().length);
    (focusable()[0] || dialog)?.focus();
    const handleKey = event => {
      if (!isTop()) return;
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); closeRef.current?.(); }
      if (event.key !== "Tab") return;
      const nodes = focusable();
      if (!nodes.length) { event.preventDefault(); dialog?.focus(); return; }
      if (event.shiftKey && (document.activeElement === nodes[0] || !dialog?.contains(document.activeElement))) { event.preventDefault(); nodes[nodes.length - 1].focus(); }
      else if (!event.shiftKey && (document.activeElement === nodes[nodes.length - 1] || !dialog?.contains(document.activeElement))) { event.preventDefault(); nodes[0].focus(); }
    };
    const handleFocus = event => { if (isTop() && !dialog?.contains(event.target)) (focusable()[0] || dialog)?.focus(); };
    document.addEventListener("keydown", handleKey);
    document.addEventListener("focusin", handleFocus);
    return () => {
      const wasTop = isTop();
      const index = modalStack.indexOf(entry);
      if (index !== -1) modalStack.splice(index, 1);
      updateModalStack();
      if (!modalStack.length) document.body.style.overflow = previousBodyOverflow;
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("focusin", handleFocus);
      if (wasTop && previousFocus?.isConnected) previousFocus.focus();
    };
  }, [open, mounted]);
  if (!open || !mounted) return null;
  return createPortal(<div className="dialog-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose?.(); }}>
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined} tabIndex={-1} className={cx("dialog", className)}>
      <div className="dialog-header"><div><h2 id={titleId}>{title}</h2>{description && <p id={descriptionId} className="muted small">{description}</p>}</div><button className="icon-button dialog-close" onClick={onClose} type="button" aria-label="Pencereyi kapat"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div>
      <div className="dialog-body">{children}</div>
      {actions && <div className="dialog-actions">{actions}</div>}
    </div>
  </div>, document.body);
}

export function Tabs({ items = [], value, onChange, className, label = "Görünüm seçimi" }) {
  const tabsRef = useRef(null);
  const selectedIndex = Math.max(0, items.findIndex(item => item.id === value));
  const keyboard = (event, index) => {
    const last = items.length - 1;
    let next;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = index === last ? 0 : index + 1;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = index === 0 ? last : index - 1;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = last;
    if (next === undefined) return;
    event.preventDefault();
    onChange?.(items[next].id);
    tabsRef.current?.querySelectorAll('[role="tab"]')[next]?.focus();
  };
  return <div ref={tabsRef} role="tablist" aria-label={label} className={cx("tabs", className)}>{items.map((item, index) => <button key={item.id} type="button" role="tab" aria-selected={item.id === value} tabIndex={index === selectedIndex ? 0 : -1} onClick={() => onChange?.(item.id)} onKeyDown={event => keyboard(event, index)} className={cx("tab", item.id === value && "is-active")}>{item.label}{item.count !== undefined && <span className="tab-count">{item.count}</span>}</button>)}</div>;
}
