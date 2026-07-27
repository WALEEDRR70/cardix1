type Pane<K extends string> = { key: K; label: string };

/** Compact pill switcher used to keep related workspace screens on one page. */
export function PaneTabs<K extends string>({
  value,
  onChange,
  panes,
}: {
  value: K;
  onChange: (key: K) => void;
  panes: Pane<K>[];
}) {
  return (
    <div className="mb-4 inline-flex flex-wrap rounded-full border border-border/60 bg-card/50 p-1">
      {panes.map((p) => (
        <button
          key={p.key}
          type="button"
          onClick={() => onChange(p.key)}
          className={
            "rounded-full px-4 py-1.5 text-[12px] font-medium transition " +
            (value === p.key ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground")
          }
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
