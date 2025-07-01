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

/**
 * Fonction pour rejoindre une salle spécifique
 * @param socket - Instance WebSocket
 * @param roomId - ID de la salle à rejoindre
 */
export const joinRoom = (socket: WebSocket, roomId: string) => {
  sendWebSocketMessage(socket, {
    type: 'join_room',
    roomId: roomId
  });
};

/**
 * Fonction pour envoyer le statut "prêt" d'un joueur
 * @param socket - Instance WebSocket
 * @param isReady - Statut de préparation du joueur
 */
export const sendPlayerReady = (socket: WebSocket, isReady: boolean) => {
  sendWebSocketMessage(socket, {
    type: 'player_ready',
    isReady: isReady
  });
}; 