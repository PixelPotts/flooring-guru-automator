import React, { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { Project } from '../types/project';
import ProjectModal from '../components/projects/ProjectModal';
import ProjectCard from '../components/projects/ProjectCard';

const Projects: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | Project['status']>('all');

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

  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage your ongoing and upcoming projects
          </p>
        </div>
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
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
          className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
        </select>
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

        {filteredProjects.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchQuery
                ? `No projects match your search "${searchQuery}"`
                : "No projects yet"}
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-5 w-5 inline-block mr-2" />
              Create First Project
            </button>
          </div>
        )}
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