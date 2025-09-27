import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import TaskCard from '../../components/tasks/TaskCard';
import { useAuth } from '../../context/AuthContext';
import { tasksAPI, usersAPI, projectsAPI } from '../../lib/api';
import { 
  Plus, 
  Search, 
  Filter,
  CheckSquare 
} from 'lucide-react';

const Tasks = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [priorityFilter, setPriorityFilter] = useState('todas');
  const [filteredTasks, setFilteredTasks] = useState([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/auth/login';
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadData();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchTerm, statusFilter, priorityFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksRes, usersRes, projectsRes] = await Promise.all([
        tasksAPI.getAll(),
        usersAPI.getAll(),
        projectsAPI.getAll()
      ]);
      
      // Filtrar tareas según el rol del usuario
      const userTasks = user.role === 'gerente' 
        ? tasksRes.data 
        : tasksRes.data.filter(t => t.assignedTo === user.id);

      setTasks(userTasks);
      setUsers(usersRes.data);
      setProjects(projectsRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = tasks;

    // Filtro por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Filtro por prioridad
    if (priorityFilter !== 'todas') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    setFilteredTasks(filtered);
  };

  const handleTaskClick = (task) => {
    // Implementar modal o navegación a detalle de tarea
    console.log('Clicked task:', task);
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  const groupedTasks = {
    'por-hacer': filteredTasks.filter(t => t.status === 'por-hacer'),
    'en-progreso': filteredTasks.filter(t => t.status === 'en-progreso'),
    'revision': filteredTasks.filter(t => t.status === 'revision'),
    'completado': filteredTasks.filter(t => t.status === 'completado')
  };

  const statusLabels = {
    'por-hacer': 'Por Hacer',
    'en-progreso': 'En Progreso',
    'revision': 'En Revisión',
    'completado': 'Completado'
  };

  return (
    <Layout title="Tareas">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tareas</h1>
            <p className="text-gray-600 mt-1">
              Organiza y da seguimiento a todas tus tareas
            </p>
          </div>
          {user?.role === 'gerente' && (
            <button 
                onClick={() => window.location.href = '/tasks/create'}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Tarea
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar tareas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="todos">Todos los estados</option>
                <option value="por-hacer">Por Hacer</option>
                <option value="en-progreso">En Progreso</option>
                <option value="revision">En Revisión</option>
                <option value="completado">Completado</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="relative">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="todas">Todas las prioridades</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {Object.entries(groupedTasks).map(([status, statusTasks]) => (
              <div key={status} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">
                    {statusLabels[status]}
                  </h3>
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                    {statusTasks.length}
                  </span>
                </div>
                
                <div className="space-y-3">
                  {statusTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      users={users}
                      onClick={() => handleTaskClick(task)}
                    />
                  ))}
                  {statusTasks.length === 0 && (
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center text-gray-500 text-sm">
                      No hay tareas
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <CheckSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'todos' || priorityFilter !== 'todas'
                ? 'No se encontraron tareas' 
                : 'No tienes tareas aún'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'todos' || priorityFilter !== 'todas'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Las tareas aparecerán aquí cuando sean creadas'
              }
            </p>
          </div>
        )}

        {/* Stats */}
        {tasks.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Resumen de Tareas
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {tasks.length}
                </div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {tasks.filter(t => t.status === 'por-hacer').length}
                </div>
                <div className="text-sm text-gray-500">Por Hacer</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {tasks.filter(t => t.status === 'en-progreso').length}
                </div>
                <div className="text-sm text-gray-500">En Progreso</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {tasks.filter(t => t.status === 'revision').length}
                </div>
                <div className="text-sm text-gray-500">En Revisión</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {tasks.filter(t => t.status === 'completado').length}
                </div>
                <div className="text-sm text-gray-500">Completadas</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Tasks;