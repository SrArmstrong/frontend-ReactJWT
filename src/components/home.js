import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const Home = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(60);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showModalS, setShowModalS] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retrievedData, setRetrievedData] = useState(null);
  const [successfullyMessage, setSuccesfullyMessage] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [showGetModal, setShowGetModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newPermissionName, setNewPermissionName] = useState(''); // Estado para el nombre del permiso
  const [rolesList, setRolesList] = useState([]); // Estado para la lista de roles
  const [selectedRole, setSelectedRole] = useState(''); // Estado para el rol seleccionado
  const intervalRef = useRef(null);

  const handleLogout = () => {
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
            setSuccesfullyMessage('Operación exitosa');
            setShowModalS(true);
            setRetrievedData(response.data); 
            console.log('Operación exitosa:', response.data);
        }
        return response; // Devuelve la respuesta para su uso posterior
    } catch (error) {
        console.error('Error en la llamada API:', error.response?.data?.message || error.message);
    }
  };

  const handleCloseModal = () => {
    setShowModalS(false);
  };

  useEffect(() => {
    if (showAddModal) {
      handleApiCall('getRoles').then((response) => {
        if (response && response.data) {
          // Extraer solo los nombres de los roles
          const roles = response.data.map((roleObj) => roleObj.role);
          setRolesList(roles); // Almacena solo los nombres de los roles
        }
      });
    }
  }, [showAddModal]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
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

    if (timeRemaining <= 0) {
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

  const GetModal = () => (
    <>
      <div className="modal show" tabIndex="-1" style={{ display: 'block' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">Obtener</h5>
              <button type="button" className="btn-close" onClick={() => setShowGetModal(false)}></button>
            </div>
            <div className="modal-body">
              <button
                className="btn btn-primary m-2"
                onClick={() => {
                  handleApiCall('getUsers');
                  setShowGetModal(false); // Cierra el modal
                }}
              >
                Obtener Usuarios
              </button>
              <button
                className="btn btn-primary m-2"
                onClick={() => {
                  handleApiCall('getRoles');
                  setShowGetModal(false); // Cierra el modal
                }}
              >
                Obtener Roles
              </button>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowGetModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show"></div>
    </>
  );

  const AddModal = () => (
    <>
      <div className="modal show" tabIndex="-1" style={{ display: 'block' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header bg-success text-white">
              <h5 className="modal-title">Agregar</h5>
              <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
            </div>
            <div className="modal-body">
              {/* Input para el nombre del nuevo rol */}
              <input
                type="text"
                className="form-control mb-3"
                placeholder="Nombre del nuevo rol"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
              />
              <button
                className="btn btn-success m-2"
                onClick={() => {
                  handleApiCall('addRole', { role: newRoleName, permissions: [] });
                  setShowAddModal(false); // Cierra el modal
                  setNewRoleName(''); // Limpia el input después de enviar
                }}
              >
                Agregar Rol
              </button>

              {/* Input para el nombre del nuevo permiso */}
              <input
                type="text"
                className="form-control mb-3"
                placeholder="Nombre del nuevo permiso"
                value={newPermissionName}
                onChange={(e) => setNewPermissionName(e.target.value)}
              />

              {/* Select para elegir el rol */}
              <select
                className="form-select mb-3"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="">Selecciona un rol</option>
                {rolesList.map((role, index) => (
                  <option key={index} value={role}>
                    {role}
                  </option>
                ))}
              </select>

              <button
                className="btn btn-success m-2"
                onClick={() => {
                  handleApiCall('addPermission', { permission: newPermissionName }, { role: selectedRole });
                  setShowAddModal(false); // Cierra el modal
                  setNewPermissionName(''); // Limpia el input después de enviar
                  setSelectedRole(''); // Limpia el select después de enviar
                }}
              >
                Agregar Permiso
              </button>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show"></div>
    </>
  );

  const UpdateModal = () => (
    <>
      <div className="modal show" tabIndex="-1" style={{ display: 'block' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header bg-warning text-white">
              <h5 className="modal-title">Actualizar</h5>
              <button type="button" className="btn-close" onClick={() => setShowUpdateModal(false)}></button>
            </div>
            <div className="modal-body">
              <button
                className="btn btn-warning m-2"
                onClick={() => {
                  handleApiCall('updateUser', { key: 'value' }, { username: 'usuarioEjemplo' });
                  setShowUpdateModal(false); // Cierra el modal
                }}
              >
                Actualizar Usuario
              </button>
              <button
                className="btn btn-warning m-2"
                onClick={() => {
                  handleApiCall('updateRole', { role: 'nuevoRol' }, { username: 'usuarioEjemplo' });
                  setShowUpdateModal(false); // Cierra el modal
                }}
              >
                Actualizar Rol
              </button>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowUpdateModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show"></div>
    </>
  );

  const DeleteModal = () => (
    <>
      <div className="modal show" tabIndex="-1" style={{ display: 'block' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header bg-danger text-white">
              <h5 className="modal-title">Eliminar</h5>
              <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
            </div>
            <div className="modal-body">
              <button
                className="btn btn-danger m-2"
                onClick={() => {
                  handleApiCall('deleteUser', {}, { username: 'usuarioEjemplo' });
                  setShowDeleteModal(false); // Cierra el modal
                }}
              >
                Eliminar Usuario
              </button>
              <button
                className="btn btn-danger m-2"
                onClick={() => {
                  handleApiCall('deleteRole', {}, { role: 'rolEjemplo' });
                  setShowDeleteModal(false); // Cierra el modal
                }}
              >
                Eliminar Rol
              </button>
              <button
                className="btn btn-danger m-2"
                onClick={() => {
                  handleApiCall('deletePermission', {}, { role: 'rolEjemplo', permission: 'permisoEjemplo' });
                  setShowDeleteModal(false); // Cierra el modal
                }}
              >
                Eliminar Permiso
              </button>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show"></div>
    </>
  );

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
        
      <div className="mt-4">
        <button className="btn btn-primary m-2" onClick={() => setShowGetModal(true)}>Obtener</button>
        <button className="btn btn-success m-2" onClick={() => setShowAddModal(true)}>Agregar</button>
        <button className="btn btn-warning m-2" onClick={() => setShowUpdateModal(true)}>Actualizar</button>
        <button className="btn btn-danger m-2" onClick={() => setShowDeleteModal(true)}>Eliminar</button>
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

      {showModalS && (
        <>
          <div className="modal show" tabIndex="-1" style={{ display: 'block' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-success text-white">
                  <h5 className="modal-title">Información Recuperada</h5>
                </div>
                <div className="modal-body">
                {retrievedData ? (
                  <ul>
                    {Array.isArray(retrievedData) ? (
                      retrievedData.map((item, index) => (
                        <li key={index}>
                          {typeof item === 'object' ? JSON.stringify(item) : item}
                        </li>
                      ))
                    ) : (
                      <p>{JSON.stringify(retrievedData)}</p>
                    )}
                  </ul>
                ) : (
                  <p>{successfullyMessage}</p>
                )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                    Aceptar
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </>
      )}

      {showGetModal && <GetModal />}
      {showAddModal && <AddModal />}
      {showUpdateModal && <UpdateModal />}
      {showDeleteModal && <DeleteModal />}
    </div>
  );
};

export default Home;