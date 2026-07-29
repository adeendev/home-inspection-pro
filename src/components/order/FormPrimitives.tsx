import { Label } from "@/components/ui/label";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</Label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export function RadioCard({
  value,
  current,
  title,
  desc,
}: {
  value: string;
  current: string;
  title: string;
  desc: string;
}) {
  const active = value === current;
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-4 transition-all",
        active
          ? "border-brass shadow-[0_4px_12px_-8px_oklch(0.76_0.12_80/0.35)]"
          : "border-border hover:border-ink/20 hover:shadow-sm",
      )}
    >
      <RadioGroupItem value={value} className="mt-0.5" />
      <div>
        <p className="font-medium text-ink">{title}</p>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </label>
  );
}
