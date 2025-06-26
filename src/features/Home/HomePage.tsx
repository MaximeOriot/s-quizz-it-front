import { useState } from 'react';
import logo from '../../assets/logo-squizzit-removed-bg.png';
import AuthModal from '../../components/AuthenticationModal';
import Button from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [onRegister, setOnRegister] = useState(false);
  const [isLogged, setIsLogged] = useState(false);

  const onPlay = () => {
    if(!isLogged){
      setOnRegister(false)
      setShowAuthModal(true)
    } else {
      navigate('/Play')
    }
  };
  const onAuthClick = (isRegister: boolean) => {
    setOnRegister(isRegister);
    setShowAuthModal(true);
  };

  const onLoginSuccess = () => {
    setIsLogged(true);
    setShowAuthModal(false);
  };

  return (
    <div className="flex flex-col-reverse items-center justify-center px-8 py-16 lg:flex-row lg:h-screen">
      
      <div className="absolute flex gap-4 top-6 right-6">
        <Button
          onClick={() => onAuthClick(false)}
          variant='primary'
          textSize='md'
          className='mt-8'
          width='6xl'
        >
          Connexion
        </Button>
        <Button
          onClick={() => onAuthClick(true)}
          variant='primary'
          textSize='md'
          className='mt-8'
          width='6xl'
        >
          Inscription
        </Button>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="max-w-xl title">
            Le quiz qui met l'ambiance, et la pression !
          </div>
          <div className="max-w-xl subtitle">
            Chaque seconde compte. Chaque erreur se paie. Bienvenue dans le quiz où seul le plus vif survit.
          </div>

          <Button variant="primary" textSize="lg" className="mt-8" width="6xl" onClick={onPlay}>
            Jouer 
          </Button>

          <img src={logo} alt="Logo S-quizz-it" className="w-[500px] h-auto" />
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        isRegister={onRegister} 
        onClose={() => setShowAuthModal(false)} 
        onLoginSuccess={onLoginSuccess}
      />
      
    </div>
  );
}

export default HomePage;
