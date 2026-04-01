import type { PropsWithChildren } from "react";

export interface SemConteudoProps {
  title: string;
  description: string;
}

export interface PainelProps extends PropsWithChildren {
  className?: string;
}

export interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export interface CardIndicativoProps {
  label: string;
  value: string;
  highlight?: boolean;
}

