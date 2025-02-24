import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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

  const handleApiCall = async (action, data = {}, params = {}) => {
    let url = '';
    let method = '';
    
    switch (action) {
        case 'getUsers':
            url = '/getUsers';
            method = 'get';
            break;
        case 'getRoles':
            url = '/getRoles';
            method = 'get';
            break;
        case 'deleteUser':
            url = `/deleteUsers/${params.username}`;
            method = 'delete';
            break;
        case 'updateUser':
            url = `/updateUsers/${params.username}`;
            method = 'put';
            break;
        case 'updateRole':
            url = `/updateRol/${params.username}`;
            method = 'put';
            break;
        case 'addRole':
            url = '/addRol';
            method = 'post';
            break;
        case 'deleteRole':
            url = `/deleteRol/${params.role}`;
            method = 'delete';
            break;
        case 'addPermission':
            url = `/addPermissions/${params.role}`;
            method = 'post';
            break;
        case 'deletePermission':
            url = `/deletePermissions/${params.role}/${params.permission}`;
            method = 'delete';
            break;
        default:
            console.error('Acción no soportada');
            return;
    }
    
    try {
        const response = await axios({
            method,
            url: `http://localhost:5000${url}`,
            data: method !== 'get' ? data : null,
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (response.status === 200 || response.status === 201) {
            console.log('Operación exitosa:', response.data);
        }
    } catch (error) {
        console.error('Error en la llamada API:', error.response?.data?.message || error.message);
    }
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


        
        {/* Botones para las APIs */}
        <div className="mt-4">
          <button className="btn btn-primary m-2" onClick={() => handleApiCall('getUsers')}>Obtener Usuarios</button>
          <button className="btn btn-primary m-2" onClick={() => handleApiCall('getRoles')}>Obtener Roles</button>
          <button className="btn btn-danger m-2" onClick={() => handleApiCall('deleteUsers/{username}', 'DELETE')}>Eliminar Usuario</button>
          <button className="btn btn-warning m-2" onClick={() => handleApiCall('updateUsers/{username}', 'PUT', { key: 'value' })}>Actualizar Usuario</button>
          <button className="btn btn-warning m-2" onClick={() => handleApiCall('updateRol/{username}', 'PUT', { role: 'nuevoRol' })}>Actualizar Rol</button>
          <button className="btn btn-success m-2" onClick={() => handleApiCall('addRol', 'POST', { role: 'nuevoRol', permissions: [] })}>Agregar Rol</button>
          <button className="btn btn-danger m-2" onClick={() => handleApiCall('deleteRol/{role}', 'DELETE')}>Eliminar Rol</button>
          <button className="btn btn-info m-2" onClick={() => handleApiCall('addPermissions/{role}', 'POST', { permission: 'nuevoPermiso' })}>Agregar Permiso</button>
          <button className="btn btn-danger m-2" onClick={() => handleApiCall('deletePermissions/{role}/{permission}', 'DELETE')}>Eliminar Permiso</button>
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