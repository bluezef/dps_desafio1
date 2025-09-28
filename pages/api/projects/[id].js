let projects = [
  {
    id: 1,
    title: "Desarrollo Web E-commerce",
    description: "Plataforma de ventas online con carrito de compras",
    status: "en-progreso",
    progress: 65,
    startDate: "2024-01-15",
    endDate: "2024-04-15",
    managerId: 1,
    members: [1, 2],
    createdAt: "2024-01-15T10:00:00Z"
  },
  {
    id: 2,
    title: "App Mobile Delivery",
    description: "Aplicación móvil para delivery de comida",
    status: "planificacion",
    progress: 25,
    startDate: "2024-02-01",
    endDate: "2024-06-01",
    managerId: 1,
    members: [2],
    createdAt: "2024-01-20T14:30:00Z"
  }
];

export default function handler(req, res) {
  const { query: { id }, method } = req;
  const projectId = parseInt(id);
  const projectIndex = projects.findIndex(p => p.id === projectId);

  switch (method) {
    case 'GET':
      const project = projects.find(p => p.id === projectId);
      if (project) {
        res.status(200).json(project);
      } else {
        res.status(404).json({ message: 'Project not found' });
      }
      break;
      
    case 'PUT':
      if (projectIndex > -1) {
        projects[projectIndex] = { ...projects[projectIndex], ...req.body };
        res.status(200).json(projects[projectIndex]);
      } else {
        res.status(404).json({ message: 'Project not found' });
      }
      break;
      
    case 'DELETE':
      if (projectIndex > -1) {
        const deletedProject = projects.splice(projectIndex, 1);
        res.status(200).json(deletedProject[0]);
      } else {
        res.status(404).json({ message: 'Project not found' });
      }
      break;
      
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}