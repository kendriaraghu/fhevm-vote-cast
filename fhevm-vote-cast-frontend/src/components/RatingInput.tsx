'use client';

import { useState } from 'react';

interface RatingInputProps {
  surveyType: number;
  onRatingChange: (rating: number) => void;
  disabled?: boolean;
}

export function RatingInput({ surveyType, onRatingChange, disabled = false }: RatingInputProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const handleRatingClick = (rating: number) => {
    if (disabled) return;
    setSelectedRating(rating);
    onRatingChange(rating);
  };

  const renderStarRating = () => {
    return (
      <div className="flex space-x-2">
        {[1, 2, 3, 4, 5].map((star) => {
          const isSelected = selectedRating && star <= selectedRating;

          return (
            <button
              key={star}
              onClick={() => handleRatingClick(star)}
              disabled={disabled}
              className={`relative text-4xl transition-all duration-300 transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 rounded ${
                isSelected
                  ? 'text-yellow-400 drop-shadow-lg animate-pulse'
                  : 'text-slate-400 hover:text-yellow-300'
              } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
              <span className="relative z-10 filter">
                {isSelected ? '⭐' : '☆'}
              </span>
              {isSelected && (
                <div className="absolute -inset-1 bg-yellow-400/20 rounded-full animate-ping"></div>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  const renderScoreRating = () => {
    return (
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
          <button
            key={score}
            onClick={() => handleRatingClick(score)}
            disabled={disabled}
            className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50 ${
              selectedRating === score
                ? 'bg-purple-500 text-white shadow-lg ring-2 ring-purple-400'
                : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
            } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            {score}
          </button>
        ))}
      </div>
    );
  };

  const renderGradeRating = () => {
    const grades = [
      { value: 6, label: 'A', color: 'text-green-400', bgColor: 'bg-green-500/20', ringColor: 'ring-green-400' },
      { value: 5, label: 'B', color: 'text-blue-400', bgColor: 'bg-blue-500/20', ringColor: 'ring-blue-400' },
      { value: 4, label: 'C', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', ringColor: 'ring-yellow-400' },
      { value: 3, label: 'D', color: 'text-orange-400', bgColor: 'bg-orange-500/20', ringColor: 'ring-orange-400' },
      { value: 1, label: 'F', color: 'text-red-400', bgColor: 'bg-red-500/20', ringColor: 'ring-red-400' },
    ];

    return (
      <div className="flex space-x-3">
        {grades.map((grade) => (
          <button
            key={grade.value}
            onClick={() => handleRatingClick(grade.value)}
            disabled={disabled}
            className={`px-4 py-3 rounded-lg font-bold text-2xl transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
              selectedRating === grade.value
                ? `${grade.bgColor} ring-2 ${grade.ringColor} shadow-lg`
                : 'bg-white/10 hover:bg-white/20'
            } ${grade.color} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            {grade.label}
          </button>
        ))}
      </div>
    );
  };

  const getTypeLabel = () => {
    switch (surveyType) {
      case 0: return 'Star Rating (1-5)';
      case 1: return 'Score Rating (1-10)';
      case 2: return 'Grade Rating (A-F)';
      default: return 'Rating';
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-2">
          {getTypeLabel()}
        </h3>
        {selectedRating && (
          <p className="text-slate-300">
            Selected: {surveyType === 2 ? ['F', 'D', 'C', 'B', 'A'][selectedRating - 1] : selectedRating}
          </p>
        )}
      </div>

      <div className="flex justify-center">
        {surveyType === 0 && renderStarRating()}
        {surveyType === 1 && renderScoreRating()}
        {surveyType === 2 && renderGradeRating()}
      </div>

      {selectedRating && (
        <div className="text-center">
          <button
            disabled={disabled}
            className="glass-button bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
          >
            Submit Rating
          </button>
        </div>
      )}
    </div>
  );
}
