import { createWebSocket } from './WebSocket';
import type { WebSocketCallbacks } from './WebSocket/types';

// Service WebSocket global qui survit aux recharges de page
class GlobalWebSocket {
  private static instance: GlobalWebSocket;
  private socket: WebSocket | null = null;
  private listeners: Map<string, WebSocketCallbacks> = new Map();
  private isConnecting = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private connectionId: string | null = null;

  private constructor() {
    // Récupérer l'ID de connexion depuis sessionStorage s'il existe
    this.connectionId = sessionStorage.getItem('websocket_connection_id');
    if (!this.connectionId) {
      this.connectionId = `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('websocket_connection_id', this.connectionId);
    }
    
    console.log(`GlobalWebSocket initialisé avec ID: ${this.connectionId}`);
  }

  static getInstance(): GlobalWebSocket {
    if (!GlobalWebSocket.instance) {
      GlobalWebSocket.instance = new GlobalWebSocket();
    }
    return GlobalWebSocket.instance;
  }

  private createConnection(): WebSocket | null {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log('WebSocket déjà connecté, réutilisation de la connexion existante');
      return this.socket;
    }

    if (this.isConnecting) {
      console.log('Connexion déjà en cours, attente...');
      return null;
    }

    this.isConnecting = true;
    console.log(`Création de la connexion WebSocket (ID: ${this.connectionId})...`);

    try {
      const socket = createWebSocket({
        onMessage: (data) => {
          console.log(`Message WebSocket reçu (ID: ${this.connectionId}):`, data);
          this.listeners.forEach((callbacks, id) => {
            try {
              callbacks.onMessage?.(data);
            } catch (error) {
              console.error(`Erreur dans le listener ${id}:`, error);
            }
          });
        },
        onError: (error) => {
          console.error(`Erreur WebSocket (ID: ${this.connectionId}):`, error);
          this.listeners.forEach((callbacks, id) => {
            try {
              callbacks.onError?.(error);
            } catch (error) {
              console.error(`Erreur dans le listener ${id}:`, error);
            }
          });
        },
        onClose: (event) => {
          console.log(`WebSocket fermé (ID: ${this.connectionId}):`, event.code, event.reason);
          this.socket = null;
          this.isConnecting = false;
          
          // Tentative de reconnexion seulement si ce n'est pas une fermeture volontaire
          if (event.code !== 1000 && event.code !== 1001 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
          
          this.listeners.forEach((callbacks, id) => {
            try {
              callbacks.onClose?.(event);
            } catch (error) {
              console.error(`Erreur dans le listener ${id}:`, error);
            }
          });
        },
        onOpen: () => {
          console.log(`WebSocket connecté avec succès (ID: ${this.connectionId})`);
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.listeners.forEach((callbacks, id) => {
            try {
              callbacks.onOpen?.();
            } catch (error) {
              console.error(`Erreur dans le listener ${id}:`, error);
            }
          });
        }
      });
      
      this.socket = socket;
      return socket;
    } catch (error) {
      console.error(`Erreur lors de la création du WebSocket (ID: ${this.connectionId}):`, error);
      this.isConnecting = false;
      return null;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts} dans ${delay}ms (ID: ${this.connectionId})`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.createConnection();
    }, delay);
  }

  connect(): WebSocket | null {
    // Éviter les appels multiples si déjà connecté ou en cours de connexion
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log(`WebSocket déjà connecté (ID: ${this.connectionId})`);
      return this.socket;
    }
    
    if (this.isConnecting) {
      console.log(`Connexion en cours (ID: ${this.connectionId})...`);
      return null;
    }
    
    return this.createConnection();
  }

  getSocket(): WebSocket | null {
    return this.socket;
  }

  addListener(id: string, callbacks: WebSocketCallbacks) {
    // Éviter d'ajouter le même listener plusieurs fois
    if (this.listeners.has(id)) {
      console.log(`Listener ${id} déjà présent, mise à jour des callbacks (ID: ${this.connectionId})`);
      this.listeners.set(id, callbacks);
      return;
    }
    
    console.log(`Ajout du listener: ${id} (ID: ${this.connectionId})`);
    this.listeners.set(id, callbacks);
    
    // Si pas de connexion et pas en cours de connexion, en créer une
    if (!this.socket && !this.isConnecting) {
      this.connect();
    }
  }

  removeListener(id: string) {
    if (this.listeners.has(id)) {
      console.log(`Suppression du listener: ${id} (ID: ${this.connectionId})`);
      this.listeners.delete(id);
    } else {
      console.log(`Listener ${id} non trouvé lors de la suppression (ID: ${this.connectionId})`);
    }
  }

  sendMessage(message: unknown) {
    console.log(`📤 Tentative d'envoi de message (ID: ${this.connectionId}):`, message);
    console.log(`📤 État du socket:`, this.socket?.readyState);
    console.log(`📤 Socket ouvert?`, this.socket?.readyState === WebSocket.OPEN);
    
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log(`📤 Envoi du message WebSocket (ID: ${this.connectionId}):`, message);
      
      // Si c'est déjà une chaîne, l'envoyer directement pour éviter le double JSON.stringify
      if (typeof message === 'string') {
        console.log(`📤 Envoi de la chaîne:`, message);
        this.socket.send(message);
      } else {
        // Sinon, utiliser JSON.stringify pour les objets
        const jsonMessage = JSON.stringify(message);
        console.log(`📤 Envoi de l'objet JSON:`, jsonMessage);
        this.socket.send(jsonMessage);
      }
    } else {
      console.warn(`❌ WebSocket n'est pas ouvert, message non envoyé (ID: ${this.connectionId}):`, message);
      console.warn(`❌ État du socket:`, this.socket?.readyState);
    }
  }

  disconnect() {
    console.log(`Déconnexion du GlobalWebSocket (ID: ${this.connectionId})...`);
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.socket) {
      this.socket.close(1000, 'Déconnexion volontaire');
      this.socket = null;
    }
    
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.listeners.clear();
    
    // Supprimer l'ID de connexion
    sessionStorage.removeItem('websocket_connection_id');
    this.connectionId = null;
  }

  getListenerCount(): number {
    return this.listeners.size;
  }

  getConnectionStatus(): string {
    if (!this.socket) return 'disconnected';
    switch (this.socket.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'closed';
      default: return 'unknown';
    }
  }

  getConnectionId(): string | null {
    return this.connectionId;
  }

  getDebugInfo() {
    return {
      connectionId: this.connectionId,
      connectionStatus: this.getConnectionStatus(),
      listenerCount: this.getListenerCount(),
      listeners: Array.from(this.listeners.keys()),
      isConnecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Instance globale unique
export const globalWebSocket = GlobalWebSocket.getInstance(); 