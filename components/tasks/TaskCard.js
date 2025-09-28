import React from 'react';
import { Calendar, Flag, User, Clock, Edit } from 'lucide-react';

const TaskCard = ({ task, users = [], onClick }) => {
  const getPriorityColor = (priority) => {
    const colors = {
      'alta': 'text-red-600 bg-red-100',
      'media': 'text-yellow-600 bg-yellow-100',
      'baja': 'text-green-600 bg-green-100'
    };
    return colors[priority] || 'text-gray-600 bg-gray-100';
  };

  const getStatusColor = (status) => {
    const colors = {
      'por-hacer': 'bg-gray-100 text-gray-800',
      'en-progreso': 'bg-blue-100 text-blue-800',
      'revision': 'bg-purple-100 text-purple-800',
      'completado': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      'por-hacer': 'Por Hacer',
      'en-progreso': 'En Progreso',
      'revision': 'En Revisión',
      'completado': 'Completado'
    };
    return texts[status] || status;
  };

  const assignedUser = users.find(user => parseInt(user.id) === parseInt(task.assignedTo));

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completado';

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-all cursor-pointer group ${
        isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority).split(' ')[1]}`} />
          <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(task.status)}`}>
            {getStatusText(task.status)}
          </span>
        </div>
        <div className={`flex items-center px-2 py-1 rounded-md text-xs ${getPriorityColor(task.priority)}`}>
          <Flag className="h-3 w-3 mr-1" />
          {task.priority}
        </div>
      </div>

      <h4 className="font-medium text-gray-900 mb-2">
        {task.title}
      </h4>

      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
        {task.description}
      </p>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
              {formatDate(task.dueDate)}
            </span>
          </div>
          {assignedUser && (
            <div className="flex items-center text-gray-500">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2">
                {assignedUser.avatar || assignedUser.name?.charAt(0)}
              </div>
              <span className="text-xs truncate max-w-20">{assignedUser.name}</span>
            </div>
          )}
        </div>

        {isOverdue && (
          <div className="flex items-center text-red-600 text-xs">
            <Clock className="h-3 w-3 mr-1" />
            Vencida
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-400">
            Click para {task.status === 'completado' ? 'ver detalles' : 'actualizar'}
          </div>
          <Edit className="h-3 w-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
        </div>
      </div>
    </div>
  );
};

export default TaskCard;