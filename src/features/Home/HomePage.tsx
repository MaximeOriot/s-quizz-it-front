import logo from '../../assets/logo-squizzit-removed-bg.png';

function HomePage() {
  return (
    <div className="flex flex-col-reverse lg:flex-row justify-center items-center lg:h-screen px-8 py-16">
      
        <div className="flex flex-col gap-4">
          <div className="title max-w-xl">
            Le quiz qui met l’ambiance, et la pression !
          </div>
          <div className="subtitle max-w-xl">
            Chaque seconde compte. Chaque erreur se paie. Bienvenue dans le quiz où seul le plus vif survit.
          </div>
        </div>

      <img src={logo} alt="Logo S-quizz-it" className="w-[500px] h-auto" />
    </div>
  );
}

export default HomePage
