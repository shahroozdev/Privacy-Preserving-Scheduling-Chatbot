interface ChatBubbleProps {
  id: string;
  role: 'user' | 'bot';
  content: string;
  details?: {
    room?: string;
    time?: string;
    reason?: string;
  };
}

export function ChatBubble({ role, content, details }: ChatBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-slate-100 text-slate-900 rounded-bl-none'
        }`}
      >
        <p className="text-sm leading-relaxed">{content}</p>

        {details?.room && (
          <div className="mt-3 pt-3 border-t border-slate-300">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold">📍 Room:</span>
                <span>{details.room}</span>
              </div>
              {details.time && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold">🕐 Time:</span>
                  <span>{details.time}</span>
                </div>
              )}
              {details.reason && (
                <div className="text-xs italic opacity-90">
                  {details.reason}
                </div>
              )}
            </div>
          </div>
        )}

        {details?.reason && !details?.room && (
          <div className="mt-2 text-xs italic opacity-90">
            {details.reason}
          </div>
        )}
      </div>
    </div>
  );
}
