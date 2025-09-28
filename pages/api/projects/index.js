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
  const { method } = req;

  switch (method) {
    case 'GET':
      res.status(200).json(projects);
      break;
      
    case 'POST':
      const newProject = {
        id: Date.now(),
        ...req.body
      };
      projects.push(newProject);
      res.status(201).json(newProject);
      break;
      
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}