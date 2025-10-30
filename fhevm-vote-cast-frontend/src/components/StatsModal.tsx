'use client';

import { useState, useEffect } from 'react';
import { Survey, DecryptedSurveyStats } from '@/fhevm/fhevmTypes';
import { StatsChart } from './StatsChart';
import { useSurvey } from '@/hooks/useSurvey';

interface StatsModalProps {
  survey: Survey;
  onClose: () => void;
}

export function StatsModal({ survey, onClose }: StatsModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'raw'>('overview');
  const [decryptedStats, setDecryptedStats] = useState<DecryptedSurveyStats | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptionError, setDecryptionError] = useState<string | null>(null);

  const { decryptSurveyStats } = useSurvey();

  const handleDecryptStats = async () => {
    console.log('StatsModal handleDecryptStats called for survey:', survey.id, survey.title);
    setIsDecrypting(true);
    setDecryptionError(null);

    try {
      const result = await decryptSurveyStats(survey.id);
      console.log('Decrypt result for survey', survey.id, ':', result);
      if (result) {
        setDecryptedStats(result);
        console.log('Set decryptedStats:', result);
      } else {
        setDecryptionError('Failed to decrypt survey statistics');
      }
    } catch (error) {
      console.error('Failed to decrypt stats:', error);
      setDecryptionError(error instanceof Error ? error.message : 'Failed to decrypt survey statistics');
    } finally {
      setIsDecrypting(false);
    }
  };

  const getSurveyTypeLabel = (type: number) => {
    switch (type) {
      case 0: return 'Star Rating (1-5)';
      case 1: return 'Score Rating (1-10)';
      case 2: return 'Grade Rating (A-F)';
      default: return 'Rating';
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

  const status = getStatusLabel(survey.status);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-card p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">{survey.title}</h2>
            <p className="text-slate-400">Survey Statistics & Analytics</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Survey Info Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-4">
            <div className="text-sm text-slate-400 mb-1">Survey Type</div>
            <div className="text-white font-medium">{getSurveyTypeLabel(survey.surveyType)}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-sm text-slate-400 mb-1">Status</div>
            <div className={`font-medium ${status.color}`}>{status.label}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-sm text-slate-400 mb-1">End Time</div>
            <div className="text-white font-medium">
              {new Date(survey.endTime * 1000).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Decryption Section */}
        {survey.status !== 0 && (
          <div className="glass-card p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {decryptedStats ? 'Survey Statistics (Decrypted)' : 'Decrypt Survey Statistics'}
                </h3>
                <p className="text-slate-300 text-sm">
                  {decryptedStats
                    ? 'Statistics have been successfully decrypted and are visible below.'
                    : 'Click the button to decrypt and view the survey statistics using FHEVM.'
                  }
                </p>
              </div>
              {!decryptedStats && (
                <button
                  onClick={handleDecryptStats}
                  disabled={isDecrypting}
                  className="glass-button bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
                >
                  {isDecrypting ? 'Decrypting...' : 'Decrypt Stats'}
                </button>
              )}
            </div>

            {decryptionError && (
              <div className="mt-4 bg-red-500/20 border border-red-500/50 text-red-300 p-3 rounded-lg">
                {decryptionError}
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-white/10 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-white/20 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'charts'
                ? 'bg-white/20 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Charts
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'raw'
                ? 'bg-white/20 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Raw Data
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-card p-6 text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {decryptedStats ? decryptedStats.responseCount : (survey.status === 0 ? 'Draft' : 'Encrypted')}
                </div>
                <div className="text-slate-400 text-sm">Total Responses</div>
                {!decryptedStats && survey.status !== 0 && (
                  <div className="text-xs text-yellow-400 mt-1">🔒 Encrypted</div>
                )}
              </div>
              <div className="glass-card p-6 text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {decryptedStats ? decryptedStats.averageScore.toFixed(1) : (survey.status === 0 ? '-' : 'Encrypted')}
                </div>
                <div className="text-slate-400 text-sm">Average Score</div>
                {!decryptedStats && survey.status !== 0 && (
                  <div className="text-xs text-yellow-400 mt-1">🔒 Encrypted</div>
                )}
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Survey Description</h3>
              <p className="text-slate-300">{survey.description}</p>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Creator Information</h3>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {survey.creator.slice(2, 4).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="text-white font-medium">
                    {survey.creator.slice(0, 6)}...{survey.creator.slice(-4)}
                  </div>
                  <div className="text-slate-400 text-sm">Survey Creator</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'charts' && (
          <StatsChart
            surveyId={survey.id}
            surveyType={survey.surveyType}
            decryptedStats={decryptedStats}
          />
        )}

        {activeTab === 'raw' && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Encrypted Data</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-slate-400 mb-2">Total Responses Handle</div>
                  <div className="font-mono text-sm bg-slate-800 p-3 rounded break-all">
                    {survey.totalResponses || 'Not available'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-2">Average Score Handle</div>
                  <div className="font-mono text-sm bg-slate-800 p-3 rounded break-all">
                    {survey.averageScore || 'Not available'}
                  </div>
                </div>
                {decryptedStats && (
                  <>
                    <div>
                      <div className="text-sm text-slate-400 mb-2">Decrypted Total Responses</div>
                      <div className="font-mono text-sm bg-green-900/30 border border-green-500/30 p-3 rounded">
                        {decryptedStats.responseCount}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-400 mb-2">Decrypted Average Score</div>
                      <div className="font-mono text-sm bg-green-900/30 border border-green-500/30 p-3 rounded">
                        {decryptedStats.averageScore}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-400 mb-2">Decrypted Total Score</div>
                      <div className="font-mono text-sm bg-green-900/30 border border-green-500/30 p-3 rounded">
                        {decryptedStats.totalScore}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Decryption Notice</h3>
              <div className="flex items-start space-x-3">
                <span className="text-yellow-400 text-xl">⚠️</span>
                <div>
                  <p className="text-yellow-300 font-medium mb-2">Encrypted Data</p>
                  <p className="text-slate-300 text-sm">
                    The data above is encrypted using FHEVM technology. Only the survey creator can decrypt 
                    and view the actual response counts and average scores. This ensures complete privacy 
                    for all participants while still allowing statistical analysis.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
