import React, { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { QAThreadComponent } from './QAThread';

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

interface QAWidgetProps {
  spaceId: string;
  spaceSlug: string;
  spaceName: string;
  currentUserId?: string;
  isSpaceOwner?: boolean;
  token: string;
}

export const QAWidget: React.FC<QAWidgetProps> = ({
  spaceId,
  spaceSlug,
  spaceName,
  currentUserId,
  isSpaceOwner,
  token,
}) => {
  const [threads, setThreads] = useState<QAThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewThreadForm, setShowNewThreadForm] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');

  const {
    isConnected,
    error: socketError,
    newMessages,
    acceptedAnswers,
    sendMessage,
    acceptAnswer,
    clearNewMessages,
    clearAcceptedAnswers,
  } = useSocket({ spaceId, token });

  // Load initial threads
  useEffect(() => {
    loadThreads();
  }, [spaceSlug]);

  // Handle new real-time messages
  useEffect(() => {
    if (newMessages.length > 0) {
      newMessages.forEach(data => {
        setThreads(prevThreads => {
          const existingThreadIndex = prevThreads.findIndex(
            t => t.id === data.thread.id
          );

          if (existingThreadIndex >= 0) {
            // Update existing thread
            const updatedThreads = [...prevThreads];
            const existingThread = updatedThreads[existingThreadIndex];

            // Check if message already exists
            const messageExists = existingThread.messages.some(
              m => m.id === data.message.id
            );
            if (!messageExists) {
              updatedThreads[existingThreadIndex] = {
                ...existingThread,
                messages: [...existingThread.messages, data.message],
                _count: {
                  messages:
                    (existingThread._count?.messages ||
                      existingThread.messages.length) + 1,
                },
              };
            }
            return updatedThreads;
          } else {
            // Add new thread
            return [
              {
                id: data.thread.id,
                title: data.thread.title,
                status: 'active',
                created_at: data.thread.created_at,
                creator: data.thread.creator,
                messages: [data.message],
                _count: { messages: 1 },
              },
              ...prevThreads,
            ];
          }
        });
      });
      clearNewMessages();
    }
  }, [newMessages, clearNewMessages]);

  // Handle accepted answers
  useEffect(() => {
    if (acceptedAnswers.length > 0) {
      acceptedAnswers.forEach(data => {
        setThreads(prevThreads =>
          prevThreads.map(thread => {
            if (thread.id === data.threadId) {
              return {
                ...thread,
                messages: thread.messages.map(message =>
                  message.id === data.messageId
                    ? { ...message, is_accepted: true }
                    : message
                ),
              };
            }
            return thread;
          })
        );
      });
      clearAcceptedAnswers();
    }
  }, [acceptedAnswers, clearAcceptedAnswers]);

  const loadThreads = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/qa/spaces/${spaceSlug}/threads`
      );

      if (!response.ok) {
        throw new Error('Failed to load Q&A threads');
      }

      const data = await response.json();
      setThreads(data.threads);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load threads');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThreadTitle.trim() || !newThreadContent.trim()) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/qa/spaces/${spaceSlug}/threads`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: newThreadTitle.trim(),
            content: newThreadContent.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create thread');
      }

      const data = await response.json();
      setThreads(prev => [data.thread, ...prev]);
      setNewThreadTitle('');
      setNewThreadContent('');
      setShowNewThreadForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create thread');
    }
  };

  const handleSendMessage = (
    threadId: string,
    content: string,
    isAnswer = false
  ) => {
    sendMessage(threadId, content, isAnswer);
  };

  const handleAcceptAnswer = (messageId: string) => {
    acceptAnswer(messageId);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Q&A for {spaceName}
          </h2>
          <div className="flex items-center gap-2 mt-2 text-sm">
            <span
              className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
            ></span>
            <span className="text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'} • Real-time updates
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowNewThreadForm(!showNewThreadForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
        >
          ❓ Ask Question
        </button>
      </div>

      {/* Errors */}
      {(error || socketError) && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error || socketError}</p>
        </div>
      )}

      {/* New Thread Form */}
      {showNewThreadForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-3">Ask a New Question</h3>
          <form onSubmit={handleCreateThread} className="space-y-3">
            <input
              type="text"
              value={newThreadTitle}
              onChange={e => setNewThreadTitle(e.target.value)}
              placeholder="What's your question about?"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <textarea
              value={newThreadContent}
              onChange={e => setNewThreadContent(e.target.value)}
              placeholder="Provide more details about your question..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!newThreadTitle.trim() || !newThreadContent.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                📝 Post Question
              </button>
              <button
                type="button"
                onClick={() => setShowNewThreadForm(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Threads List */}
      {threads.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">💬</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No questions yet
          </h3>
          <p className="text-gray-600">
            Be the first to ask a question in this space!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {threads.map(thread => (
            <QAThreadComponent
              key={thread.id}
              thread={thread}
              currentUserId={currentUserId}
              isSpaceOwner={isSpaceOwner}
              onSendMessage={handleSendMessage}
              onAcceptAnswer={handleAcceptAnswer}
            />
          ))}
        </div>
      )}
    </div>
  );
};
