let tasks = [
  {
    id: 1,
    title: "Diseño de Base de Datos",
    description: "Crear esquema y relaciones de la BD",
    status: "completado",
    priority: "alta",
    projectId: 1,
    assignedTo: 2,
    dueDate: "2024-02-01",
    createdAt: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    title: "Implementar Autenticación",
    description: "Sistema de login y registro",
    status: "en-progreso",
    priority: "alta",
    projectId: 1,
    assignedTo: 2,
    dueDate: "2024-02-15",
    createdAt: "2024-01-20T09:00:00Z"
  },
  {
    id: 3,
    title: "Investigación de Mercado",
    description: "Análisis de competencia y usuarios",
    status: "por-hacer",
    priority: "media",
    projectId: 2,
    assignedTo: 2,
    dueDate: "2024-02-10",
    createdAt: "2024-01-25T16:00:00Z"
  }
];

export default function handler(req, res) {
  const { query: { id }, method } = req;
  const taskId = parseInt(id);
  const taskIndex = tasks.findIndex(t => t.id === taskId);

  switch (method) {
    case 'GET':
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        res.status(200).json(task);
      } else {
        res.status(404).json({ message: 'Task not found' });
      }
      break;
      
    case 'PUT':
      if (taskIndex > -1) {
        tasks[taskIndex] = { ...tasks[taskIndex], ...req.body };
        res.status(200).json(tasks[taskIndex]);
      } else {
        res.status(404).json({ message: 'Task not found' });
      }
      break;
      
    case 'DELETE':
      if (taskIndex > -1) {
        const deletedTask = tasks.splice(taskIndex, 1);
        res.status(200).json(deletedTask[0]);
      } else {
        res.status(404).json({ message: 'Task not found' });
      }
      break;
      
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}