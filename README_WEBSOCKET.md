# Architecture WebSocket - Documentation

## Vue d'ensemble

L'architecture WebSocket a été complètement refactorisée pour offrir une solution robuste, maintenable et performante.

## Structure des fichiers

### Core WebSocket
- `src/util/GlobalWebSocket.ts` - Service WebSocket global (singleton)
- `src/util/WebSocket.ts` - Création et configuration des connexions WebSocket
- `src/util/WebSocket/types.ts` - Types TypeScript pour les WebSockets
- `src/util/initWebSocket.ts` - Initialisation du service WebSocket

### Contextes React
- `src/contexts/WebSocketContext.tsx` - Contexte React pour le WebSocket global
- `src/contexts/useWebSocketContext.ts` - Hook pour utiliser le contexte WebSocket

### Hooks unifiés
- `src/hooks/useWebSocket.ts` - Hook unifié pour utiliser le WebSocket global
- `src/hooks/index.ts` - Export centralisé des hooks

### Hooks spécifiques aux fonctionnalités
- `src/features/GlobalRoom/hooks/useGlobalRoomWebSocket.ts` - Hook pour la salle globale
- `src/features/Game/hooks/useGameWebSocket.ts` - Hook pour le jeu
- `src/features/Waiting/hooks/useWebSocketConnection.ts` - Hook pour la salle d'attente

## Architecture

### 1. GlobalWebSocket (Singleton)
```typescript
// Instance globale unique
export const globalWebSocket = GlobalWebSocket.getInstance();
```

**Fonctionnalités :**
- Une seule connexion WebSocket persistante
- Gestion des reconnexions automatiques
- ID de connexion unique stocké en sessionStorage
- Gestion centralisée des listeners

### 2. WebSocketContext
```typescript
// Contexte React qui délègue au GlobalWebSocket
const value: WebSocketContextType = {
  socket: globalWebSocket.getSocket(),
  addListener,
  removeListener,
  sendMessage
};
```

### 3. Hook unifié
```typescript
// Hook simple et réutilisable
export const useWebSocket = ({ id, callbacks, autoConnect = true }) => {
  // Gestion automatique des listeners
  // Stabilisation des callbacks
  // Cleanup automatique
};
```

## Utilisation

### Dans un composant
```typescript
import { useWebSocket } from '../hooks/useWebSocket';

const MyComponent = () => {
  const { socket, sendWebSocketMessage } = useWebSocket({
    id: 'my-component',
    callbacks: {
      onMessage: (data) => console.log(data),
      onError: (error) => console.error(error),
      onOpen: () => console.log('Connected'),
      onClose: (event) => console.log('Disconnected', event.code)
    }
  });

  const handleSendMessage = () => {
    sendWebSocketMessage({ type: 'my_message', data: 'hello' });
  };

  return <button onClick={handleSendMessage}>Send</button>;
};
```

### Dans une page
```typescript
import { useGlobalRoomWebSocket } from './hooks/useGlobalRoomWebSocket';

const GlobalRoomPage = () => {
  useGlobalRoomWebSocket({
    onRoomsUpdate: (rooms) => setRooms(rooms),
    onCreateRoomSuccess: (roomId) => navigate(`/waiting/${roomId}`)
  });

  return <div>Global Room</div>;
};
```

## Avantages de cette architecture

### 1. Simplicité
- Un seul hook à utiliser : `useWebSocket`
- API cohérente dans toute l'application
- Moins de code boilerplate

### 2. Performance
- Une seule connexion WebSocket
- Gestion intelligente des listeners
- Pas de reconnexions inutiles

### 3. Robustesse
- Reconnexion automatique
- Gestion d'erreurs centralisée
- Survit aux recharges de page

### 4. Maintenabilité
- Code centralisé et organisé
- Types TypeScript stricts
- Documentation claire

## Migration depuis l'ancienne architecture

### Avant
```typescript
// Ancien hook complexe
const { socket, sendWebSocketMessage } = useSharedWebSocket({
  id: 'my-id',
  callbacks: stableCallbacks,
  autoConnect: true
});
```

### Après
```typescript
// Nouveau hook simple
const { socket, sendWebSocketMessage } = useWebSocket({
  id: 'my-id',
  callbacks: {
    onMessage: handleMessage,
    onError: handleError
  }
});
```

## Debugging

### Logs détaillés
Le GlobalWebSocket fournit des logs détaillés avec l'ID de connexion :
```
GlobalWebSocket initialisé avec ID: ws_1751453209916_mohlwhyrr
Création de la connexion WebSocket (ID: ws_1751453209916_mohlwhyrr)...
WebSocket connecté avec succès (ID: ws_1751453209916_mohlwhyrr)
```

### Informations de debug
```typescript
// Obtenir les informations de debug
const debugInfo = globalWebSocket.getDebugInfo();
console.log(debugInfo);
// {
//   connectionId: "ws_1751453209916_mohlwhyrr",
//   connectionStatus: "connected",
//   listenerCount: 2,
//   listeners: ["global-room", "waiting-room-11"],
//   isConnecting: false,
//   reconnectAttempts: 0
// }
``` 