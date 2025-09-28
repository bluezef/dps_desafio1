import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/layout/Layout';
import TaskCard from '../../components/tasks/TaskCard';
import TaskEditModal from '../../components/tasks/TaskEditModal';
import ProjectEditModal from '../../components/projects/ProjectEditModal';
import { useAuth } from '../../context/AuthContext';
import { projectsAPI, tasksAPI, usersAPI } from '../../lib/api';
import { 
  Calendar, 
  Users, 
  BarChart3, 
  Clock, 
  Edit, 
  ArrowLeft, 
  Plus,
  CheckSquare,
  AlertTriangle,
  User,
  Settings
} from 'lucide-react';

const ProjectDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectEditModalOpen, setIsProjectEditModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/auth/login';
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (id && isAuthenticated && user) {
      loadProjectData();
    }
  }, [id, isAuthenticated, user]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      
      const [projectRes, tasksRes, usersRes] = await Promise.all([
        projectsAPI.getById(id),
        tasksAPI.getAll(),
        usersAPI.getAll()
      ]);

      const projectData = projectRes.data;
      const allTasks = tasksRes.data;
      const allUsers = usersRes.data;

      const isManager = user.role === 'gerente';
      const isMember = projectData.members?.includes(user.id) || projectData.members?.includes(parseInt(user.id));
      
      if (!isManager && !isMember) {
        alert('No tienes permisos para ver este proyecto');
        window.location.href = '/projects';
        return;
      }

      const projectTasks = allTasks.filter(task => parseInt(task.projectId) === parseInt(id));

      const userTasks = isManager ? projectTasks : projectTasks.filter(task => parseInt(task.assignedTo) === parseInt(user.id));

      setProject(projectData);
      setTasks(userTasks);
      setUsers(allUsers);

    } catch (error) {
      console.error('Error al cargar proyecto:', error);
      alert('Error al cargar el proyecto');
      window.location.href = '/projects';
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      )
    );
    
    const updatedTasks = tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    );
    updateProjectProgress(updatedTasks);
  };

  const handleProjectUpdated = (updatedProject) => {
    setProject(updatedProject);
    loadProjectData();
  };

  const updateProjectProgress = async (updatedTasks) => {
    if (updatedTasks.length === 0) return;
    
    const completedTasks = updatedTasks.filter(task => task.status === 'completado');
    const progress = Math.round((completedTasks.length / updatedTasks.length) * 100);
    
    try {
      const updatedProject = { ...project, progress };
      await projectsAPI.update(project.id, updatedProject);
      setProject(updatedProject);
    } catch (error) {
      console.error('Error al actualizar progreso del proyecto:', error);
    }
  };

  const handleTaskModalClose = () => {
    setIsTaskModalOpen(false);
    setSelectedTask(null);
  };

  const handleProjectEditModalClose = () => {
    setIsProjectEditModalOpen(false);
  };

  const handleEditProject = () => {
    setIsProjectEditModalOpen(true);
  };

  const handleTaskDeleted = (taskId) => {
  setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));

  const updatedTasks = tasks.filter(task => task.id !== taskId);
  updateProjectProgress(updatedTasks);
  };

  const handleProjectDeleted = (projectId) => {
  console.log('Proyecto eliminado:', projectId);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!project) {
    return (
      <Layout title="Proyecto no encontrado">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Proyecto no encontrado
          </h2>
          <button 
            onClick={() => window.location.href = '/projects'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Volver a Proyectos
          </button>
        </div>
      </Layout>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      'planificacion': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'en-progreso': 'bg-blue-100 text-blue-800 border-blue-200',
      'completado': 'bg-green-100 text-green-800 border-green-200',
      'pausado': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusText = (status) => {
    const texts = {
      'planificacion': 'Planificación',
      'en-progreso': 'En Progreso',
      'completado': 'Completado',
      'pausado': 'Pausado'
    };
    return texts[status] || status;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isOverdue = new Date(project.endDate) < new Date() && project.status !== 'completado';
  const projectMembers = users.filter(u => project.members?.includes(u.id) || project.members?.includes(parseInt(u.id)));
  const manager = users.find(u => u.id === project.managerId || parseInt(u.id) === parseInt(project.managerId));

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completado').length,
    inProgress: tasks.filter(t => t.status === 'en-progreso').length,
    pending: tasks.filter(t => t.status === 'por-hacer').length,
    review: tasks.filter(t => t.status === 'revision').length,
    overdue: tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'completado').length
  };

  const groupedTasks = {
    'por-hacer': tasks.filter(t => t.status === 'por-hacer'),
    'en-progreso': tasks.filter(t => t.status === 'en-progreso'),
    'revision': tasks.filter(t => t.status === 'revision'),
    'completado': tasks.filter(t => t.status === 'completado')
  };

  const statusLabels = {
    'por-hacer': 'Por Hacer',
    'en-progreso': 'En Progreso',
    'revision': 'En Revisión',
    'completado': 'Completado'
  };

  return (
    <Layout title={project.title}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.location.href = '/projects'}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {project.title}
              </h1>
              <p className="text-gray-600 mt-1">
                Detalles del proyecto y seguimiento de tareas
              </p>
            </div>
          </div>
          
          {user?.role === 'gerente' && (
            <div className="flex space-x-3">
              <button 
                onClick={handleEditProject}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar Proyecto
              </button>
              <button 
                onClick={() => window.location.href = `/tasks/create?projectId=${project.id}`}
                className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Tarea
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
                <p className="text-gray-600">{project.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    Fecha de inicio
                  </div>
                  <p className="font-medium">{formatDate(project.startDate)}</p>
                </div>
                
                <div>
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    Fecha de fin
                  </div>
                  <p className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                    {formatDate(project.endDate)}
                    {isOverdue && <span className="text-red-600 text-sm ml-2">(Vencido)</span>}
                  </p>
                </div>
              </div>

              {manager && (
                <div>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <User className="h-4 w-4 mr-2" />
                    Gerente del Proyecto
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                      {manager.avatar || manager.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{manager.name}</p>
                      <p className="text-sm text-gray-500">{manager.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Estado</span>
                  <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(project.status)}`}>
                    {getStatusText(project.status)}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Progreso</span>
                  <span className="text-sm font-medium">{project.progress || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress || 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Users className="h-4 w-4 mr-2" />
                  Miembros del equipo
                </div>
                <div className="space-y-2">
                  {projectMembers.map((member) => (
                    <div key={member.id} className="flex items-center">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2">
                        {member.avatar || member.name?.charAt(0)}
                      </div>
                      <span className="text-sm text-gray-900">{member.name}</span>
                      <span className="text-xs text-gray-500 ml-2 capitalize">({member.role})</span>
                    </div>
                  ))}
                </div>
              </div>

              {user?.role === 'gerente' && (
                <div className="pt-4 border-t">
                  <button
                    onClick={handleEditProject}
                    className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                <Settings className="h-4 w-4 mr-2" />
                    Configurar Proyecto
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {tasks.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Estadísticas de Tareas
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-600">{taskStats.total}</div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-600">{taskStats.pending}</div>
                <div className="text-sm text-gray-500">Por Hacer</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-600">{taskStats.inProgress}</div>
                <div className="text-sm text-gray-500">En Progreso</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-xl font-bold text-purple-600">{taskStats.review}</div>
                <div className="text-sm text-gray-500">En Revisión</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-600">{taskStats.completed}</div>
                <div className="text-sm text-gray-500">Completadas</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-xl font-bold text-red-600">{taskStats.overdue}</div>
                <div className="text-sm text-gray-500">Vencidas</div>
              </div>
            </div>
          </div>
        )}

        {isOverdue && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Proyecto Vencido
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  Este proyecto ha superado su fecha límite.
                </p>
              </div>
            </div>
          </div>
        )}

        {taskStats.overdue > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  {taskStats.overdue} tarea(s) vencida(s)
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Algunas tareas han superado su fecha límite.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Tareas del Proyecto
            </h3>
            {user?.role === 'gerente' && (
              <button 
                onClick={() => window.location.href = `/tasks/create?projectId=${project.id}`}
                className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Tarea
              </button>
            )}
          </div>

          {tasks.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {Object.entries(groupedTasks).map(([status, statusTasks]) => (
                <div key={status} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">
                      {statusLabels[status]}
                    </h4>
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
            <div className="text-center py-8">
              <CheckSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No hay tareas en este proyecto
              </h4>
              <p className="text-gray-600 mb-4">
                {user?.role === 'gerente' 
                  ? 'Crea la primera tarea para comenzar a trabajar'
                  : 'No tienes tareas asignadas en este proyecto'
                }
              </p>
              {user?.role === 'gerente' && (
                <button 
                  onClick={() => window.location.href = `/tasks/create?projectId=${project.id}`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Tarea
                </button>
              )}
            </div>
          )}
        </div>
      </div>
          
    <TaskEditModal
    isOpen={isTaskModalOpen}
    onClose={handleTaskModalClose}
    task={selectedTask}
    onTaskUpdated={handleTaskUpdated}
    onTaskDeleted={handleTaskDeleted}
    />

    <ProjectEditModal
    isOpen={isProjectEditModalOpen}
    onClose={handleProjectEditModalClose}
    project={project}
    onProjectUpdated={handleProjectUpdated}
    onProjectDeleted={handleProjectDeleted}
    />
    </Layout>
  );
};

export default ProjectDetail;