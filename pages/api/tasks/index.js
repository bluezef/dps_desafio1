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
  const { method, query } = req;

  switch (method) {
    case 'GET':
      let filteredTasks = tasks;
      
      // Filtrar por projectId si se proporciona
      if (query.projectId) {
        filteredTasks = tasks.filter(t => t.projectId === parseInt(query.projectId));
      }
      
      res.status(200).json(filteredTasks);
      break;
      
    case 'POST':
      const newTask = {
        id: Date.now(),
        ...req.body
      };
      tasks.push(newTask);
      res.status(201).json(newTask);
      break;
      
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}