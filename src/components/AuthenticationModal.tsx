import { useEffect, useState } from "react";

type AuthModalProps = {
  isOpen: boolean;
  isRegister: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
};

export default function AuthModal({ isOpen, isRegister, onClose, onLoginSuccess }: AuthModalProps) {
  const [onRegister, setOnRegister] = useState(isRegister);

  useEffect(() => {
    setOnRegister(isRegister);
  }, [isRegister]);

  if (!isOpen) return null;

  const handleLoginSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    try {
        //Verification des infos
    } catch(error) {
        console.warn('Authentication error:', error)
    }
    onLoginSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-sm p-6 shadow-xl bg-gradient-to-b from-blue-400 to-blue-600 rounded-xl">
        <button
          onClick={onClose}
          className="absolute text-xl text-gray-600 top-2 right-2 hover:text-black"
        >
          ×
        </button>

        <div className="flex justify-center mb-4">
          <button
            onClick={() => setOnRegister(false)}
            className={`px-4 py-2 font-semibold ${
              !onRegister ? "border-b-2 border-secondary text-secondary" : "text-gray-500"
            }`}
          >
            Connexion
          </button>
          <button
            onClick={() => setOnRegister(true)}
            className={`px-4 py-2 font-semibold ${
              onRegister ? "border-b-2 border-secondary text-secondary" : "text-gray-500"
            }`}
          >
            Inscription
          </button>
        </div>

        {!onRegister ? (
          <form className="flex flex-col gap-4" onSubmit={handleLoginSubmit}>
            <input type="email" placeholder="Email" className="py-2 text-center bg-yellow-100 border border-purple-700 rounded-md placeholder-secondary" />
            <input type="password" placeholder="Mot de passe" className="py-2 text-center bg-yellow-100 border border-purple-700 rounded-md placeholder-secondary" />
            <button type="submit" className="py-2 mt-2 font-bold transition rounded-full shadow-md text-secondary bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400">
              Se connecter
            </button>
          </form>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleLoginSubmit}>
            <input type="text" name="username" placeholder="Nom" className="py-2 text-center bg-yellow-100 border border-purple-700 rounded-md placeholder-secondary" />
            <input type="email" name="email" placeholder="Email" className="py-2 text-center bg-yellow-100 border border-purple-700 rounded-md placeholder-secondary" />
            <input type="password" name="password" placeholder="Mot de passe" className="py-2 text-center bg-yellow-100 border border-purple-700 rounded-md placeholder-secondary" />
            <input type="password" name="confirmPassword" placeholder="Confirmer le mot de passe" className="py-2 text-center bg-yellow-100 border border-purple-700 rounded-md placeholder-secondary" />
            <button type="submit" className="py-2 mt-2 font-bold transition rounded-full shadow-md text-secondary bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400">
              S'inscrire
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
