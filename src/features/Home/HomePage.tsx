import './HomePage.css'
import logo from '../../assets/logo-squizzit-removed-bg.png';

function HomePage() {
  return (
    <div className="flex items-center justify-between h-screen px-12 bg-gray-50">
      <div className="text-3xl font-bold max-w-xl">
        Découvrez le plaisir d'apprendre avec <span className="text-blue-600">S-quizz-it</span> !!!
      </div>
      <div>
        <img src={logo} alt="Logo S-quizz-it" className="w-[300px]" />
      </div>
    </div>
  );
}

export default HomePage
