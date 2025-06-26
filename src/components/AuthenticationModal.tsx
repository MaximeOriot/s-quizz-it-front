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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl"
        >
          ×
        </button>

        <div className="flex mb-4 justify-center">
          <button
            onClick={() => setOnRegister(false)}
            className={`px-4 py-2 font-semibold ${
              !onRegister ? "border-b-2 border-blue-900 text-blue-900" : "text-gray-500"
            }`}
          >
            Connexion
          </button>
          <button
            onClick={() => setOnRegister(true)}
            className={`px-4 py-2 font-semibold ${
              onRegister ? "border-b-2 border-blue-900 text-blue-900" : "text-gray-500"
            }`}
          >
            Inscription
          </button>
        </div>

        {!onRegister ? (
          <form className="flex flex-col gap-4" onSubmit={handleLoginSubmit}>
            <input type="email" placeholder="Email" className="border px-3 py-2 rounded" />
            <input type="password" placeholder="Mot de passe" className="border px-3 py-2 rounded" />
            <button type="submit" className="bg-blue-900 text-white py-2 rounded hover:bg-purple-600">
              Se connecter
            </button>
          </form>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleLoginSubmit}>
            <input type="text" name="username" placeholder="Nom" className="border px-3 py-2 rounded" />
            <input type="email" name="email" placeholder="Email" className="border px-3 py-2 rounded" />
            <input type="password" name="password" placeholder="Mot de passe" className="border px-3 py-2 rounded" />
            <input type="password" name="confirmPassword" placeholder="Confirmer le mot de passe" className="border px-3 py-2 rounded" />
            <button type="submit" className="bg-blue-900 text-white py-2 rounded hover:bg-purple-600">
              S'inscrire
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
