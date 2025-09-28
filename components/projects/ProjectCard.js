import React from 'react';
import { Calendar, Users, BarChart3, Clock } from 'lucide-react';

const ProjectCard = ({ project, onClick }) => {
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

  const handleClick = () => {
    if (onClick) {
      onClick(project);
    } else {
      window.location.href = `/projects/${project.id}`;
    }
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {project.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2">
            {project.description}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(project.status)}`}>
          {getStatusText(project.status)}
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-500">Progreso</span>
            <span className="text-sm font-medium text-gray-900">{project.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center text-gray-500">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{formatDate(project.endDate)}</span>
          </div>
          <div className="flex items-center text-gray-500">
            <Users className="h-4 w-4 mr-2" />
            <span>{project.members?.length || 0} miembros</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center text-gray-500 text-sm">
            <Clock className="h-4 w-4 mr-1" />
            <span>
              {new Date(project.createdAt).toLocaleDateString('es-ES')}
            </span>
          </div>
          <span className="text-blue-600 hover:text-blue-700 text-sm font-medium group-hover:underline">
            Ver detalles →
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;