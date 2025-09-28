import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  const { query: { id }, method } = req;

  try {
    switch (method) {
      case 'GET':
        const { data: project, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        const formattedProject = {
          ...project,
          startDate: project.start_date,
          endDate: project.end_date,
          managerId: project.manager_id,
        };
        
        res.status(200).json(formattedProject);
        break;
        
      case 'PUT':
        const updateData = {
          ...req.body,
          start_date: req.body.startDate,
          end_date: req.body.endDate,
          manager_id: req.body.managerId
        };
        
        delete updateData.startDate;
        delete updateData.endDate;
        delete updateData.managerId;
        delete updateData.createdAt;
        
        const { data: updatedProject, error: updateError } = await supabase
          .from('projects')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
        
        if (updateError) throw updateError;
        
        const formattedUpdated = {
          ...updatedProject,
          startDate: updatedProject.start_date,
          endDate: updatedProject.end_date,
          managerId: updatedProject.manager_id,
        };
        
        res.status(200).json(formattedUpdated);
        break;
        
      case 'DELETE':
        await supabase
          .from('tasks')
          .delete()
          .eq('project_id', id);
        
        const { data: deletedProject, error: deleteError } = await supabase
          .from('projects')
          .delete()
          .eq('id', id)
          .select()
          .single();
        
        if (deleteError) throw deleteError;
        res.status(200).json(deletedProject);
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