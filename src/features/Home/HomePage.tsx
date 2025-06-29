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
    <div className="home-page flex flex-col items-center justify-center px-4">

       <div className="flex flex-row-reverse gap-4 w-full">
        <Button
          onClick={() => onAuthClick(false)}
          variant='primary'
          textSize='md'
          width='6xl'
        >
          Connexion
        </Button>
        <Button
          onClick={() => onAuthClick(true)}
          variant='primary'
          textSize='md'
          width='6xl'
        >
          Inscription
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center w-full max-w-5xl my-12 lg:my-36">
        <div className="flex flex-col items-center justify-center mb-12 lg:relative lg:block">
          <img
            src={logo}
            alt="Logo S-quizz-it"
            className="w-[550px] h-auto float-right lg:-mt-16 lg:-mb-6 lg:mx-[-5rem]"
          />
          <div className="title text-left lg:text-[4.5rem] lg:leading-[1.1]">
            Le quiz qui met l'ambiance, et la <span className="text-primary">pression !</span>
          </div>

          <div className="hidden lg:flex w-full flex justify-end">
            <Button
              variant="primary"
              textSize="lg"
              width="6xl"
              onClick={onPlay}
            >
              Jouer
            </Button>
          </div>
      </div>

        <div className="subtitle w-full">
            Chaque seconde compte. Chaque erreur se paie.
        </div>

        <Button variant="primary" textSize="lg" className="mt-8 lg:hidden" width="6xl" onClick={onPlay}>
            Jouer 
        </Button>
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
