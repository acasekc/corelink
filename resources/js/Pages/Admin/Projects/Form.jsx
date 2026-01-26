import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProjectForm({ project: propProject }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [project, setProject] = useState(propProject);
  const [isLoading, setIsLoading] = useState(!!id && !propProject);
  const isEditing = !!project || !!id;
  
  const [formData, setFormData] = useState({
    title: project?.title || '',
    category: project?.category || '',
    description: project?.description || '',
    features: project?.features || [''],
    tech_stack: project?.tech_stack || [''],
    link: project?.link || '',
    is_published: project?.is_published || false,
    order: project?.order || 1,
    screenshots: project?.screenshots || []
  });

  const [newScreenshots, setNewScreenshots] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch project data if editing and not provided as prop
  useEffect(() => {
    if (id && !propProject) {
      const fetchProject = async () => {
        try {
          const response = await fetch(`/projects/${id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch project');
          }
          const data = await response.json();
          setProject(data);
          
          // Update form data with fetched project
          setFormData({
            title: data.title || '',
            category: data.category || '',
            description: data.description || '',
            features: data.features || [''],
            tech_stack: data.tech_stack || [''],
            link: data.link || '',
            is_published: data.is_published || false,
            order: data.order || 1,
            screenshots: data.screenshots || []
          });
        } catch (err) {
          console.error('Error fetching project:', err);
          alert('Failed to load project data');
          navigate('/admin/projects');
        } finally {
          setIsLoading(false);
        }
      };
      fetchProject();
    }
  }, [id, propProject, navigate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleScreenshotUpload = (e) => {
    const files = Array.from(e.target.files);
    setNewScreenshots(prev => [...prev, ...files]);
  };

  const removeNewScreenshot = (index) => {
    setNewScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingScreenshot = (index) => {
    setFormData(prev => ({
      ...prev,
      screenshots: prev.screenshots.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    // Validate features (remove empty ones)
    const validFeatures = formData.features.filter(f => f.trim());
    if (validFeatures.length === 0) {
      newErrors.features = 'At least one feature is required';
    }

    // Validate tech stack (remove empty ones)
    const validTechStack = formData.tech_stack.filter(t => t.trim());
    if (validTechStack.length === 0) {
      newErrors.tech_stack = 'At least one technology is required';
    }

    if (formData.order < 1) {
      newErrors.order = 'Order must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      
      // Clean up arrays by removing empty values
      const cleanFormData = {
        ...formData,
        features: formData.features.filter(f => f.trim()),
        tech_stack: formData.tech_stack.filter(t => t.trim())
      };

      // Add form fields (excluding screenshots, we'll handle those separately)
      Object.keys(cleanFormData).forEach(key => {
        if (key === 'screenshots') {
          // Skip screenshots here, we'll add them separately
          return;
        }
        if (key === 'features' || key === 'tech_stack') {
          submitData.append(key, JSON.stringify(cleanFormData[key]));
        } else if (key === 'is_published') {
          // Convert boolean to 1 or 0 for Laravel
          submitData.append(key, cleanFormData[key] ? '1' : '0');
        } else {
          submitData.append(key, cleanFormData[key]);
        }
      });

      // Add existing screenshots (URLs from formData.screenshots)
      if (isEditing && formData.screenshots && formData.screenshots.length > 0) {
        submitData.append('existing_screenshots', JSON.stringify(formData.screenshots));
      }

      // Add new screenshots (files from newScreenshots)
      newScreenshots.forEach((file, index) => {
        submitData.append(`new_screenshots[${index}]`, file);
      });

      const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
      
      const projectId = id || project?.id;
      const url = isEditing ? `/projects/${projectId}` : '/projects';
      
      // Laravel can't handle true PUT with FormData, so use POST with _method
      if (isEditing) {
        submitData.append('_method', 'PUT');
      }
      
      console.log('Submitting to:', url);
      console.log('Is editing:', isEditing);
      console.log('Project ID:', projectId);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': csrfToken,
          'Accept': 'application/json',
        },
        body: submitData,
      });

      console.log('Response status:', response.status);
      console.log('Response content-type:', response.headers.get('content-type'));
      
      // Get response text first to see what we're getting
      const responseText = await response.text();
      console.log('Response preview:', responseText.substring(0, 200));
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          console.error('Failed to parse error response. Full response:', responseText);
          throw new Error(`Server error (${response.status}). Check console for details.`);
        }
        console.error('Error response:', errorData);
        throw new Error(errorData.message || 'Failed to save project');
      }

      const result = JSON.parse(responseText);
      console.log('Success:', result);

      // Redirect to projects list
      navigate('/admin/projects');
      
    } catch (err) {
      console.error('Submit error:', err);
      alert('Error saving project: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full"></div>
          <p className="ml-4 text-slate-400">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/projects')}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isEditing ? 'Edit Project' : 'Create Project'}
          </h1>
          <p className="text-slate-400 mt-1">
            {isEditing ? 'Update project information' : 'Add a new project to your portfolio'}
          </p>
        </div>
      </div>

      <div className="max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Project Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    errors.title ? 'border-red-500' : 'border-slate-600'
                  }`}
                  placeholder="Enter project title"
                />
                {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Category <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    errors.category ? 'border-red-500' : 'border-slate-600'
                  }`}
                  placeholder="e.g. Web Application, Mobile App"
                />
                {errors.category && <p className="mt-1 text-sm text-red-400">{errors.category}</p>}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none ${
                  errors.description ? 'border-red-500' : 'border-slate-600'
                }`}
                placeholder="Describe your project..."
              />
              {errors.description && <p className="mt-1 text-sm text-red-400">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Project Link
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => handleInputChange('link', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.order}
                  onChange={(e) => handleInputChange('order', parseInt(e.target.value))}
                  className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    errors.order ? 'border-red-500' : 'border-slate-600'
                  }`}
                />
                {errors.order && <p className="mt-1 text-sm text-red-400">{errors.order}</p>}
              </div>
            </div>

            <div className="mt-6">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => handleInputChange('is_published', e.target.checked)}
                  className="w-4 h-4 bg-slate-800 border border-slate-600 rounded focus:ring-2 focus:ring-cyan-500 text-cyan-500"
                />
                <span className="text-sm font-medium text-slate-400">Publish this project</span>
              </label>
            </div>
          </div>

          {/* Features */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Features</h3>
            
            <div className="space-y-3">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleArrayChange('features', index, e.target.value)}
                    className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Enter a feature"
                  />
                  {formData.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('features', index)}
                      className="p-3 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => addArrayItem('features')}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Feature
            </button>

            {errors.features && <p className="mt-2 text-sm text-red-400">{errors.features}</p>}
          </div>

          {/* Tech Stack */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Tech Stack</h3>
            
            <div className="space-y-3">
              {formData.tech_stack.map((tech, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    value={tech}
                    onChange={(e) => handleArrayChange('tech_stack', index, e.target.value)}
                    className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="e.g. React, Laravel, MySQL"
                  />
                  {formData.tech_stack.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('tech_stack', index)}
                      className="p-3 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => addArrayItem('tech_stack')}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Technology
            </button>

            {errors.tech_stack && <p className="mt-2 text-sm text-red-400">{errors.tech_stack}</p>}
          </div>

          {/* Screenshots */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Screenshots</h3>
            
            {/* Existing Screenshots */}
            {formData.screenshots.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-400 mb-3">Current Screenshots</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {formData.screenshots.map((screenshot, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={screenshot}
                        alt={`Screenshot ${index + 1}`}
                        className="w-full aspect-video object-cover rounded-lg border border-slate-600"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingScreenshot(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Screenshots */}
            {newScreenshots.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-400 mb-3">New Screenshots</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {newScreenshots.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`New screenshot ${index + 1}`}
                        className="w-full aspect-video object-cover rounded-lg border border-slate-600"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewScreenshot(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Input */}
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-slate-500 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-400 mb-3">
                Drag and drop screenshots here, or click to select
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleScreenshotUpload}
                className="hidden"
                id="screenshot-upload"
              />
              <label
                htmlFor="screenshot-upload"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4" />
                Choose Files
              </label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center gap-4 pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isSubmitting
                  ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  : 'bg-cyan-500 hover:bg-cyan-600 text-white'
              }`}
            >
              {isSubmitting ? 'Saving...' : (isEditing ? 'Update Project' : 'Create Project')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/projects')}
              className="px-6 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}