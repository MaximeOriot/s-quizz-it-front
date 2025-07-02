import type { WebSocketCallbacks, RoomData, QuizData, WaitingPlayerData } from './types';

/**
 * Gestionnaire de messages WebSocket pour les salles
 */
export class WebSocketMessageHandler {
  private callbacks: WebSocketCallbacks;

  constructor(callbacks: WebSocketCallbacks) {
    this.callbacks = callbacks;
  }

  /**
   * Traite les messages reçus du serveur
   */
  handleMessage(data: unknown): void {
    if (!data || typeof data !== 'object') return;

    if ('type' in data && typeof data.type === 'string') {
      this.handleTypedMessage(data as { type: string; [key: string]: unknown });
    } else if ('user' in data && 'message' in data && typeof data.user === 'string' && typeof data.message === 'string') {
      this.handleServerMessage(data as { user: string; message: string });
    }
  }

  /**
   * Traite les messages avec un type spécifique
   */
  private handleTypedMessage(data: { type: string; [key: string]: unknown }): void {
    switch (data.type) {
      case 'room_info':
        this.handleRoomInfo(data as { quizz?: QuizData; isQuickPlay?: boolean });
        break;
      case 'room_players':
        this.handleRoomPlayers(data as { players?: WaitingPlayerData[] });
        break;
      case 'salons_init':
        this.handleSalonsInit(data as { salons?: RoomData[] });
        break;
      case 'player_ready':
        this.handlePlayerReady(data as { playerId?: string; isReady?: boolean });
        break;
      case 'game_start':
        this.handleGameStart();
        break;
    }
  }

  /**
   * Traite les informations de base de la salle
   */
  private handleRoomInfo(data: { quizz?: QuizData; isQuickPlay?: boolean }): void {
    if (this.callbacks.onMessage) {
      this.callbacks.onMessage({
        type: 'room_info',
        quizz: data.quizz,
        isQuickPlay: data.isQuickPlay
      });
    }
  }

  /**
   * Traite la liste des joueurs dans la salle
   */
  private handleRoomPlayers(data: { players?: WaitingPlayerData[] }): void {
    if (this.callbacks.onMessage) {
      this.callbacks.onMessage({
        type: 'room_players',
        players: data.players
      });
    }
  }

  /**
   * Traite l'initialisation des salons
   */
  private handleSalonsInit(data: { salons?: RoomData[] }): void {
    if (this.callbacks.onMessage) {
      this.callbacks.onMessage({
        type: 'salons_init',
        salons: data.salons
      });
    }
  }

  /**
   * Traite la mise à jour du statut d'un joueur
   */
  private handlePlayerReady(data: { playerId?: string; isReady?: boolean }): void {
    if (this.callbacks.onMessage) {
      this.callbacks.onMessage({
        type: 'player_ready',
        playerId: data.playerId,
        isReady: data.isReady
      });
    }
  }

  /**
   * Traite le début du jeu
   */
  private handleGameStart(): void {
    if (this.callbacks.onMessage) {
      this.callbacks.onMessage({
        type: 'game_start'
      });
    }
  }

  /**
   * Traite les messages du serveur (bienvenue, notifications)
   */
  private handleServerMessage(data: { user: string; message: string }): void {
    const message = data.message;
    if (message.includes('joined!')) {
      console.log("Un joueur a rejoint la salle");
    }
  }
} 