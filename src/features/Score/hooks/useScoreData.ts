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
        
        const data = await response.json();
        
        // Transformer les données de l'API en format attendu par ScoreGraph
        const transformedData = data.map((item: Record<string, unknown>) => ({
          day: (item.day as string) || (item.jour as string) || 'Jour',
          toi: (item.toi as number) || (item.score as number) || 0,
          amis: (item.amis as number) || (item.friends as number) || 0,
          global: (item.global as number) || (item.worldwide as number) || 0
        }));
        
        setScores(transformedData);
      } catch (err) {
        console.error('Erreur lors du chargement des scores:', err);
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