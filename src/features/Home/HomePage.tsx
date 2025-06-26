import { useState } from 'react';
import logo from '../../assets/logo-squizzit-removed-bg.png';
import Button from '../../components/Button';
import AuthModal from '../../components/AuthenticationModal';

function HomePage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [onRegister, setOnRegister] = useState(false);
  const [isLogged, setIsLogged] = useState(false);

  const onPlay = () => {
    if(!isLogged){
      setOnRegister(false)
      setShowAuthModal(true)
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
    <div className="relative h-screen w-full bg-gradient-to-b from-sky-300 to-sky-800 flex flex-col items-center justify-center px-8 py-6 overflow-hidden">
      
      <div className="absolute top-6 right-6 flex gap-4">
        <Button
          onClick={() => onAuthClick(false)}
          label="Connexion"
          bgColor="bg-yellow-400"
          textColor="text-blue-900"
          hoverColor="hover:bg-yellow-300"
        />
        <Button
          onClick={() => onAuthClick(true)}
          label="Inscription"
          bgColor="bg-yellow-400"
          textColor="text-blue-900"
          hoverColor="hover:bg-yellow-300"
        />
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-12 mt-16">
        <div className="text-left text-4xl md:text-5xl font-bold text-indigo-950 leading-tight">
          <p>Le quiz</p>
          <p>qui met</p>
          <p>l’ambiance,</p>
          <p>et la pression !</p>
        </div>

        <img
          src={logo}
          alt="Logo S-quizz-it"
          className="w-[300px] md:w-[400px] h-auto"
        />
      </div>

      <div className="mt-10">
        <Button
          onClick={onPlay}
          label="Jouer"
          bgColor="bg-yellow-400"
          textColor="text-blue-900"
          hoverColor="hover:bg-yellow-300"
        />
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
