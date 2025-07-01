/**
 * Interface définissant les callbacks disponibles pour la gestion des événements WebSocket
 */
interface WebSocketCallbacks {
  /** Callback appelé quand un message est reçu du serveur */
  onMessage?: (data: unknown) => void;
  /** Callback appelé en cas d'erreur de connexion */
  onError?: (error: Event) => void;
  /** Callback appelé quand la connexion WebSocket est établie */
  onOpen?: () => void;
  /** Callback appelé quand la connexion WebSocket est fermée */
  onClose?: (event: CloseEvent) => void;
}

/**
 * Crée et configure une connexion WebSocket avec authentification
 * @param callbacks - Callbacks optionnels pour gérer les événements WebSocket
 * @returns Instance WebSocket configurée
 * @throws Error si aucun token d'authentification n'est trouvé
 */
export const createWebSocket = (callbacks?: WebSocketCallbacks) => {
  // Récupération du token d'authentification depuis le localStorage
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Token d\'authentification non trouvé. Veuillez vous connecter.');
  }

  // Création de la connexion WebSocket avec le protocole d'authentification
  const socket = new WebSocket("ws://localhost:3000/_ws", 
  [
    "auth", // Protocole d'authentification
    token   // Token JWT pour l'authentification
  ]);

  /**
   * Gestionnaire d'événement : Connexion établie
   * Appelé quand la connexion WebSocket est ouverte avec succès
   */
  socket.onopen = () => {
    console.log("WebSocket connecté avec succès");
    if (callbacks?.onOpen) {
      callbacks.onOpen();
    }
  };

  /**
   * Gestionnaire d'événement : Message reçu
   * Traite les messages reçus du serveur (texte ou Blob)
   */
  socket.onmessage = (event) => {
    try {
      // Traitement des messages texte (JSON)
      if (typeof event.data === 'string') {
        const data = JSON.parse(event.data);
        if (callbacks?.onMessage) {
          callbacks.onMessage(data);
        }
      } 
      // Traitement des messages Blob (données binaires)
      else if (event.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const text = reader.result as string;
            const data = JSON.parse(text);
            if (callbacks?.onMessage) {
              callbacks.onMessage(data);
            }
          } catch (error) {
            console.error("Erreur parsing Blob data:", error);
          }
        };
        reader.readAsText(event.data);
      } 
      // Autres types de données
      else {
        console.log("Événement WebSocket reçu:", event.data);
      }
    } catch (error) {
      console.error("Erreur parsing WebSocket data:", error);
    }
  };

  /**
   * Gestionnaire d'événement : Erreur de connexion
   * Appelé en cas d'erreur lors de la communication WebSocket
   */
  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
    if (callbacks?.onError) {
      callbacks.onError(error);
    }
  };

  /**
   * Gestionnaire d'événement : Connexion fermée
   * Appelé quand la connexion WebSocket est fermée
   */
  socket.onclose = (event) => {
    console.log("WebSocket fermé:", event.code, event.reason);
    if (callbacks?.onClose) {
      callbacks.onClose(event);
    }
  };

  return socket;
};

/**
 * Fonction utilitaire pour envoyer des messages via WebSocket
 * @param socket - Instance WebSocket à utiliser
 * @param message - Message à envoyer (sera converti en JSON)
 */
export const sendWebSocketMessage = (socket: WebSocket, message: unknown) => {
  // Vérification que la connexion est ouverte avant d'envoyer
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  } else {
    console.error("WebSocket n'est pas ouvert");
  }
};