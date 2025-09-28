let users = [
  {
    id: 1,
    email: "gerente@test.com",
    password: "123456",
    name: "Ernesto González",
    role: "gerente",
    avatar: "EG"
  },
  {
    id: 2,
    email: "usuario@test.com",
    password: "123456",
    name: "José Pérez",
    role: "usuario",
    avatar: "JP"
  }
];

export default function handler(req, res) {
  const { query: { id }, method } = req;
  const userId = parseInt(id);
  const userIndex = users.findIndex(u => u.id === userId);

  switch (method) {
    case 'GET':
      const user = users.find(u => u.id === userId);
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
      break;
      
    case 'PUT':
      if (userIndex > -1) {
        users[userIndex] = { ...users[userIndex], ...req.body };
        res.status(200).json(users[userIndex]);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
      break;
      
    case 'DELETE':
      if (userIndex > -1) {
        const deletedUser = users.splice(userIndex, 1);
        res.status(200).json(deletedUser[0]);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
      break;
      
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}