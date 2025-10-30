'use client';

import { useState } from 'react';
import { Survey } from '@/fhevm/fhevmTypes';
import { RatingInput } from './RatingInput';
import { useSurvey } from '@/hooks/useSurvey';

interface ParticipateModalProps {
  survey: Survey;
  onClose: () => void;
  onSuccess: () => void;
}

export function ParticipateModal({ survey, onClose, onSuccess }: ParticipateModalProps) {
  const { participateSurvey } = useSurvey();
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRatingChange = (rating: number) => {
    setSelectedRating(rating);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selectedRating) {
      setError('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await participateSurvey(survey.id, selectedRating);
      onSuccess();
    } catch (err) {
      console.error('Failed to participate in survey:', err);
      setError('Failed to submit your rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSurveyTypeLabel = (type: number) => {
    switch (type) {
      case 0: return 'Star Rating';
      case 1: return 'Score Rating';
      case 2: return 'Grade Rating';
      default: return 'Rating';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-card p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Participate in Survey</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Survey Info */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-2">{survey.title}</h3>
          <p className="text-slate-300 mb-4">{survey.description}</p>
          <div className="flex items-center space-x-4 text-sm text-slate-400">
            <span>Type: {getSurveyTypeLabel(survey.surveyType)}</span>
            <span>•</span>
            <span>Ends: {new Date(survey.endTime * 1000).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Rating Input */}
        <div className="mb-8">
          <RatingInput
            surveyType={survey.surveyType}
            onRatingChange={handleRatingChange}
            disabled={isSubmitting}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="glass-button"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedRating || isSubmitting}
            className="glass-button bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>

        {/* Privacy Notice */}
        <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
          <div className="flex items-start space-x-2">
            <span className="text-blue-400 text-lg">🔒</span>
            <div>
              <p className="text-blue-300 font-medium">Privacy Protected</p>
              <p className="text-blue-200 text-sm">
                Your rating is encrypted using FHEVM technology. Only the survey creator can decrypt the final results.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
