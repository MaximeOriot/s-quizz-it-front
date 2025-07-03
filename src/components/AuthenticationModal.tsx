import { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { loginThunk, registerThunk } from '../features/auth/authThunks';
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";

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
    const navigate = useNavigate();
  
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

      try {
        if (isOnRegister) {
          // Inscription
          await dispatch(registerThunk({ email, password, username })).unwrap();
        } else {
          // Connexion
          await dispatch(loginThunk({ email, password })).unwrap();
        }
        onLoginSuccess();
      } catch (err) {
        console.error(err);
        alert('Une erreur est survenue. Veuillez vérifier vos informations.');
      }
    };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm bg-black/50"
    onClick={onClose}>
      <div className="relative w-full max-w-sm p-6 bg-blue-800 shadow-xl rounded-xl"
      onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute text-xl top-2 right-2 text-primary hover:text-primary-foreground"
        >
          ×
        </button>

        <div className="flex justify-center mb-4">
          <button
            onClick={() => setIsOnRegister(false)}
            className={`px-4 py-2 font-semibold ${
              !isOnRegister ? "border-b-2 border-secondary text-primary" : "text-primary-foreground"
            }`}
          >
            Connexion
          </button>
          <button
            onClick={() => setIsOnRegister(true)}
            className={`px-4 py-2 font-semibold ${
              isOnRegister ? "border-b-2 border-secondary text-primary" : "text-primary-foreground"
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
            <input type="email" placeholder="Email" className="py-2 text-center border border-purple-700 rounded-md bg-primary-foreground placeholder-secondary" 
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
            <input type="password" placeholder="Mot de passe" className="py-2 text-center border border-purple-700 rounded-md bg-primary-foreground placeholder-secondary" 
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
            <Button type="submit" variant="primary" className="mt-8">
              Se connecter
            </Button>
          </form>
        ) : (
          <form className="flex flex-col gap-4" 
            onSubmit={((e) => {
              e.preventDefault();
              handleSubmit();
            })}
          >
            <input type="text" name="username" placeholder="Nom" className="py-2 text-center border border-purple-700 rounded-md bg-primary-foreground placeholder-secondary" 
              onChange={(e) => setUsername(e.target.value)}
              value={username}/>
            <input type="email" name="email" placeholder="Email" className="py-2 text-center border border-purple-700 rounded-md bg-primary-foreground placeholder-secondary" 
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
            <input type="password" name="password" placeholder="Mot de passe" className="py-2 text-center border border-purple-700 rounded-md bg-primary-foreground placeholder-secondary" 
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
            <input type="password" name="confirmPassword" placeholder="Confirmer le mot de passe" className="py-2 text-center border border-purple-700 rounded-md bg-primary-foreground placeholder-secondary" 
              onChange={(e) => setConfirmationPassword(e.target.value)}
              value={confirmationPassword}
            />
            <Button type="submit" variant="primary" className="mt-8">
              S'inscrire
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
