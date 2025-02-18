import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/register', { username, email, password, role });
      if (response.data.statusCode === 201) {
        setMessage('Usuario registrado exitosamente');
        setShowModal(true);
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error en el registro');
      setShowModal(true);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow-lg" style={{ width: "25rem" }}>
        <h2 className="text-center text-primary mb-4">Registro</h2>
        <form onSubmit={handleRegister}>
          
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
            <label className="form-label fw-bold">Correo Electrónico</label>
            <input
              type="email"
              className="form-control"
              placeholder="juan@example.com"
              onChange={e => setEmail(e.target.value)}
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

          <div className="mb-3">
            <label className="form-label fw-bold">Rol</label>
            <select className="form-control" onChange={e => setRole(e.target.value)}>
              <option value="common_user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className="d-grid">
            <button className="btn btn-outline-secondary fw-bold" type="submit">
              Registrar
            </button>
          </div>
        </form>
        <p>¿Ya tienes cuenta? <Link to="/" className="text-primary fw-bold">Inicia sesión aquí</Link></p>
      </div>


      <div className={`modal ${showModal ? 'show' : ''}`} tabIndex="-1" style={{ display: showModal ? 'block' : 'none' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Registro</h5>
              <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
            </div>
            <div className="modal-body">
              <p>{message}</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      </div>

      {showModal && <div className="modal-backdrop show"></div>}
    </div>
  );
};

export default Register;
