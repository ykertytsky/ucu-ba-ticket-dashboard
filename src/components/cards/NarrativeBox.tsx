import { MessageSquareText } from "lucide-react";

export function NarrativeBox({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-950 p-5 text-zinc-50 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">
        <MessageSquareText className="h-4 w-4" />
        Операційний підсумок
      </div>
      <p className="text-base leading-7 text-zinc-100">{text}</p>
    </div>
  );
}
