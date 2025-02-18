import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => { // Llamada al backend para consultar el usuario
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', { username, password });
      if (response.data.statusCode === 200) {
        localStorage.setItem('token', response.data.intDataMessage[0].token);
        navigate('/home');
      }
    } catch (error) {
      setErrorMessage('Credenciales inválidas');
      setShowModal(true);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow-lg" style={{ width: "25rem" }}>
        <h2 className="text-center text-primary mb-4">Iniciar sesión</h2>
        <form onSubmit={handleLogin}>
          
          <div className="mb-3">
            <label className="form-label fw-bold">Usuario</label>
            <input
              type="text"
              className="form-control"
              placeholder="JuanPérez"
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
                    
          <div className="mb-3">
            <label className="form-label fw-bold">Contraseña</label>
            <input
              type="password"
              className="form-control"
              placeholder="*****"
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
            
          <div className="d-grid">
            <button className="btn btn-outline-secondary fw-bold" type="submit">
              Login
            </button>
          </div>
        </form>
      </div>

      <div className={`modal ${showModal ? 'show' : ''}`} tabIndex="-1" style={{ display: showModal ? 'block' : 'none' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header background-danger">
            <h5 className="modal-title">Error de autenticación</h5>
            <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
          </div>
          <div className="modal-body">
            <p>{errorMessage}</p>
          </div>
          <div className="modal-footer">
            <div className='d-grid'>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    {showModal && <div className="modal-backdrop show"></div>}
    
  </div>

  );
};

export default Login;
