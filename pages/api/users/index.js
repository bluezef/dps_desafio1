import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        const { data: users, error } = await supabase
          .from('users')
          .select('*')
          .order('id');
        
        if (error) throw error;
        res.status(200).json(users);
        break;
        
      case 'POST':
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([{
            ...req.body,
            avatar: req.body.name ? req.body.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'
          }])
          .select()
          .single();
        
        if (createError) throw createError;
        res.status(201).json(newUser);
        break;
        
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
}