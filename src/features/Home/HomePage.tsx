import logo from '../../assets/logo-squizzit-removed-bg.png';

function HomePage() {
  return (
    <div className="font-syne-bold flex items-center justify-between h-screen px-12 bg-gradient-to-b from-sky-300 to-sky-800">
      <div className="text-3xl font-syne-bold max-w-xl">
        Découvrez le plaisir d'apprendre avec <span className="text-blue-900">S-quizz-it</span> !!!
      </div>
      <div>
        <img src={logo} alt="Logo S-quizz-it" className="w-[500px] h-auto" />
      </div>
    </div>
  );
}

export default HomePage
