import { Info } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  info?: string;
}

export function PageHeader({ title, description, info }: PageHeaderProps) {
  return (
    <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-950">{title}</h1>
          {description ? (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">{description}</p>
          ) : null}
        </div>
        {info ? (
          <div className="max-w-sm rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-600">
            <div className="mb-2 flex items-center gap-2 font-medium text-zinc-800">
              <Info className="h-4 w-4" />
              Як читати сторінку
            </div>
            <p className="leading-6">{info}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
