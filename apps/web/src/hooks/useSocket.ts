import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

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
  creator: {
    id: string;
    email: string;
    role: string;
  };
  created_at: string;
}

interface NewQAMessageData {
  thread: QAThread;
  message: QAMessage;
}

interface UseSocketProps {
  spaceId: string;
  token: string;
}

export const useSocket = ({ spaceId, token }: UseSocketProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string>('');
  const [newMessages, setNewMessages] = useState<NewQAMessageData[]>([]);
  const [acceptedAnswers, setAcceptedAnswers] = useState<
    { messageId: string; threadId: string }[]
  >([]);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!spaceId || !token) return;

    // Create socket connection
    const socketInstance = io(
      import.meta.env.VITE_API_URL || 'http://localhost:4000',
      {
        auth: {
          token,
        },
        transports: ['websocket'],
      }
    );

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    // Connection events
    socketInstance.on('connect', () => {
      console.log('✅ Connected to Socket.io server');
      setIsConnected(true);
      setError('');

      // Join the space
      socketInstance.emit('join_space', spaceId);
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Disconnected from Socket.io server');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', err => {
      console.error('Connection error:', err);
      setError(`Connection failed: ${err.message}`);
      setIsConnected(false);
    });

    // Space events
    socketInstance.on(
      'joined_space',
      (data: { spaceId: string; spaceName: string }) => {
        console.log(`📍 Joined space: ${data.spaceName}`);
      }
    );

    // Q&A events
    socketInstance.on('new_qa_message', (data: NewQAMessageData) => {
      console.log('💬 New Q&A message received:', data);
      setNewMessages(prev => [...prev, data]);
    });

    socketInstance.on(
      'answer_accepted',
      (data: { messageId: string; threadId: string }) => {
        console.log('✅ Answer accepted:', data);
        setAcceptedAnswers(prev => [...prev, data]);
      }
    );

    // Error handling
    socketInstance.on('error', (data: { message: string }) => {
      console.error('Socket error:', data.message);
      setError(data.message);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [spaceId, token]);

  const sendMessage = (
    threadId: string | undefined,
    content: string,
    isAnswer = false
  ) => {
    if (!socket || !isConnected) {
      setError('Not connected to server');
      return;
    }

    socket.emit('qa_message', {
      spaceId,
      threadId,
      content,
      isAnswer,
    });
  };

  const acceptAnswer = (messageId: string) => {
    if (!socket || !isConnected) {
      setError('Not connected to server');
      return;
    }

    socket.emit('accept_answer', { messageId });
  };

  const clearNewMessages = () => {
    setNewMessages([]);
  };

  const clearAcceptedAnswers = () => {
    setAcceptedAnswers([]);
  };

  return {
    socket,
    isConnected,
    error,
    newMessages,
    acceptedAnswers,
    sendMessage,
    acceptAnswer,
    clearNewMessages,
    clearAcceptedAnswers,
  };
};
