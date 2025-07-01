interface WebSocketCallbacks {
  onMessage?: (data: unknown) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
}

export const createWebSocket = (callbacks?: WebSocketCallbacks) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Token d\'authentification non trouvé. Veuillez vous connecter.');
  }

  const socket = new WebSocket("ws://localhost:3000/_ws", 
  [
	"auth",
    token
]);

  socket.onopen = () => {
    console.log("WebSocket connecté avec succès");
    if (callbacks?.onOpen) {
      callbacks.onOpen();
    }
  };

  socket.onmessage = (event) => {
    try {
      if (typeof event.data === 'string') {
        const data = JSON.parse(event.data);
        if (callbacks?.onMessage) {
          callbacks.onMessage(data);
        }
      } else if (event.data instanceof Blob) {
        // Traiter les Blobs en les convertissant en texte
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
      } else {
        console.log("Événement WebSocket reçu:", event.data);
      }
    } catch (error) {
      console.error("Erreur parsing WebSocket data:", error);
    }
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
    if (callbacks?.onError) {
      callbacks.onError(error);
    }
  };

  socket.onclose = (event) => {
    console.log("WebSocket fermé:", event.code, event.reason);
    if (callbacks?.onClose) {
      callbacks.onClose(event);
    }
  };

  return socket;
};

// Fonction utilitaire pour envoyer des messages
export const sendWebSocketMessage = (socket: WebSocket, message: unknown) => {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  } else {
    console.error("WebSocket n'est pas ouvert");
  }
};