interface Alternative {
  room: {
    name: string;
    capacity: number;
    features: string[];
  };
  score: number;
  suggestedSlot?: string;
}

interface ChatBubbleProps {
  id: string;
  role: "user" | "bot";
  content: string;
  details?: {
    room?: string;
    time?: string;
    reason?: string;
    score?: number;
    capacity?: number;
    features?: string[];
    alternatives?: Alternative[];
  };
}

export function ChatBubble({ role, content, details }: ChatBubbleProps) {
  const isUser = role === "user";
  const to12Hour = (time?: string) => {
    if (!time) return "";
    const [h, m] = time.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return time;
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs lg:max-w-2xl px-4 py-3 rounded-2xl ${
          isUser
            ? "bg-cyan-700 text-white rounded-br-none"
            : "bg-slate-100 text-slate-900 rounded-bl-none"
        }`}
      >
        <p className="text-sm leading-relaxed">{content}</p>

        {details?.room && (
          <div className="mt-3 pt-3 border-t border-slate-300/70">
            <div className="space-y-2 text-sm">
              <div className="font-semibold text-base">{details.room}</div>
              <div className="flex flex-wrap gap-2 text-xs">
                {details.capacity !== undefined && (
                  <span className="px-2 py-1 rounded-full bg-slate-200 text-slate-800">
                    Capacity: {details.capacity}
                  </span>
                )}
                {details.score !== undefined && (
                  <span className="px-2 py-1 rounded-full bg-emerald-200 text-emerald-900 font-semibold">
                    Match Score: {details.score}%
                  </span>
                )}
                {details.time && (
                  <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-900">
                    Slot: {to12Hour(details.time)}
                  </span>
                )}
              </div>

              {details.features && details.features.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {details.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-2 py-1 rounded-full bg-slate-200 text-slate-700 text-xs capitalize"
                    >
                      {feature.replace("_"," ")}
                    </span>
                  ))}
                </div>
              )}

              {details.reason && (
                <div className="text-xs italic opacity-90">{details.reason}</div>
              )}
            </div>

            {details.alternatives && details.alternatives.length > 0 && (
              <div className="mt-3 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Top Alternatives
                </div>
                {details.alternatives.map((alt) => (
                  <div
                    key={`${alt.room.name}-${alt.score}`}
                    className="rounded-xl bg-slate-200/70 px-3 py-2 text-xs transition-all duration-300 hover:bg-slate-200 hover:-translate-y-0.5"
                  >
                    <div className="font-semibold">{alt.room.name}</div>
                    <div>
                      Capacity: {alt.room.capacity} | Score: {alt.score}%
                    </div>
                    {alt.suggestedSlot && (
                      <div>Slot: {to12Hour(alt.suggestedSlot)}</div>
                    )}
                    {alt.room.features?.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {alt.room.features.slice(0, 5).map((feature) => (
                          <span
                            key={`${alt.room.name}-${feature}`}
                            className="px-2 py-0.5 rounded-full bg-slate-300 text-slate-700 text-[10px] capitalize"
                          >
                            {feature.replace("_"," ")}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {details?.reason && !details?.room && (
          <div className="mt-2 text-xs italic opacity-90">{details.reason}</div>
        )}
      </div>
    </div>
  );
}
