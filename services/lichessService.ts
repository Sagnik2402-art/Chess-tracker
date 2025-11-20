import { LichessProfile, RatingHistoryEntry } from '../types';

const BASE_URL = 'https://lichess.org/api';

export const fetchUserProfile = async (username: string): Promise<LichessProfile> => {
  try {
    const response = await fetch(`${BASE_URL}/user/${username}`);
    if (!response.ok) {
      if (response.status === 404) throw new Error('User not found');
      throw new Error('Failed to fetch user profile');
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

export const fetchRatingHistory = async (username: string): Promise<RatingHistoryEntry[]> => {
  try {
    const response = await fetch(`${BASE_URL}/user/${username}/rating-history`);
    if (!response.ok) {
      throw new Error('Failed to fetch rating history');
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching history:", error);
    throw error;
  }
};