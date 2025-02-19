export interface ProjectTask {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  assignedTo: string;
  dueDate: string;
}

export interface Project {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'on_hold';
  startDate: string;
  endDate: string;
  budget: number;
  progress: number;
  tasks: ProjectTask[];
  estimateId: string;
}