import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  const { method, query } = req;

  try {
    switch (method) {
      case 'GET':
        let supabaseQuery = supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (query.projectId) {
          supabaseQuery = supabaseQuery.eq('project_id', query.projectId);
        }
        
        const { data: tasks, error } = await supabaseQuery;
        
        if (error) throw error;
        
        const formattedTasks = tasks.map(task => ({
          ...task,
          projectId: task.project_id,
          assignedTo: task.assigned_to,
          dueDate: task.due_date,
          createdAt: task.created_at
        }));
        
        res.status(200).json(formattedTasks);
        break;
        
      case 'POST':
        const taskData = {
          ...req.body,
          project_id: req.body.projectId,
          assigned_to: req.body.assignedTo,
          due_date: req.body.dueDate
        };
        
        delete taskData.projectId;
        delete taskData.assignedTo;
        delete taskData.dueDate;
        
        const { data: newTask, error: createError } = await supabase
          .from('tasks')
          .insert([taskData])
          .select()
          .single();
        
        if (createError) throw createError;
        
        const formattedTask = {
          ...newTask,
          projectId: newTask.project_id,
          assignedTo: newTask.assigned_to,
          dueDate: newTask.due_date,
          createdAt: newTask.created_at
        };
        
        res.status(201).json(formattedTask);
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