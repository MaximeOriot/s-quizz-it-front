import { globalWebSocket } from './GlobalWebSocket';

// Initialiser le GlobalWebSocket une seule fois au niveau de l'application
export const initWebSocket = () => {
  console.log('Initialisation du GlobalWebSocket...');
  globalWebSocket.connect();
};

// Exporter le service pour utilisation dans d'autres modules
export { globalWebSocket }; 