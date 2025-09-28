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
  const { method } = req;

  switch (method) {
    case 'GET':
      res.status(200).json(users);
      break;
      
    case 'POST':
      const newUser = {
        id: Date.now(),
        ...req.body
      };
      users.push(newUser);
      res.status(201).json(newUser);
      break;
      
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}