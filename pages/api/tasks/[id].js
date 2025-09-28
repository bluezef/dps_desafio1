import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  const { query: { id }, method } = req;

  try {
    switch (method) {
      case 'GET':
        const { data: task, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        const formattedTask = {
          ...task,
          projectId: task.project_id,
          assignedTo: task.assigned_to,
          dueDate: task.due_date,
          createdAt: task.created_at
        };
        
        res.status(200).json(formattedTask);
        break;
        
      case 'PUT':
        const updateData = {
          ...req.body,
          project_id: req.body.projectId,
          assigned_to: req.body.assignedTo,
          due_date: req.body.dueDate
        };
        
        delete updateData.projectId;
        delete updateData.assignedTo;
        delete updateData.dueDate;
        delete updateData.createdAt;
        
        const { data: updatedTask, error: updateError } = await supabase
          .from('tasks')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
        
        if (updateError) throw updateError;
        
        const formattedUpdated = {
          ...updatedTask,
          projectId: updatedTask.project_id,
          assignedTo: updatedTask.assigned_to,
          dueDate: updatedTask.due_date,
          createdAt: updatedTask.created_at
        };
        
        res.status(200).json(formattedUpdated);
        break;
        
      case 'DELETE':
        const { data: deletedTask, error: deleteError } = await supabase
          .from('tasks')
          .delete()
          .eq('id', id)
          .select()
          .single();
        
        if (deleteError) throw deleteError;
        res.status(200).json(deletedTask);
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