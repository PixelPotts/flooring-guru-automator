import React, { useState } from 'react';
import { Plus, Search, Filter, Calendar } from 'lucide-react';
import { Project } from '../types/project';
import ProjectModal from './projects/ProjectModal';
import ProjectCard from './projects/ProjectCard';

const Projects: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      title: 'Modern Living Spaces Renovation',
      clientId: '1',
      clientName: 'Sarah Johnson',
      status: 'in_progress',
      startDate: '2024-03-15',
      endDate: '2024-03-30',
      budget: 11394,
      progress: 35,
      estimateId: '1',
      tasks: [
        {
          id: '1',
          title: 'Floor preparation',
          status: 'completed',
          assignedTo: 'Mike Wilson',
          dueDate: '2024-03-18'
        },
        {
          id: '2',
          title: 'Hardwood installation',
          status: 'in_progress',
          assignedTo: 'John Smith',
          dueDate: '2024-03-25'
        },
        {
          id: '3',
          title: 'Final inspection',
          status: 'pending',
          assignedTo: 'Mike Wilson',
          dueDate: '2024-03-30'
        }
      ]
    }
  ]);

  const handleAddProject = (project: Omit<Project, 'id'>) => {
    const newProject = {
      ...project,
      id: (projects.length + 1).toString()
    };
    setProjects([...projects, newProject]);
    setIsModalOpen(false);
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(projects.map(proj => 
      proj.id === updatedProject.id ? updatedProject : proj
    ));
  };

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter(proj => proj.id !== id));
  };

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Project
        </button>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
          />
        </div>
        <button className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
          <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onUpdate={handleUpdateProject}
            onDelete={handleDeleteProject}
          />
        ))}
      </div>

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddProject}
      />
    </div>
  );
};

export default Projects;