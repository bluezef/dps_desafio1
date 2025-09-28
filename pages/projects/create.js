import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../context/AuthContext';
import { projectsAPI, usersAPI } from '../../lib/api';
import { 
  Save, 
  X, 
  Calendar,
  Users,
  FileText,
  AlertCircle 
} from 'lucide-react';

const CreateProject = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'planificacion',
    startDate: '',
    endDate: '',
    members: []
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/auth/login';
      return;
    }
    
    if (!authLoading && user && user.role !== 'gerente') {
      window.location.href = '/dashboard';
      return;
    }
    
    if (isAuthenticated && user && user.role === 'gerente') {
      loadUsers();
    }
  }, [isAuthenticated, authLoading, user]);

  const loadUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleMemberToggle = (userId) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter(id => id !== userId)
        : [...prev.members, userId]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'La fecha de inicio es requerida';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'La fecha de fin es requerida';
    }
    
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }
    
    if (formData.members.length === 0) {
      newErrors.members = 'Debe asignar al menos un miembro al proyecto';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const projectData = {
        ...formData,
        progress: 0,
        managerId: user.id,
      };
      
      await projectsAPI.create(projectData);
      
      window.location.href = '/projects';
      
    } catch (error) {
      console.error('Error al crear proyecto:', error);
      setErrors({ submit: 'Error al crear el proyecto. Intenta de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (user?.role !== 'gerente') {
    return (
      <Layout title="Acceso Denegado">
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-red-500 mb-4">
            <AlertCircle className="h-12 w-12" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Acceso Denegado
          </h2>
          <p className="text-gray-600 mb-4">
            Solo los gerentes pueden crear proyectos
          </p>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Volver al Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Crear Proyecto">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Crear Nuevo Proyecto
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Completa los detalles del proyecto para comenzar
                </p>
              </div>
              <button
                onClick={() => window.location.href = '/projects'}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{errors.submit}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Título del Proyecto *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 border ${
                      errors.title ? 'border-red-300' : 'border-gray-300'
                    } rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Ej: Desarrollo de aplicación web"
                  />
                </div>
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className={`block w-full px-3 py-3 border ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Describe los objetivos y alcance del proyecto..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inicio *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 border ${
                      errors.startDate ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  />
                </div>
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                )}
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Fin *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 border ${
                      errors.endDate ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  />
                </div>
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                )}
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Estado Inicial
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="planificacion">Planificación</option>
                  <option value="en-progreso">En Progreso</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Miembros del Equipo *
              </label>
              <div className="border border-gray-300 rounded-md p-4 space-y-2 max-h-48 overflow-y-auto">
                {users.map((userData) => (
                  <label
                    key={userData.id}
                    className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.members.includes(userData.id)}
                      onChange={() => handleMemberToggle(userData.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="ml-3 flex items-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {userData.avatar || userData.name?.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {userData.name}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {userData.role}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {errors.members && (
                <p className="mt-1 text-sm text-red-600">{errors.members}</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-6 border-t">
              <button
                type="button"
                onClick={() => window.location.href = '/projects'}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Creando...' : 'Crear Proyecto'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateProject;