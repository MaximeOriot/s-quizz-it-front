export const createWebSocket = (onMessage?: (data: unknown) => void, onError?: (error: Event) => void) => {
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
  };

  socket.onmessage = (event) => {
    try {
      if (typeof event.data === 'string') {
        const data = JSON.parse(event.data);
        if (onMessage) {
          onMessage(data);
        }
      } else {
        console.log("Événement WebSocket reçu:", event.data);
      }
    } catch (error) {
      console.error("Erreur parsing WebSocket data:", error);
    }
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
    if (onError) {
      onError(error);
    }
  };

  socket.onclose = (event) => {
    console.log("WebSocket fermé:", event.code, event.reason);
  };

  return socket;
};