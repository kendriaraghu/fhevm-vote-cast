'use client';

// Removed Recharts imports as we no longer use charts
import { DecryptedSurveyStats } from '@/fhevm/fhevmTypes';

interface StatsChartProps {
  surveyId: number;
  surveyType: number;
  decryptedStats: DecryptedSurveyStats | null;
}

export function StatsChart({ surveyId, surveyType, decryptedStats }: StatsChartProps) {
  if (!decryptedStats) {
    return (
      <div className="glass-card p-6 text-center">
        <div className="text-yellow-400 mb-4">🔒 Statistics not decrypted yet</div>
        <p className="text-slate-300">Please decrypt the survey statistics first to view charts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-white">{decryptedStats.responseCount}</div>
          <div className="text-slate-400 text-sm">Total Responses</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-white">
            {decryptedStats.averageScore.toFixed(1)}
          </div>
          <div className="text-slate-400 text-sm">Average Score</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-white">
            {decryptedStats.responseCount > 0 ? '100%' : '0%'}
          </div>
          <div className="text-slate-400 text-sm">Completion Rate</div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 text-center">
          <h3 className="text-xl font-semibold text-white mb-4">Survey Summary</h3>
          <div className="space-y-4">
            <div>
              <div className="text-3xl font-bold text-purple-400">{decryptedStats.responseCount}</div>
              <div className="text-slate-400">Total Responses</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400">{decryptedStats.averageScore.toFixed(1)}</div>
              <div className="text-slate-400">Average Score</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400">{decryptedStats.totalScore}</div>
              <div className="text-slate-400">Total Score</div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Privacy Notice</h3>
          <div className="text-slate-300 space-y-2">
            <p>🔒 <strong>Individual responses are private</strong></p>
            <p>Due to FHEVM privacy protection, detailed response distributions cannot be displayed.</p>
            <p>Only aggregate statistics (totals and averages) are available to the survey creator.</p>
          </div>
        </div>
      </div>

      {/* Available Statistics */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Available Statistics</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
            <span className="text-slate-300">Total Responses</span>
            <span className="text-white font-bold">{decryptedStats.responseCount}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
            <span className="text-slate-300">Average Score</span>
            <span className="text-white font-bold">{decryptedStats.averageScore.toFixed(1)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
            <span className="text-slate-300">Total Score</span>
            <span className="text-white font-bold">{decryptedStats.totalScore}</span>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-blue-300 text-sm">
            📊 <strong>Note:</strong> Individual response distributions are not available due to privacy protection.
            Only aggregate statistics can be computed from encrypted data.
          </p>
        </div>
      </div>
    </div>
  );
}
