import logo from '../../assets/logo-squizzit-removed-bg.png';
import Button from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col-reverse lg:flex-row justify-center items-center lg:h-screen">
      
        <div className="flex flex-col gap-4 items-center">
          <div className="title max-w-xl">
            Le quiz qui met l'ambiance, et la pression !
          </div>
          <div className="subtitle max-w-xl">
            Chaque seconde compte. Chaque erreur se paie. Bienvenue dans le quiz où seul le plus vif survit.
          </div>
          <Button variant="primary" textSize="lg" className="mt-8" width="6xl" onClick={() => navigate('/Play')}>
            Jouer 
          </Button>
        </div>

      <img src={logo} alt="Logo S-quizz-it" className="w-[500px] h-auto" />
    </div>
  );
}

export default HomePage
