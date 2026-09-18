// DAPAJO Socket.io Client
// Connects to NestJS WebSocket Gateway for real-time chat

import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3002';

let socket: Socket | null = null;

/**
 * Initialize Socket.io connection with JWT authentication.
 * Connects to /chat namespace on the backend WebSocket gateway.
 */
export function connectSocket(accessToken: string): Socket {
  if (socket?.connected) {
    return socket;
  }

  socket = io(`${WS_URL}/chat`, {
    auth: {
      token: accessToken,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    console.log('[DAPAJO WS] Connected to chat server:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('[DAPAJO WS] Disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.warn('[DAPAJO WS] Connection notice:', err.message);
  });

  return socket;
}

/**
 * Get current socket instance (may be null if not connected)
 */
export function getSocket(): Socket | null {
  return socket;
}

/**
 * Check if the Socket.io connection is currently active
 */
export function isSocketConnected(): boolean {
  return !!socket?.connected;
}

/**
 * Disconnect socket and clean up
 */
export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

// ─── Chat Event Emitters ─────────────────────────────────────────────

/**
 * Join a conversation room to receive real-time messages
 */
export function joinConversation(conversationId: string) {
  socket?.emit('join_conversation', { conversationId });
}

/**
 * Leave a conversation room when navigating away
 */
export function leaveConversation(conversationId: string) {
  socket?.emit('leave_conversation', { conversationId });
}

/**
 * Send a message via WebSocket (real-time delivery)
 */
export function sendMessageWS(data: {
  conversationId: string;
  content: string;
  type?: string;
  mediaUrl?: string;
}) {
  socket?.emit('send_message', data);
}

/**
 * Emit typing start indicator
 */
export function emitTypingStart(conversationId: string) {
  socket?.emit('typing_start', { conversationId });
}

/**
 * Emit typing stop indicator
 */
export function emitTypingStop(conversationId: string) {
  socket?.emit('typing_stop', { conversationId });
}

/**
 * Emit mark-as-read event
 */
export function emitMarkAsRead(conversationId: string) {
  socket?.emit('mark_as_read', { conversationId });
}

// ─── Chat Event Listeners ─────────────────────────────────────────────

/**
 * Listen for incoming messages in a conversation
 */
export function onReceiveMessage(
  callback: (message: {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    type: string;
    createdAt: string;
  }) => void,
) {
  socket?.on('receive_message', callback);
  return () => {
    socket?.off('receive_message', callback);
  };
}

/**
 * Listen for new message notifications (for the sidebar/badge)
 */
export function onNewMessageNotification(
  callback: (data: {
    conversationId: string;
    message: {
      id: string;
      senderId: string;
      content: string;
      type: string;
      createdAt: string;
    };
  }) => void,
) {
  socket?.on('new_message_notification', callback);
  return () => {
    socket?.off('new_message_notification', callback);
  };
}

/**
 * Listen for typing indicators
 */
export function onUserTyping(
  callback: (data: {
    conversationId: string;
    userId: string;
    isTyping: boolean;
  }) => void,
) {
  socket?.on('user_typing', callback);
  return () => {
    socket?.off('user_typing', callback);
  };
}

/**
 * Listen for messages-read event
 */
export function onMessagesRead(
  callback: (data: {
    conversationId: string;
    readBy: string;
    readAt: string;
  }) => void,
) {
  socket?.on('messages_read', callback);
  return () => {
    socket?.off('messages_read', callback);
  };
}

// ─── Online / Presence Event Listeners ─────────────────────────────

/**
 * Listen for the initial list of online user IDs
 */
export function onOnlineUsers(callback: (userIds: string[]) => void) {
  socket?.on('online_users', callback);
  return () => {
    socket?.off('online_users', callback);
  };
}

/**
 * Listen for a specific user coming online
 */
export function onUserOnline(callback: (data: { userId: string }) => void) {
  socket?.on('user_online', callback);
  return () => {
    socket?.off('user_online', callback);
  };
}

/**
 * Listen for a specific user going offline
 */
export function onUserOffline(callback: (data: { userId: string }) => void) {
  socket?.on('user_offline', callback);
  return () => {
    socket?.off('user_offline', callback);
  };
}

// ─── Message Deletion & Clear Chat Events ──────────────────────────

/**
 * Delete a message via WebSocket
 */
export function emitDeleteMessage(messageId: string) {
  socket?.emit('delete_message', { messageId });
}

/**
 * Clear a conversation via WebSocket
 */
export function emitClearConversation(conversationId: string) {
  socket?.emit('clear_conversation', { conversationId });
}

/**
 * Listen for a deleted message event
 */
export function onMessageDeleted(
  callback: (data: { conversationId: string; messageId: string }) => void,
) {
  socket?.on('message_deleted', callback);
  return () => {
    socket?.off('message_deleted', callback);
  };
}

/**
 * Listen for conversation cleared event
 */
export function onConversationCleared(
  callback: (data: { conversationId: string }) => void,
) {
  socket?.on('conversation_cleared', callback);
  return () => {
    socket?.off('conversation_cleared', callback);
  };
}

