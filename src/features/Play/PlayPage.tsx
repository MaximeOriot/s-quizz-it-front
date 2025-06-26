import { useNavigate } from 'react-router-dom';
import GameCard from '../../components/ui/GameCard';

function PlayPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center gap-8">
        <div className="title text-center">
            Que veux-tu faire ?
        </div>
        
        <div className="flex flex-col gap-6 w-full max-w-md">
            <GameCard 
                title="Partie rapide"
                description="Jouer à un quiz" 
                tag="Aleatoire" 
                tagPosition="none"
                variant="primary"
                padding="sm" 
                hover={true}
                onClick={() => navigate('/Play')}
            />
            
            <GameCard 
                title="Entre ami" 
                description="Exclusif entre amis" 
                tag="Collectif"
                tagPosition="right"
                variant="secondary" 
                padding="sm" 
                hover={true} 
                onClick={() => navigate('/Play')} 
            />

            <GameCard 
                title="Solo"
                description="Jouer à un quiz" 
                tag="Aleatoire" 
                variant="primary"
                padding="sm" 
                tagPosition="left"
                hover={true}
                onClick={() => navigate('/Play')}
            />

            <GameCard 
                title="Thème" 
                description="Créer un quiz solo avec un thème" 
                tag="Entrainement" 
                tagPosition="right"
                variant="secondary" 
                padding="sm" 
                hover={true} 
                onClick={() => navigate('/Play')} 
            />
        </div>
        
    </div>
  );
}

export default PlayPage; 