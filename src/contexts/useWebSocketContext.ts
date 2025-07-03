import { useContext } from 'react';
import { WebSocketContext } from './WebSocketContext';

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext doit être utilisé dans un WebSocketProvider');
  }
  return context;
}; 