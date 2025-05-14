import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { user } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const loggedUser = await login(email, password);
    
    if (!loggedUser) {
      alert('Credenciales inválidas');
      return;
    }

    if (loggedUser.role === 'cliente') {
      navigate('/productos');
    } else if (loggedUser.role === 'pos') {
      navigate('/pos/restaurantes');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo" />
      <input value={password} type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" />
      <button type="submit">Iniciar sesión</button>
    </form>
  );
};

export default Login;
