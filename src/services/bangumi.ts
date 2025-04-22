import { Data, SeasonList } from '../types/bangumi';

// Base API URL - can be configured via environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://bangumi-api.example.com';

// Error class for API-related errors
export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Helper function to make API requests with proper error handling
 */
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    if (!response.ok) {
      throw new ApiError(
        `API request failed: ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // If it's a network error or other type of error
    throw new ApiError(
      `API request failed: ${error instanceof Error ? error.message : String(error)}`,
      0
    );
  }
}

/**
 * Validates that the data conforms to the expected Data interface
 */
function validateBangumiData(data: unknown): data is Data {
  if (!data || typeof data !== 'object') {
    return false;
  }
  
  const dataObj = data as Record<string, unknown>;
  
  // Check for required properties
  if (!('items' in dataObj) || !Array.isArray(dataObj.items)) {
    return false;
  }
  
  if (!('siteMeta' in dataObj) || typeof dataObj.siteMeta !== 'object' || dataObj.siteMeta === null) {
    return false;
  }
  
  // We could add more detailed validation of each item here
  
  return true;
}

/**
 * Validates that the data conforms to the expected SeasonList interface
 */
function validateSeasonList(data: unknown): data is SeasonList {
  if (!data || typeof data !== 'object') {
    return false;
  }
  
  const dataObj = data as Record<string, unknown>;
  
  // Check for required properties
  if (!('items' in dataObj) || !Array.isArray(dataObj.items)) {
    return false;
  }
  
  if (!('version' in dataObj) || typeof dataObj.version !== 'number') {
    return false;
  }
  
  // Check that all items are strings
  if (!dataObj.items.every(item => typeof item === 'string')) {
    return false;
  }
  
  return true;
}

/**
 * BangumiAPI service provides methods to interact with the bangumi API
 */
export const BangumiAPI = {
  /**
   * Fetches the list of available seasons
   */
  async getSeasons(): Promise<SeasonList> {
    try {
      const data = await fetchApi<unknown>('/seasons');
      
      if (!validateSeasonList(data)) {
        throw new Error('Invalid season list data returned from API');
      }
      
      return data;
    } catch (error) {
      console.error('Failed to fetch seasons:', error);
      throw error;
    }
  },
  
  /**
   * Fetches bangumi data for a specific season
   * @param season - The season identifier (e.g., "2025-04")
   */
  async getBangumiData(season: string): Promise<Data> {
    try {
      // For development/testing, we can detect if we're in a dev environment
      // and return mock data instead of making an actual API call
      if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        // In real implementation, we would import mock data
        console.log('Using mock data for season', season);
        return this.getMockData(season);
      }
      
      const data = await fetchApi<unknown>(`/bangumi/${season}`);
      
      if (!validateBangumiData(data)) {
        throw new Error('Invalid bangumi data returned from API');
      }
      
      return data;
    } catch (error) {
      console.error(`Failed to fetch bangumi data for season ${season}:`, error);
      throw error;
    }
  },
  
  /**
   * Returns mock data for development/testing
   * @param season - The season identifier
   */
  getMockData(season: string): Data {
    // This is a simplified mock for demonstration
    // In a real implementation, we would have more comprehensive mock data
    return {
      siteMeta: {
        bangumi: {
          title: 'Bangumi',
          urlTemplate: 'https://bangumi.tv/subject/{id}',
          type: 'info',
        },
      },
      items: [
        {
          id: '1',
          title: `Mock Anime 1 (${season})`,
          type: 'tv',
          lang: 'jp',
          officialSite: 'https://example.com/anime1',
          begin: '2025-04-01T00:00:00.000Z',
          end: '2025-06-30T00:00:00.000Z',
          sites: [],
        },
        {
          id: '2',
          title: `Mock Anime 2 (${season})`,
          type: 'tv',
          lang: 'jp',
          officialSite: 'https://example.com/anime2',
          begin: '2025-04-02T00:00:00.000Z',
          end: '2025-06-30T00:00:00.000Z',
          sites: [],
        },
        {
          id: '3',
          title: `Mock Anime 3 (${season})`,
          type: 'movie',
          lang: 'jp',
          officialSite: 'https://example.com/anime3',
          begin: '2025-04-15T00:00:00.000Z',
          end: '2025-04-15T00:00:00.000Z',
          sites: [],
        },
      ],
      version: 1,
    };
  },
};

export default BangumiAPI;

