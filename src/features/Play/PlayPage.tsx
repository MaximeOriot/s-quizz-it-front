import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';

function PlayPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center h-screen">
        <div className="title text-center">
            Que veux-tu faire ?
        </div>
        <Button variant="primary" textSize="lg" width="6xl" onClick={() => navigate('/Play')}>
            Jouer
        </Button>
        <Button variant="secondary" textSize="lg" width="6xl" onClick={() => navigate('/Play')}>
            Créer un quiz
        </Button>
    </div>
  );
}

export default PlayPage; 