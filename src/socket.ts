/**
 * Socket.IO client singleton
 * Connects to the game server
 */
import { io } from 'socket.io-client';

// In production, connect to same origin. In dev, connect to localhost:8080
const SERVER_URL = (window.location.port === '5173' || window.location.port === '3000')
  ? 'http://localhost:8080'
  : window.location.origin;

export const socket = io(SERVER_URL, {
  transports: ['websocket', 'polling'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

export default socket;
