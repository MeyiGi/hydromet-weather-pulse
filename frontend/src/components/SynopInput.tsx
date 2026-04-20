"use client";

function isValidGroup(g: string) {
  return /^\d{3}$/.test(g) || /^\d{5}$/.test(g);
}

export function SynopInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const groups = value.trim() ? value.trim().split(/\s+/) : [];

  return (
    <div className="w-full space-y-3">
      <input
        type="text"
        value={value}
        onChange={(e) =>
          onChange(e.target.value.replace(/[^\d\s]/g, "").replace(/\s{2,}/g, " "))
        }
        disabled={disabled}
        placeholder="38476 22999 00801 10083 20000 38358 48610 52003 333 …"
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        className="w-full rounded-xl border border-input bg-background px-4 py-3 font-mono text-sm tracking-wider placeholder:text-muted-foreground/50 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      />
      {groups.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {groups.map((g, i) => {
            const sep = g === "333" || g === "555";
            const valid = isValidGroup(g);
            return (
              <span
                key={i}
                className={`rounded-md px-2 py-0.5 font-mono text-xs ${
                  sep
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    : valid
                    ? "bg-muted text-foreground"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {g}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
