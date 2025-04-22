import { useEffect, useState } from "react";
import { useSnapshot } from "valtio";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MainLayout } from "@/components/layout/MainLayout";
import { bangumiStore } from "@/store/bangumi";
import { BangumiAPI } from "@/services/bangumi";
import { getCurrentSeason } from "@/lib/utils";

function App() {
  const { state } = bangumiStore;
  const snap = useSnapshot(state);
  
  // Local loading state for initial data fetch
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Fetch data on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setInitialLoading(true);
        
        // Load seasons list first
        await bangumiStore.fetchSeasons();
        
        // Then load bangumi data for current or first season
        const currentSeason = snap.currentSeason || getCurrentSeason();
        await bangumiStore.fetchBangumi(currentSeason);
        
      } catch (error) {
        console.error("Failed to load initial data", error);
        // Error is already set in the store
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // For development testing, if using mock data
  useEffect(() => {
    if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_DATA === 'true') {
      // Add some mock data for development
      if (!snap.data) {
        const mockData = BangumiAPI.getMockData(getCurrentSeason());
        bangumiStore.state.data = mockData;
      }
      setInitialLoading(false);
    }
  }, [snap.data]);
  
  return (
    <ThemeProvider defaultTheme="dark" storageKey="bangumi-peek-theme">
      <div className="relative min-h-screen bg-background text-foreground antialiased">
        {initialLoading ? (
          // Loading state
          <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-md space-y-4">
              <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold tracking-tighter">番组日历</h1>
                <p className="text-muted-foreground">加载中，请稍候...</p>
              </div>
              
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-60 w-full" />
                <div className="grid grid-cols-3 gap-2">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            </div>
          </div>
        ) : snap.error ? (
          // Error state
          <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-md space-y-4 text-center">
              <h1 className="text-2xl font-semibold text-destructive">出错了</h1>
              <p className="text-muted-foreground">{snap.error}</p>
              <Button 
                onClick={() => {
                  const currentSeason = snap.currentSeason || getCurrentSeason();
                  bangumiStore.fetchBangumi(currentSeason);
                }}
              >
                重试
              </Button>
            </div>
          </div>
        ) : (
          // Main content
          <MainLayout />
        )}
        
        {/* Global toast notifications */}
        <Toaster position="top-right" />
      </div>
    </ThemeProvider>
  );
}

export default App;
