import type { SearchProps } from "../../types/ui";

export default function Search({
  value,
  onChange,
  placeholder,
}: SearchProps) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-violet-400"
    />
  );
}