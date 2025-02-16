import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Home = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(60);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const intervalRef = useRef(null);

  const handleLogout = () => { // "Cierre" de sesión 
    localStorage.removeItem('token');
    navigate('/');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { // Función que sirve para consultar TOkEN y mandar mensaje de redirección
      if (!sessionExpired) {
        setErrorMessage('Sesión expirada.');
        setSessionExpired(true);
        setShowModal(true);
      }
      return;
    }

    const { exp } = jwtDecode(token);
    const now = Date.now() / 1000;
    const timeRemaining = exp - now;

    if (timeRemaining <= 0) { // En caso de que expire el TOKEN llama al MODAL para redireccionar al login
      if (!sessionExpired) {
        setErrorMessage('Sesión expirada.');
        setSessionExpired(true);
        localStorage.removeItem('token');
        setShowModal(true);
      }
    } else {
      setTimeLeft(Math.floor(timeRemaining));

      if (!intervalRef.current) {
        intervalRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(intervalRef.current);
              if (!sessionExpired) {
                setErrorMessage('Tiempo de la sesión agotado .');
                setSessionExpired(true);
                localStorage.removeItem('token');
                setShowModal(true);
              }
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [navigate, sessionExpired]);

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow-lg p-4 text-center">
        <h2 className="text-primary mb-3">Bienvenido al Home</h2>
        <p className="text-muted">Has iniciado sesión correctamente.</p>
        <p className="text-danger fw-bold">Tiempo restante: {timeLeft} segundos</p>
        <button className="btn btn-danger mt-3" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i> Cerrar sesión
        </button>
      </div>

      {showModal && (
        <>
          <div className="modal show" tabIndex="-1" style={{ display: 'block' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header bg-danger text-white">
                  <h5 className="modal-title">Sesión finalizada</h5>
                </div>
                <div className="modal-body">
                  <p>{errorMessage}</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleLogout}>
                    Aceptar
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </>
      )}
    </div>
  );
};

export default Home;
