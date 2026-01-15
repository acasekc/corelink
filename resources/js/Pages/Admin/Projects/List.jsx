import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit, Trash2, Plus, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/admin/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePublished = async (projectId, currentStatus) => {
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
      
      const response = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify({
          is_published: !currentStatus
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update project');
      }

      // Refresh the list
      fetchProjects();
    } catch (err) {
      alert('Error updating project: ' + err.message);
    }
  };

  const deleteProject = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
      
      const response = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': csrfToken,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      // Refresh the list
      fetchProjects();
    } catch (err) {
      alert('Error deleting project: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-slate-400 mt-1">Manage your portfolio projects</p>
        </div>
        <Link
          to="/admin/projects/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16">
          <div className="max-w-sm mx-auto">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No projects yet</h3>
            <p className="text-slate-400 mb-6">Get started by creating your first project.</p>
            <Link
              to="/admin/projects/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-4 px-6 text-sm font-medium text-slate-400 uppercase tracking-wide">
                    Project
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-slate-400 uppercase tracking-wide">
                    Category
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-slate-400 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-slate-400 uppercase tracking-wide">
                    Order
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-slate-400 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project, index) => (
                  <motion.tr
                    key={project.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-white">{project.title}</h3>
                          <p className="text-sm text-slate-400 mt-1 line-clamp-2">{project.description}</p>
                          {project.link && (
                            <a
                              href={project.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 mt-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              View Live
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-block px-2 py-1 rounded-md text-xs font-medium bg-slate-800 text-cyan-500 border border-slate-700">
                        {project.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => togglePublished(project.id, project.is_published)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                          project.is_published
                            ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {project.is_published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {project.is_published ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-slate-400">{project.order}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 justify-end">
                        <Link
                          to={`/admin/projects/${project.id}/edit`}
                          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors"
                          title="Edit project"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => deleteProject(project.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                          title="Delete project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}