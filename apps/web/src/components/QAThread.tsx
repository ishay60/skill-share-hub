import React, { useState } from 'react';

interface QAMessage {
  id: string;
  content: string;
  is_answer: boolean;
  is_accepted: boolean;
  created_at: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

interface QAThread {
  id: string;
  title: string;
  status: string;
  created_at: string;
  creator: {
    id: string;
    email: string;
    role: string;
  };
  messages: QAMessage[];
  _count?: {
    messages: number;
  };
}

interface QAThreadProps {
  thread: QAThread;
  currentUserId?: string;
  isSpaceOwner?: boolean;
  onSendMessage: (
    threadId: string,
    content: string,
    isAnswer?: boolean
  ) => void;
  onAcceptAnswer: (messageId: string) => void;
}

export const QAThreadComponent: React.FC<QAThreadProps> = ({
  thread,
  currentUserId,
  isSpaceOwner,
  onSendMessage,
  onAcceptAnswer,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isAnswerMode, setIsAnswerMode] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    onSendMessage(thread.id, newMessage.trim(), isAnswerMode);
    setNewMessage('');
    setIsAnswerMode(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getMessageIcon = (message: QAMessage) => {
    if (message.is_accepted) return '✅';
    if (message.is_answer) return '💡';
    return '❓';
  };

  const getMessageStyle = (message: QAMessage) => {
    if (message.is_accepted) return 'border-l-4 border-green-500 bg-green-50';
    if (message.is_answer) return 'border-l-4 border-blue-500 bg-blue-50';
    return 'border-l-4 border-gray-300 bg-gray-50';
  };

  return (
    <div className="border rounded-lg p-4 mb-4 bg-white shadow-sm">
      {/* Thread Header */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{thread.title}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
            <span>by {thread.creator.email}</span>
            <span>•</span>
            <span>{formatDate(thread.created_at)}</span>
            <span>•</span>
            <span>
              {thread._count?.messages || thread.messages.length} messages
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {thread.status === 'closed' && (
            <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
              Closed
            </span>
          )}
          <button className="text-gray-400 hover:text-gray-600">
            {isExpanded ? '▼' : '▶'}
          </button>
        </div>
      </div>

      {/* Thread Messages */}
      {isExpanded && (
        <div className="mt-4 space-y-3">
          {thread.messages.map(message => (
            <div
              key={message.id}
              className={`p-3 rounded ${getMessageStyle(message)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getMessageIcon(message)}</span>
                    <span className="font-medium text-sm text-gray-700">
                      {message.user.email}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(message.created_at)}
                    </span>
                    {message.is_answer && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        Answer
                      </span>
                    )}
                    {message.is_accepted && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        Accepted
                      </span>
                    )}
                  </div>
                  <p className="text-gray-800">{message.content}</p>
                </div>

                {/* Accept Answer Button (for space owners) */}
                {isSpaceOwner &&
                  message.is_answer &&
                  !message.is_accepted &&
                  message.user.id !== currentUserId && (
                    <button
                      onClick={() => onAcceptAnswer(message.id)}
                      className="ml-2 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Accept
                    </button>
                  )}
              </div>
            </div>
          ))}

          {/* Reply Form */}
          {thread.status !== 'closed' && (
            <form onSubmit={handleSendMessage} className="mt-4 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`answer-mode-${thread.id}`}
                  checked={isAnswerMode}
                  onChange={e => setIsAnswerMode(e.target.checked)}
                  className="rounded"
                />
                <label
                  htmlFor={`answer-mode-${thread.id}`}
                  className="text-sm text-gray-600"
                >
                  Mark as answer
                </label>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder={
                    isAnswerMode
                      ? 'Provide an answer...'
                      : 'Ask a follow-up question...'
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className={`px-4 py-2 rounded-md font-medium ${
                    isAnswerMode
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isAnswerMode ? '💡 Answer' : '💬 Reply'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
