'use client';

import { useState } from 'react';
import { Survey } from '@/fhevm/fhevmTypes';
import { formatDistanceToNow } from 'date-fns';

interface SurveyCardProps {
  survey: Survey;
  onParticipate?: (surveyId: number) => void;
  onViewStats?: (surveyId: number) => void;
  onStartSurvey?: (surveyId: number) => void;
  currentUserAddress?: string;
}

export function SurveyCard({ survey, onParticipate, onViewStats, onStartSurvey, currentUserAddress }: SurveyCardProps) {
  const [isParticipating, setIsParticipating] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const isCreator = currentUserAddress && survey.creator.toLowerCase() === currentUserAddress.toLowerCase();

  const getSurveyTypeLabel = (type: number) => {
    switch (type) {
      case 0: return '⭐ 1-5 Stars';
      case 1: return '🔢 1-10 Score';
      case 2: return '📝 A-F Grade';
      default: return 'Unknown';
    }
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 0: return { label: 'Draft', color: 'text-yellow-400' };
      case 1: return { label: 'Active', color: 'text-green-400' };
      case 2: return { label: 'Ended', color: 'text-red-400' };
      default: return { label: 'Unknown', color: 'text-gray-400' };
    }
  };

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 0: return '📝';
      case 1: return '🟢';
      case 2: return '🔴';
      default: return '❓';
    }
  };

  const isActive = survey.status === 1;
  const isEnded = survey.status === 2;
  const canParticipate = isActive && !isEnded;

  const handleParticipate = async () => {
    if (!canParticipate) return;

    setIsParticipating(true);
    try {
      if (onParticipate) {
        await onParticipate(survey.id);
      }
    } catch (error) {
      console.error('Failed to participate in survey:', error);
    } finally {
      setIsParticipating(false);
    }
  };

  const handleStartSurvey = async () => {
    if (!isCreator || survey.status !== 0) return;

    setIsStarting(true);
    try {
      if (onStartSurvey) {
        await onStartSurvey(survey.id);
      }
    } catch (error) {
      console.error('Failed to start survey:', error);
    } finally {
      setIsStarting(false);
    }
  };

  const status = getStatusLabel(survey.status);

  return (
    <div className="glass-card p-6 hover:bg-white/15 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
            {survey.title}
          </h3>
          <p className="text-slate-400 text-sm mb-3 line-clamp-2">
            {survey.description}
          </p>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <span className="text-2xl">{getStatusIcon(survey.status)}</span>
          <span className={`text-sm font-medium ${status.color}`}>
            {status.label}
          </span>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Type:</span>
          <span className="text-white">{getSurveyTypeLabel(survey.surveyType)}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Created:</span>
          <span className="text-white">
            {formatDistanceToNow(new Date(survey.startTime * 1000), { addSuffix: true })}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Ends:</span>
          <span className="text-white">
            {formatDistanceToNow(new Date(survey.endTime * 1000), { addSuffix: true })}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-400">
          Creator: {survey.creator.slice(0, 6)}...{survey.creator.slice(-4)}
        </div>
        
        <div className="flex space-x-2">
          {isCreator && survey.status === 0 && (
            <button
              onClick={handleStartSurvey}
              disabled={isStarting}
              className="glass-button text-sm disabled:opacity-50 bg-green-500/20 hover:bg-green-500/30"
            >
              {isStarting ? 'Starting...' : 'Start Survey'}
            </button>
          )}

          {canParticipate && (
            <button
              onClick={handleParticipate}
              disabled={isParticipating}
              className="glass-button text-sm disabled:opacity-50"
            >
              {isParticipating ? 'Participating...' : 'Participate'}
            </button>
          )}

          {onViewStats && survey.status !== 0 && (
            <button
              onClick={() => onViewStats(survey.id)}
              className="glass-button text-sm"
            >
              View Stats
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
