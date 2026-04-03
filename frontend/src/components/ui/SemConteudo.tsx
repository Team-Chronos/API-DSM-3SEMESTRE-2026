import type { SemConteudoProps } from '../../types/ui'

export default function SemConteudo({
  title,
  description,
}: SemConteudoProps) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-black/10 px-6 py-10 text-center">
      <p className="text-base font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm text-white/55">{description}</p>
    </div>
  );
}