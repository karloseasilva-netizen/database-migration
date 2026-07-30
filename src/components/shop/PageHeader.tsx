import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  crumbs = [],
  children,
}: {
  title: string;
  subtitle?: string;
  crumbs?: { label: string }[];
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-8">
      <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-3 flex-wrap">
        <Link to="/" className="hover:text-primary transition">
          Início
        </Link>
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground/80">{c.label}</span>
          </span>
        ))}
      </nav>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
