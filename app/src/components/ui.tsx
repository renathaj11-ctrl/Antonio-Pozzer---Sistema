import type { ReactNode } from "react";

export type Tone = "neutral" | "info" | "warn" | "danger" | "ok" | "done";

export function Badge({ tone = "neutral", children, dot = false }: {
  tone?: Tone;
  children: ReactNode;
  dot?: boolean;
}) {
  return (
    <span className={`badge badge-${tone}`}>
      {dot && <span className="badge-dot" />}
      {children}
    </span>
  );
}

export function Card({ title, subtitle, actions, children, className = "", tight = false }: {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  tight?: boolean;
}) {
  return (
    <section className={`card ${className}`}>
      {(title || actions) && (
        <header className="card-head">
          <div>
            {title && <h2>{title}</h2>}
            {subtitle && <p className="muted">{subtitle}</p>}
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </header>
      )}
      <div className={tight ? "card-body tight" : "card-body"}>{children}</div>
    </section>
  );
}

export function Field({ label, hint, required, className = "", children }: {
  label: string;
  hint?: ReactNode;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`field ${className}`}>
      <span>{label}{required && <em>*</em>}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}

export function Alert({ tone = "info", children }: { tone?: "ok" | "warn" | "danger" | "info"; children: ReactNode }) {
  const icon = tone === "ok" ? "✓" : tone === "warn" ? "!" : tone === "danger" ? "×" : "i";
  return (
    <div className={`alert alert-${tone}`} role={tone === "danger" || tone === "warn" ? "alert" : "status"}>
      <strong aria-hidden="true">{icon}</strong>
      <div>{children}</div>
    </div>
  );
}

export function Stat({ label, value, hint, tone }: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "warn" | "danger" | "ok";
}) {
  return (
    <div className="kpi" data-tone={tone}>
      <span className="kpi-value">{value}</span>
      <span className="kpi-label">{label}</span>
      {hint && <span className="kpi-hint">{hint}</span>}
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <strong>{title}</strong>
      {children}
    </div>
  );
}

export function Progress({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="spread small" style={{ marginBottom: 4 }}>
        <span className="muted">Progresso do caso</span>
        <span><strong>{value}</strong>/{total} etapas</span>
      </div>
      <div className="progress" aria-label={`${pct}% concluído`}>
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function Dl({ items }: { items: Array<{ label: string; value: ReactNode }> }) {
  return (
    <dl className="dl">
      {items.map((item) => (
        <div key={item.label} style={{ display: "contents" }}>
          <dt>{item.label}</dt>
          <dd>{item.value || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}
