import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  const { query: { id }, method } = req;

  try {
    switch (method) {
      case 'GET':
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        res.status(200).json(user);
        break;
        
      case 'PUT':
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update(req.body)
          .eq('id', id)
          .select()
          .single();
        
        if (updateError) throw updateError;
        res.status(200).json(updatedUser);
        break;
        
      case 'DELETE':
        const { data: deletedUser, error: deleteError } = await supabase
          .from('users')
          .delete()
          .eq('id', id)
          .select()
          .single();
        
        if (deleteError) throw deleteError;
        res.status(200).json(deletedUser);
        break;
        
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
}