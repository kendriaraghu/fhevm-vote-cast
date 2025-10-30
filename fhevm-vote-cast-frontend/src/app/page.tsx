'use client';

import { useState, useEffect } from 'react';
import { WalletConnect } from '@/components/WalletConnect';
import { SurveyCard } from '@/components/SurveyCard';
import { CreateSurveyModal } from '@/components/CreateSurveyModal';
import { ParticipateModal } from '@/components/ParticipateModal';
import { StatsModal } from '@/components/StatsModal';
import { useFhevm } from '@/hooks/useFhevm';
import { useSurvey } from '@/hooks/useSurvey';
import { Survey } from '@/fhevm/fhevmTypes';
import { designTokens } from '@/design-tokens';

export default function HomePage() {
  const { isConnected, address, chainId } = useFhevm();
  const { surveys, loading, refreshSurveys, startSurvey } = useSurvey();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showParticipateModal, setShowParticipateModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);

  useEffect(() => {
    if (isConnected) {
      refreshSurveys();
    }
  }, [isConnected, refreshSurveys]);

  const handleParticipate = (surveyId: number) => {
    const survey = surveys.find(s => s.id === surveyId);
    if (survey) {
      setSelectedSurvey(survey);
      setShowParticipateModal(true);
    }
  };

  const handleViewStats = (surveyId: number) => {
    const survey = surveys.find(s => s.id === surveyId);
    if (survey) {
      setSelectedSurvey(survey);
      setShowStatsModal(true);
    }
  };

  const handleStartSurvey = async (surveyId: number) => {
    try {
      await startSurvey(surveyId);
      refreshSurveys();
    } catch (error) {
      console.error('Failed to start survey:', error);
      alert('Failed to start survey. Please try again.');
    }
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setShowParticipateModal(false);
    setShowStatsModal(false);
    setSelectedSurvey(null);
  };

  const handleSuccess = () => {
    handleModalClose();
    refreshSurveys();
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-card p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-white">F</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">FHEVoteCast</h1>
              <p className="text-slate-400">Privacy-Preserving Survey Platform</p>
            </div>
          </div>
          <WalletConnect />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4">
        {!isConnected ? (
          // Welcome Section
          <div className="text-center py-20">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-6xl font-bold gradient-text mb-6 animate-fade-in">
                Privacy-First Surveys
              </h2>
              <p className="text-xl text-slate-300 mb-8 animate-fade-in">
                Create and participate in surveys with fully homomorphic encryption.
                Your data stays private while enabling powerful analytics.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <div className="glass-card p-6 max-w-sm animate-float">
                  <div className="text-4xl mb-4">🔐</div>
                  <h3 className="text-xl font-semibold mb-2">Fully Encrypted</h3>
                  <p className="text-slate-400">
                    All survey data is encrypted using FHEVM technology
                  </p>
                </div>
                <div className="glass-card p-6 max-w-sm animate-float-delayed">
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold mb-2">Smart Analytics</h3>
                  <p className="text-slate-400">
                    Get insights from encrypted data without compromising privacy
                  </p>
                </div>
                <div className="glass-card p-6 max-w-sm animate-float">
                  <div className="text-4xl mb-4">🌐</div>
                  <h3 className="text-xl font-semibold mb-2">Decentralized</h3>
                  <p className="text-slate-400">
                    Built on blockchain for transparency and trust
                  </p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-slate-400 mb-4">
                  Connect your wallet to get started
                </p>
                <WalletConnect />
              </div>
            </div>
          </div>
        ) : (
          // Dashboard
          <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Surveys</p>
                    <p className="text-3xl font-bold text-white">{surveys.length}</p>
                  </div>
                  <div className="text-4xl">📋</div>
                </div>
              </div>
              <div className="glass-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Active Surveys</p>
                    <p className="text-3xl font-bold text-white">
                      {surveys.filter(s => s.status === 1).length}
                    </p>
                  </div>
                  <div className="text-4xl">🟢</div>
                </div>
              </div>
              <div className="glass-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">My Surveys</p>
                    <p className="text-3xl font-bold text-white">
                      {surveys.filter(s => s.creator.toLowerCase() === address?.toLowerCase()).length}
                    </p>
                  </div>
                  <div className="text-4xl">👤</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="glass-button flex items-center space-x-2"
              >
                <span>+</span>
                <span>Create Survey</span>
              </button>
              <button
                onClick={refreshSurveys}
                disabled={loading}
                className="glass-button flex items-center space-x-2 disabled:opacity-50"
              >
                <span>🔄</span>
                <span>{loading ? 'Loading...' : 'Refresh'}</span>
              </button>
            </div>

            {/* Surveys Grid */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Recent Surveys</h2>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="glass-card p-6 animate-pulse">
                      <div className="h-4 bg-white/20 rounded mb-4"></div>
                      <div className="h-3 bg-white/20 rounded mb-2"></div>
                      <div className="h-3 bg-white/20 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : surveys.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-white mb-2">No surveys yet</h3>
                  <p className="text-slate-400 mb-6">
                    Create your first survey to get started
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="glass-button"
                  >
                    Create Survey
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {surveys.map((survey) => (
                    <SurveyCard
                      key={survey.id}
                      survey={survey}
                      onParticipate={handleParticipate}
                      onViewStats={handleViewStats}
                      onStartSurvey={handleStartSurvey}
                      currentUserAddress={address || undefined}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showCreateModal && (
        <CreateSurveyModal
          onClose={handleModalClose}
          onSuccess={handleSuccess}
        />
      )}

      {showParticipateModal && selectedSurvey && (
        <ParticipateModal
          survey={selectedSurvey}
          onClose={handleModalClose}
          onSuccess={handleSuccess}
        />
      )}

      {showStatsModal && selectedSurvey && (
        <StatsModal
          survey={selectedSurvey}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
