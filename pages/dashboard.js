import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { projectsAPI, tasksAPI } from '../lib/api';
import { 
  FolderOpen, 
  CheckSquare, 
  Clock, 
  TrendingUp,
  Users,
  Calendar,
  AlertTriangle
} from 'lucide-react';

const Dashboard = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/auth/login';
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadDashboardData();
    }
  }, [isAuthenticated, user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [projectsRes, tasksRes] = await Promise.all([
        projectsAPI.getAll(),
        tasksAPI.getAll()
      ]);

      const projects = projectsRes.data;
      const tasks = tasksRes.data;

      console.log('Raw data:', { projects, tasks, user });

      let userProjects, userTasks;
      
      if (user.role === 'gerente') {
        userProjects = projects;
        userTasks = tasks;
      } else {
        userProjects = projects.filter(p => 
          p.members?.includes(user.id) || p.members?.includes(parseInt(user.id))
        );
        userTasks = tasks.filter(t => 
          parseInt(t.assignedTo) === parseInt(user.id)
        );
      }

      console.log('Filtered data:', { userProjects, userTasks });

      const now = new Date();
      const overdue = userTasks.filter(t => 
        new Date(t.dueDate) < now && t.status !== 'completado'
      );

      const completedTasks = userTasks.filter(t => t.status === 'completado');
      const pendingTasks = userTasks.filter(t => t.status !== 'completado');

      console.log('Stats calculation:', {
        totalTasks: userTasks.length,
        completedTasks: completedTasks.length,
        pendingTasks: pendingTasks.length,
        overdueTasks: overdue.length,
        completedTasksData: completedTasks
      });

      setStats({
        totalProjects: userProjects.length,
        activeProjects: userProjects.filter(p => p.status === 'en-progreso').length,
        totalTasks: userTasks.length,
        completedTasks: completedTasks.length,
        pendingTasks: pendingTasks.length,
        overdueTasks: overdue.length
      });

      setRecentProjects(
        userProjects
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3)
      );

      setRecentTasks(
        userTasks
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
      );

    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, color, description }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="text-xs text-gray-400 mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  );

  const getStatusColor = (status) => {
    const colors = {
      'planificacion': 'bg-yellow-500',
      'en-progreso': 'bg-blue-500',
      'completado': 'bg-green-500',
      'pausado': 'bg-red-500',
      'por-hacer': 'bg-gray-500',
      'revision': 'bg-purple-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getOverallProgress = () => {
    if (stats.totalTasks === 0) return 0;
    return Math.round((stats.completedTasks / stats.totalTasks) * 100);
  };

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            ¡Bienvenido, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            Aquí tienes un resumen de tus proyectos y tareas
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Proyectos"
                value={stats.totalProjects}
                icon={FolderOpen}
                color="bg-blue-500"
                description={`${stats.activeProjects} activos`}
              />
              <StatCard
                title="Total Tareas"
                value={stats.totalTasks}
                icon={CheckSquare}
                color="bg-green-500"
                description={`${stats.completedTasks} completadas`}
              />
              <StatCard
                title="Tareas Pendientes"
                value={stats.pendingTasks}
                icon={Clock}
                color="bg-yellow-500"
                description={`${stats.overdueTasks} vencidas`}
              />
              <StatCard
                title="Progreso General"
                value={`${getOverallProgress()}%`}
                icon={TrendingUp}
                color="bg-purple-500"
                description="Tareas completadas"
              />
            </div>

            {stats.overdueTasks > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Tienes {stats.overdueTasks} tarea(s) vencida(s)
                    </h3>
                    <p className="text-sm text-red-700 mt-1">
                      Revisa tus tareas pendientes para ponerte al día.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {stats.totalTasks > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Desglose de Tareas
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600 mb-1">
                      {stats.totalTasks}
                    </div>
                    <div className="text-sm text-gray-500">Total</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {stats.completedTasks}
                    </div>
                    <div className="text-sm text-gray-500">Completadas</div>
                    <div className="text-xs text-green-600 mt-1">
                      {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
                    </div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600 mb-1">
                      {stats.pendingTasks}
                    </div>
                    <div className="text-sm text-gray-500">Pendientes</div>
                    <div className="text-xs text-yellow-600 mt-1">
                      {stats.totalTasks > 0 ? Math.round((stats.pendingTasks / stats.totalTasks) * 100) : 0}%
                    </div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600 mb-1">
                      {stats.overdueTasks}
                    </div>
                    <div className="text-sm text-gray-500">Vencidas</div>
                    <div className="text-xs text-red-600 mt-1">
                      {stats.totalTasks > 0 ? Math.round((stats.overdueTasks / stats.totalTasks) * 100) : 0}%
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Proyectos Recientes
                    </h2>
                    <a 
                      href="/projects" 
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Ver todos →
                    </a>
                  </div>
                </div>
                <div className="divide-y divide-gray-200">
                  {recentProjects.length > 0 ? (
                    recentProjects.map((project) => (
                      <div key={project.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">
                              {project.title}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {project.description}
                            </p>
                            <div className="flex items-center mt-2 space-x-4">
                              <div className="flex items-center text-xs text-gray-500">
                                <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(project.status)}`} />
                                {project.status}
                              </div>
                              <span className="text-xs text-gray-500">
                                {project.progress}% completado
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No hay proyectos recientes</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Tareas Recientes
                    </h2>
                    <a 
                      href="/tasks" 
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Ver todas →
                    </a>
                  </div>
                </div>
                <div className="divide-y divide-gray-200">
                  {recentTasks.length > 0 ? (
                    recentTasks.map((task) => (
                      <div key={task.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">
                              {task.title}
                            </h4>
                            <p className="text-sm text-gray-600 line-clamp-1">
                              {task.description}
                            </p>
                            <div className="flex items-center mt-2 space-x-4">
                              <div className="flex items-center text-xs text-gray-500">
                                <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(task.status)}`} />
                                {task.status}
                              </div>
                              <div className="flex items-center text-xs text-gray-500">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(task.dueDate).toLocaleDateString('es-ES')}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No hay tareas recientes</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {user?.role === 'gerente' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Acciones Rápidas
                </h2>
                <div className="flex flex-wrap gap-4">
                  
                  <a  href="/projects/create"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Nuevo Proyecto
                  </a>
                  
                  <a  href="/tasks/create"
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Nueva Tarea
                  </a>
                  
                  
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;