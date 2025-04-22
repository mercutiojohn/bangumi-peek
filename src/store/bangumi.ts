import { proxy, subscribe } from 'valtio';
import { 
  BangumiFilter, 
  Data, 
  Item, 
  LayoutConfig, 
  LayoutType, 
  WeekDay,
  BangumiType
} from '../types/bangumi';
import BangumiAPI from '@/services/bangumi';

// Default layout configuration
const DEFAULT_LAYOUT: LayoutConfig = {
  type: LayoutType.GRID,
  animation: true,
  showDetails: true,
};

// Default filter configuration
const DEFAULT_FILTER: BangumiFilter = {
  search: '',
  weekday: null,
  type: null,
  season: null,
};

// Screensaver configuration
interface ScreensaverConfig {
  enabled: boolean;
  interval: number; // Time in milliseconds between layout changes
  idleTime: number; // Time in milliseconds before screensaver activates
  layouts: LayoutType[]; // Layouts to cycle through
}

const DEFAULT_SCREENSAVER: ScreensaverConfig = {
  enabled: false,
  interval: 30000, // 30 seconds
  idleTime: 120000, // 2 minutes
  layouts: [LayoutType.GRID, LayoutType.TIMELINE, LayoutType.POSTER_WALL],
};

// Create the store state
interface BangumiState {
  data: Data | null;
  currentSeason: string | null;
  seasons: string[];
  isLoading: boolean;
  error: string | null;
  layout: LayoutConfig;
  filter: BangumiFilter;
  screensaver: ScreensaverConfig;
  favorites: Set<string>; // Store IDs of favorite bangumi
  lastUpdated: Date | null;
}

// Initialize the store with default values
const state = proxy<BangumiState>({
  data: null,
  currentSeason: null,
  seasons: [],
  isLoading: false,
  error: null,
  layout: DEFAULT_LAYOUT,
  filter: DEFAULT_FILTER,
  screensaver: DEFAULT_SCREENSAVER,
  favorites: new Set<string>(),
  lastUpdated: null,
});

// Store actions
const actions = {
  // Data fetching actions
  async fetchSeasons(): Promise<void> {
    state.isLoading = true;
    state.error = null;
    
    try {
      // This is a placeholder - in a real implementation, you would fetch from an API
      const response = await fetch('/api/seasons');
      const data = await response.json();
      
      state.seasons = data.items;
      if (!state.currentSeason && state.seasons.length > 0) {
        state.currentSeason = state.seasons[0];
      }
    } catch (error) {
      state.error = `Failed to fetch seasons: ${error instanceof Error ? error.message : String(error)}`;
    } finally {
      state.isLoading = false;
    }
  },
  
  async fetchBangumi(season: string): Promise<void> {
    state.isLoading = true;
    state.error = null;
    
    try {
      // This is a placeholder - in a real implementation, you would fetch from an API
      // const response = await fetch(`/api/bangumi/${season}`);
      // const data: Data = await response.json();
      const data = await BangumiAPI.getMockData(season);
      
      state.data = data;
      state.currentSeason = season;
      state.lastUpdated = new Date();
    } catch (error) {
      state.error = `Failed to fetch bangumi data: ${error instanceof Error ? error.message : String(error)}`;
      console.error('Error fetching bangumi data:', error);
      state.data = BangumiAPI.getMockData(season); // Fallback to mock data
    } finally {
      state.isLoading = false;
    }
  },
  
  // Layout actions
  setLayout(layout: Partial<LayoutConfig>): void {
    state.layout = { ...state.layout, ...layout };
  },
  
  setLayoutType(type: LayoutType): void {
    state.layout.type = type;
  },
  
  toggleAnimation(): void {
    state.layout.animation = !state.layout.animation;
  },
  
  toggleDetails(): void {
    state.layout.showDetails = !state.layout.showDetails;
  },
  
  // Filter actions
  setFilter(filter: Partial<BangumiFilter>): void {
    state.filter = { ...state.filter, ...filter };
  },
  
  resetFilter(): void {
    state.filter = DEFAULT_FILTER;
  },
  
  // Screensaver actions
  setScreensaver(config: Partial<ScreensaverConfig>): void {
    state.screensaver = { ...state.screensaver, ...config };
  },
  
  toggleScreensaver(): void {
    state.screensaver.enabled = !state.screensaver.enabled;
  },
  
  // Favorite actions
  toggleFavorite(id: string): void {
    if (state.favorites.has(id)) {
      state.favorites.delete(id);
    } else {
      state.favorites.add(id);
    }
  },
  
  isFavorite(id: string): boolean {
    return state.favorites.has(id);
  },

  // Helper functions for filtering
  getFilteredBangumi(): Item[] {
    if (!state.data || !state.data.items) return [];
    
    let filtered = state.data.items;
    
    // Apply search filter
    if (state.filter.search) {
      const searchLower = state.filter.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchLower) ||
        item.titleTranslate?.zh?.some(title => title.toLowerCase().includes(searchLower)) ||
        item.pinyinTitles?.some(title => title.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply weekday filter
    if (state.filter.weekday !== null && state.filter.weekday !== undefined) {
      filtered = filtered.filter(item => {
        if (!item.begin) return false;
        const date = new Date(item.begin);
        return date.getDay() === state.filter.weekday;
      });
    }
    
    // Apply type filter
    if (state.filter.type) {
      filtered = filtered.filter(item => item.type === state.filter.type);
    }
    
    return filtered;
  },
  
  // Get items grouped by weekday
  getBangumiByWeekday(): Record<WeekDay, Item[]> {
    const result: Record<WeekDay, Item[]> = {
      [WeekDay.SUNDAY]: [],
      [WeekDay.MONDAY]: [],
      [WeekDay.TUESDAY]: [],
      [WeekDay.WEDNESDAY]: [],
      [WeekDay.THURSDAY]: [],
      [WeekDay.FRIDAY]: [],
      [WeekDay.SATURDAY]: [],
    };
    
    const filtered = this.getFilteredBangumi();
    
    filtered.forEach(item => {
      if (item.begin) {
        const date = new Date(item.begin);
        const day = date.getDay() as WeekDay;
        result[day].push(item);
      }
    });
    
    return result;
  }
};

// Export the store state and actions
export const bangumiStore = {
  ...actions,
  state
};

// Create a snapshot of favorites for change detection
let previousFavorites: string[] = [];

// Persist favorites to localStorage
subscribe(state, (ops) => {
  // Only update localStorage when favorites change
  if (ops.some(op => op[1].includes('favorites'))) {
    try {
      if (state.favorites) {
        // Convert Set to Array for JSON serialization
        const currentFavorites = Array.from(state.favorites);
        
        // Check if favorites have actually changed
        const favoritesChanged = 
          currentFavorites.length !== previousFavorites.length || 
          currentFavorites.some(id => !previousFavorites.includes(id));
        
        if (favoritesChanged) {
          localStorage.setItem('bangumi-favorites', JSON.stringify(currentFavorites));
          previousFavorites = currentFavorites;
        }
      }
    } catch (e) {
      console.error('Failed to save favorites to localStorage:', e);
    }
  }
});

// Load favorites from localStorage on initialization
try {
  const savedFavorites = localStorage.getItem('bangumi-favorites');
  if (savedFavorites) {
    const favoriteIds = JSON.parse(savedFavorites) as string[];
    state.favorites = new Set(favoriteIds);
  }
} catch (e) {
  console.error('Failed to load favorites from localStorage', e);
}

export default bangumiStore;

