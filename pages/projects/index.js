import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import ProjectCard from '../../components/projects/ProjectCard';
import { useAuth } from '../../context/AuthContext';
import { projectsAPI } from '../../lib/api';
import { 
  Plus, 
  Search, 
  Filter,
  FolderOpen 
} from 'lucide-react';

const Projects = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [filteredProjects, setFilteredProjects] = useState([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/auth/login';
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadProjects();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, statusFilter]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.getAll();
      
      const userProjects = user.role === 'gerente' 
        ? response.data 
        : response.data.filter(p => p.members?.includes(user.id));

      setProjects(userProjects);
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'todos') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    setFilteredProjects(filtered);
  };

  const handleProjectClick = (project) => {
  window.location.href = `/projects/${project.id}`;
};

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <Layout title="Proyectos">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Proyectos</h1>
            <p className="text-gray-600 mt-1">
              Gestiona todos tus proyectos desde aquí
            </p>
          </div>
          {user?.role === 'gerente' && (
            <a
              href="/projects/create"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Proyecto
            </a>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar proyectos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full pl-10 pr-8 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="todos">Todos los estados</option>
                <option value="planificacion">Planificación</option>
                <option value="en-progreso">En Progreso</option>
                <option value="completado">Completado</option>
                <option value="pausado">Pausado</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => handleProjectClick(project)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FolderOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'todos' 
                ? 'No se encontraron proyectos' 
                : 'No tienes proyectos aún'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'todos'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza creando tu primer proyecto'
              }
            </p>
            {user?.role === 'gerente' && !searchTerm && statusFilter === 'todos' && (
              <a
                href="/projects/create"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Proyecto
              </a>
            )}
          </div>
        )}

        {projects.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Resumen de Proyectos
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {projects.length}
                </div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {projects.filter(p => p.status === 'en-progreso').length}
                </div>
                <div className="text-sm text-gray-500">En Progreso</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {projects.filter(p => p.status === 'completado').length}
                </div>
                <div className="text-sm text-gray-500">Completados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length) || 0}%
                </div>
                <div className="text-sm text-gray-500">Progreso Promedio</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Projects;