import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure, logout } from '../../features/auth/authSlice';
import { loginThunk } from '../../features/auth/authThunks';

const AuthComponent = () => {
  const { user, isAuthenticated, loading, error } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    dispatch(loginStart({ email, password }));
    try {
      dispatch(loginThunk({ email, password }));
      dispatch(loginSuccess(user));
    } catch (err) {
      dispatch(loginFailure('Erreur de connexion'));
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div>
      {loading ? <p>Connexion en cours...</p> : null}
      {error ? <p style={{ color: 'red' }}>{error}</p> : null}
      {isAuthenticated ? (
        <div>
          <p>Bienvenue, {user}!</p>
          <button onClick={handleLogout}>Déconnexion</button>
        </div>
      ) : (
        <form onSubmit={(e) => e.preventDefault()}>
          <div>
            <label htmlFor="email">Adresse email :</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Entrez votre adresse email"
            />
          </div>
          <div>
            <label htmlFor="password">Mot de passe :</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Entrez votre mot de passe"
            />
          </div>
          <button type="button" onClick={handleLogin}>
            Connexion
          </button>
        </form>
      )}
    </div>
  );
};

export default AuthComponent;