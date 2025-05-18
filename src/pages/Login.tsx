import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  //const { user } = useAuth();

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  const loggedUser = await login(email, password);
  
  if (!loggedUser) {
    alert('Credenciales inválidas');
    return;
  }

  if (loggedUser.role === 'cliente') {
    navigate('/cliente/restaurantes');
  } else if (loggedUser.role === 'pos') {
    navigate('/pos/restaurantes');
  }
};

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleLogin}>
        <div className="login-icon">🏪</div>
        <h2>Iniciar sesión</h2>
        <label className="login-label">Usuario:</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo" />
        <label className="login-label">Contraseña:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" />
        <button type="submit">Entrar</button>
      </form>
    </div>
  );

};

export default Login;
