import { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../features/auth/authSlice';
import { loginThunk, registerThunk } from '../features/auth/authThunks';

type AuthModalProps = {
  isOpen: boolean;
  isRegister: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
};

export default function AuthModal({ isOpen, isRegister, onClose, onLoginSuccess }: AuthModalProps) {
  const [isOnRegister, setIsOnRegister] = useState(isRegister);

    const { user, isAuthenticated, loading, error } = useSelector((state: any) => state.auth);
    const dispatch = useDispatch();
  
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [confirmationPassword, setConfirmationPassword] = useState('');
  

  useEffect(() => {
    setIsOnRegister(isRegister);
  }, [isRegister]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
      if (!email || !password) {
        alert('Veuillez remplir tous les champs.');
        return;
      }
      if (password.length < 6) {
        alert('Le mot de passe doit contenir au moins 6 caractères.');
        return;
      }
      if (isOnRegister && (!username || !confirmationPassword)) {
        alert('Veuillez remplir tous les champs.');
        return;
      }
      if (isOnRegister && password !== confirmationPassword) {
        alert('Les mots de passe ne correspondent pas.');
        return;
      }

      if (isOnRegister) {
        // Inscription
        dispatch(loginStart({ email, password }));
        try {
          dispatch(registerThunk({ email, password, username }));
          dispatch(loginSuccess(user));
          onLoginSuccess(); // Appel de la fonction de succès après l'inscription
        } catch (err) {
          dispatch(loginFailure('Erreur d\'inscription'));
        }
        return;
      }

      // Connexion
      dispatch(loginStart({ email, password }));
      try {
        dispatch(loginThunk({ email, password }));
        dispatch(loginSuccess(user));
        onLoginSuccess(); // Appel de la fonction de succès après la connexion
      } catch (err) {
        dispatch(loginFailure('Erreur de connexion'));
      }
    };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 bg-black/50 backdrop-blur-sm"
    onClick={onClose}>
      <div className="relative w-full max-w-sm p-6 shadow-xl bg-gradient-to-b from-blue-400 to-blue-600 rounded-xl"
      onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute text-xl text-gray-600 top-2 right-2 hover:text-black"
        >
          ×
        </button>

        <div className="flex justify-center mb-4">
          <button
            onClick={() => setIsOnRegister(false)}
            className={`px-4 py-2 font-semibold ${
              !isOnRegister ? "border-b-2 border-secondary text-secondary" : "text-gray-500"
            }`}
          >
            Connexion
          </button>
          <button
            onClick={() => setIsOnRegister(true)}
            className={`px-4 py-2 font-semibold ${
              isOnRegister ? "border-b-2 border-secondary text-secondary" : "text-gray-500"
            }`}
          >
            Inscription
          </button>
        </div>

        {!isOnRegister ? (
          <form className="flex flex-col gap-4" 
            onSubmit={((e) => {
              e.preventDefault();
              handleSubmit();
            })}
          >
            <input type="email" placeholder="Email" className="py-2 text-center bg-yellow-100 border border-purple-700 rounded-md placeholder-secondary" 
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
            <input type="password" placeholder="Mot de passe" className="py-2 text-center bg-yellow-100 border border-purple-700 rounded-md placeholder-secondary" 
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
            <button type="submit" className="py-2 mt-2 font-bold transition rounded-full shadow-md text-secondary bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400">
              Se connecter
            </button>
          </form>
        ) : (
          <form className="flex flex-col gap-4" 
            onSubmit={((e) => {
              e.preventDefault();
              handleSubmit();
            })}
          >
            <input type="text" name="username" placeholder="Nom" className="py-2 text-center bg-yellow-100 border border-purple-700 rounded-md placeholder-secondary" 
              onChange={(e) => setUsername(e.target.value)}
              value={username}/>
            <input type="email" name="email" placeholder="Email" className="py-2 text-center bg-yellow-100 border border-purple-700 rounded-md placeholder-secondary" 
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
            <input type="password" name="password" placeholder="Mot de passe" className="py-2 text-center bg-yellow-100 border border-purple-700 rounded-md placeholder-secondary" 
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
            <input type="password" name="confirmPassword" placeholder="Confirmer le mot de passe" className="py-2 text-center bg-yellow-100 border border-purple-700 rounded-md placeholder-secondary" 
              onChange={(e) => setConfirmationPassword(e.target.value)}
              value={confirmationPassword}
            />
            <button type="submit" className="py-2 mt-2 font-bold transition rounded-full shadow-md text-secondary bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400">
              S'inscrire
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
