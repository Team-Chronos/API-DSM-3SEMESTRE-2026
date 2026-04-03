import type { PainelProps } from "../../types/ui";

export default function Painel({ children, className = "" }: PainelProps) {
  return (
    <section
      className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm ${className}`}
    >
      {children}
    </section>
  );
}