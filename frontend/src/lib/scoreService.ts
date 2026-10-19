// =============================================================
// PIP.EXE — Score Service
// Handles persisting Sakura Drift scores to the backend database
// with graceful offline fallback.
// =============================================================

import { apiRequest } from './api';

export interface ScoreRecord {
  id: string;
  nickname?: string;
  score: number;
  laps?: number;
  created_at: string;
}

export interface ScoreResponse {
  top_scores: ScoreRecord[];
  total_plays: number;
}

/**
 * Submit a Sakura Drift score to the backend database.
 */
export async function submitDriftScore(score: number, nickname?: string, laps?: number) {
  try {
    const res = await apiRequest<{ success: boolean; best: number }>('/scores', {
      method: 'POST',
      body: {
        score: Math.floor(score),
        nickname: nickname?.trim() || undefined,
        laps: laps ?? 1,
      },
    });
    return res;
  } catch {
    return { success: false };
  }
}

/**
 * Fetch top scores from the backend.
 */
export async function fetchTopDriftScores(limit = 10) {
  try {
    const res = await apiRequest<ScoreResponse>(`/scores?limit=${limit}`);
    return res;
  } catch {
    return { success: false };
  }
}
