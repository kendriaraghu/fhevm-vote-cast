'use client';

import { useState } from 'react';
import { useSurvey } from '@/hooks/useSurvey';

interface CreateSurveyModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateSurveyModal({ onClose, onSuccess }: CreateSurveyModalProps) {
  const { createSurvey, isCreating } = useSurvey();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    surveyType: 0, // STAR_5
    startTime: '',
    endTime: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.startTime || !formData.endTime) {
      alert('Please fill in all fields');
      return;
    }

    const startTime = Math.floor(new Date(formData.startTime).getTime() / 1000);
    const endTime = Math.floor(new Date(formData.endTime).getTime() / 1000);

    if (endTime <= startTime) {
      alert('End time must be after start time');
      return;
    }

    try {
      await createSurvey({
        title: formData.title,
        description: formData.description,
        surveyType: formData.surveyType,
        startTime,
        endTime,
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to create survey:', error);
      alert('Failed to create survey. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'surveyType' ? parseInt(value) : value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-card p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Create New Survey</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Survey Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="glass-input w-full"
              placeholder="Enter survey title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="glass-input w-full h-24 resize-none"
              placeholder="Describe your survey"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Survey Type
            </label>
            <select
              name="surveyType"
              value={formData.surveyType}
              onChange={handleChange}
              className="glass-input w-full"
            >
              <option value={0}>⭐ 1-5 Star Rating</option>
              <option value={1}>🔢 1-10 Score Rating</option>
              <option value={2}>📝 A-F Grade Rating</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Start Time
              </label>
              <input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="glass-input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                End Time
              </label>
              <input
                type="datetime-local"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="glass-input w-full"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="glass-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="glass-button bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Create Survey'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

