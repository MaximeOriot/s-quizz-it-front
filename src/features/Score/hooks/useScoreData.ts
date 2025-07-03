import { useState, useEffect } from 'react';

interface ScoreData {
  day: string;
  toi: number;
  amis: number;
  global: number;
}

interface UseScoreDataProps {
  profileId?: string;
}

export const useScoreData = ({ profileId = '1' }: UseScoreDataProps = {}) => {
  const [scores, setScores] = useState<ScoreData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`https://backend-squizzit.dreadex.dev/api/profile/historique?idProfile=${profileId}`);
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const responseData = await response.json();
        
        // Extraire les données d'historique personnel et des amis
        const historiquePersonnel = responseData.historique || [];
        const historiqueAmis = responseData.historiqueAmie || [];
        
        // Créer un map pour regrouper les scores par date
        const scoresByDate = new Map<string, { toi: number; amis: number; global: number }>();
        
        // Traiter l'historique personnel
        historiquePersonnel.forEach((item: Record<string, unknown>) => {
          const datePartie = (item.datePartie as string) || '';
          const score = (item.score as number) || 0;
          
          if (datePartie) {
            const formattedDay = formatDate(datePartie);
            const existing = scoresByDate.get(formattedDay) || { toi: 0, amis: 0, global: 0 };
            existing.toi = Math.max(existing.toi, score); // Prendre le meilleur score du jour
            scoresByDate.set(formattedDay, existing);
          }
        });
        
        // Traiter l'historique des amis
        historiqueAmis.forEach((item: Record<string, unknown>) => {
          const datePartie = (item.datePartie as string) || '';
          const score = (item.score as number) || 0;
          
          if (datePartie) {
            const formattedDay = formatDate(datePartie);
            const existing = scoresByDate.get(formattedDay) || { toi: 0, amis: 0, global: 0 };
            existing.amis = Math.max(existing.amis, score); // Prendre le meilleur score des amis du jour
            scoresByDate.set(formattedDay, existing);
          }
        });
        
        // Liste complète des jours de la semaine en français
        const joursSemaine = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

        // Transformer en tableau et calculer le score global
        const transformedData = joursSemaine.map(day => {
          // Chercher s'il y a un score pour ce jour
          const scores = Array.from(scoresByDate.entries()).find(([d]) => d.toLowerCase() === day) ?
            scoresByDate.get(joursSemaine.find(j => j === day)!) :
            undefined;
          return {
            day,
            toi: scores?.toi || 0,
            amis: scores?.amis || 0,
            global: Math.max(scores?.toi || 0, scores?.amis || 0)
          };
        });
        
        // Fonction helper pour formater les dates
        function formatDate(dateString: string): string {
          try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', {
              weekday: 'long'
            });
          } catch {
            return dateString;
          }
        }
        
        setScores(transformedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
        
        // Données de fallback vides en cas d'erreur
        setScores([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScores();
  }, [profileId]);

  return {
    scores,
    isLoading,
    error,
    refetch: () => {
      setIsLoading(true);
      setError(null);
      // Re-déclencher le useEffect
    }
  };
}; 