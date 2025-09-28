import React, { useState, useEffect } from 'react';
import { X, Save, Flag, Calendar, User, CheckSquare, Trash2, AlertCircle } from 'lucide-react';
import { tasksAPI, usersAPI, projectsAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const TaskEditModal = ({ isOpen, onClose, task, onTaskUpdated, onTaskDeleted }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
    assignedTo: '',
    dueDate: ''
  });

  useEffect(() => {
    if (isOpen && task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || '',
        priority: task.priority || '',
        assignedTo: task.assignedTo || '',
        dueDate: task.dueDate || ''
      });
      
      if (user?.role === 'gerente') {
        loadData();
      }
    }
  }, [isOpen, task, user]);

  const loadData = async () => {
    try {
      const [usersRes, projectsRes] = await Promise.all([
        usersAPI.getAll(),
        projectsAPI.getAll()
      ]);
      setUsers(usersRes.data);
      setProjects(projectsRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const isManager = user?.role === 'gerente';
      const isAssignedUser = parseInt(task?.assignedTo) === parseInt(user?.id);
      
      if (!isManager && !isAssignedUser) {
        alert('No tienes permisos para editar esta tarea');
        return;
      }
      
      let updatedTask;
      
      if (isManager) {
        updatedTask = {
          ...task,
          ...formData,
          assignedTo: parseInt(formData.assignedTo)
        };
      } else {
        updatedTask = {
          ...task,
          status: formData.status
        };
      }
      
      await tasksAPI.update(task.id, updatedTask);
      onTaskUpdated(updatedTask);
      onClose();
      
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      alert('Error al actualizar la tarea. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };
const handleDeleteTask = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    try {
      setDeleting(true);
      
      // Eliminar la tarea
      await tasksAPI.delete(task.id);
      
      // Notificar al componente padre
      if (onTaskDeleted) {
        onTaskDeleted(task.id);
      }
      
      // Cerrar modal
      onClose();
      alert('Tarea eliminada correctamente');
      
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      alert('Error al eliminar la tarea. Intenta de nuevo.');
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  if (!isOpen) return null;

  const isManager = user?.role === 'gerente';
  const isAssignedUser = parseInt(task?.assignedTo) === parseInt(user?.id);
  const canEdit = isManager || isAssignedUser;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {isManager ? 'Editar Tarea' : 'Actualizar Estado de Tarea'}
              </h3>
              {!canEdit && (
                <p className="text-sm text-red-600 mt-1">
                  No tienes permisos para editar esta tarea
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título
              </label>
              {isManager ? (
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900 p-2 bg-gray-50 rounded">{task?.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              {isManager ? (
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900 p-2 bg-gray-50 rounded">{task?.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CheckSquare className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={!canEdit}
                  className={`block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    !canEdit ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="por-hacer">Por Hacer</option>
                  <option value="en-progreso">En Progreso</option>
                  <option value="revision">En Revisión</option>
                  <option value="completado">Completado</option>
                </select>
              </div>
            </div>

            {isManager && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioridad
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Flag className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
              </div>
            )}

            {isManager && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asignado a
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar usuario</option>
                    {users.map((userData) => (
                      <option key={userData.id} value={userData.id}>
                        {userData.name} ({userData.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {isManager && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Límite
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {!isManager && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <div className="flex items-center">
                  <CheckSquare className="h-5 w-5 text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Puedes actualizar el estado de esta tarea
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Cambia el estado según el progreso de tu trabajo
                    </p>
                  </div>
                </div>
              </div>
            )}
            {isManager && showDeleteConfirm && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-red-800">
                      ¿Confirmar eliminación?
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>
                        Esta acción eliminará permanentemente la tarea "{task.title}". 
                        Esta acción no se puede deshacer.
                      </p>
                    </div>
                    <div className="mt-4 flex space-x-3">
                      <button
                        type="button"
                        onClick={handleDeleteTask}
                        disabled={deleting}
                        className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                          deleting ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {deleting ? 'Eliminando...' : 'Sí, Eliminar'}
                      </button>
                      <button
                        type="button"
                        onClick={cancelDelete}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>

                {isManager && !showDeleteConfirm && (
                  <button
                    type="button"
                    onClick={handleDeleteTask}
                    disabled={loading || deleting}
                    className={`inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                      loading || deleting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar Tarea
                  </button>
                )}
              </div>
              
              <button
                type="submit"
                disabled={loading || deleting || !canEdit || showDeleteConfirm}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                  canEdit 
                    ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' 
                    : 'bg-gray-400 cursor-not-allowed'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  loading || deleting || showDeleteConfirm ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Guardando...' : canEdit ? 'Guardar Cambios' : 'Sin Permisos'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskEditModal;