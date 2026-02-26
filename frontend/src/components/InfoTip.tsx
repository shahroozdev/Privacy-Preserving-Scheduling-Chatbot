interface InfoTipProps {
  text: string;
}

export function InfoTip({ text }: InfoTipProps) {
  return (
    <span className="relative inline-flex items-center group align-middle">
      <span className="ml-1 inline-flex h-4 w-4 items-center !-z-1 justify-center lowercase rounded-full border border-orange-300 text-[10px] font-light italic text-orange-300 cursor-help bg-transarent" style={{zIndex:-1}}>
        i
      </span>
      <em className="pointer-events-none absolute left-1/2 top-6 z-50 w-64 -translate-x-1/2 rounded-lg border border-slate-200 bg-white p-2 text-[11px] leading-relaxed text-slate-700 opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
        {text}
      </em>
    </span>
  );
}
