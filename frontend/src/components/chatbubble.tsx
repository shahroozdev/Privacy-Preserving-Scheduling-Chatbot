import React from 'react';

interface ChatBubbleProps {
    role: 'user' | 'bot';
    content: string;
    details?: {
        room?: string;
        time?: string;
        reason?: string;
    };
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ role, content, details }) => {
    const isUser = role === 'user';
    return (
        <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg p-4 ${isUser ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 border border-gray-200'}`}>
                <p className="whitespace-pre-wrap">{content}</p>
                
                {!isUser && details && (
                    <div className="mt-3 pt-3 border-t border-gray-300 text-sm">
                        {details.room && <div className="font-semibold text-blue-800">Room: {details.room}</div>}
                        {details.time && <div className="font-semibold text-blue-800">Time: {details.time}</div>}
                        {details.reason && <div className="mt-1 text-gray-600 italic">" {details.reason} "</div>}
                    </div>
                )}
            </div>
        </div>
    );
};
