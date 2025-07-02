/**
 * Interface définissant les callbacks disponibles pour la gestion des événements WebSocket
 */
export interface WebSocketCallbacks {
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
 * Interface pour les données de salle
 */
export interface RoomData {
  id: number;
  label: string;
  type: string;
  difficulte: number;
  j_max: number;
  j_actuelle: number;
  commence: boolean;
  created_at: string;
}

/**
 * Interface pour les données de quiz
 */
export interface QuizData {
  id: number;
  label: string;
  description: string;
  themes: Array<{ label: string }>;
}

/**
 * Interface pour les données de joueur en attente
 */
export interface WaitingPlayerData {
  id: string;
  pseudo: string;
  avatar: string;
  isReady: boolean;
} 