import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        const { data: projects, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        res.status(200).json(projects);
        break;
        
      case 'POST':
        const projectData = {
          ...req.body,
          start_date: req.body.startDate,
          end_date: req.body.endDate,
          manager_id: req.body.managerId
        };
        
        delete projectData.startDate;
        delete projectData.endDate;
        delete projectData.managerId;
        
        const { data: newProject, error: createError } = await supabase
          .from('projects')
          .insert([projectData])
          .select()
          .single();
        
        if (createError) throw createError;
        
        const formattedProject = {
          ...newProject,
          startDate: newProject.start_date,
          endDate: newProject.end_date,
          managerId: newProject.manager_id,
          createdAt: newProject.created_at
        };
        
        res.status(201).json(formattedProject);
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