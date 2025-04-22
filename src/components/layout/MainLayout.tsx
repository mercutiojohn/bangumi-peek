import { useState, useEffect, useRef } from 'react';
import { useSnapshot } from 'valtio';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import {
  Settings,
  Grid3x3,
  ClockIcon,
  ImageIcon,
  PlayCircle,
  PauseCircle,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { GridLayout } from '@/components/layouts/GridLayout';
import { TimelineLayout } from '@/components/layouts/TimelineLayout';
import { PosterWallLayout } from '@/components/layouts/PosterWallLayout';
import { bangumiStore } from '@/store/bangumi';
import { LayoutType } from '@/types/bangumi';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  className?: string;
}

export function MainLayout({ className }: MainLayoutProps) {
  // Get store state
  const { state } = bangumiStore;
  const snap = useSnapshot(state);
  
  // State for settings panel visibility
  const [showSettings, setShowSettings] = useState(false);
  
  // Track user activity for screensaver mode
  const [isIdle, setIsIdle] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const activityTimerRef = useRef<number | null>(null);
  const screensaverIntervalRef = useRef<number | null>(null);
  
  // Detect user activity
  useEffect(() => {
    const handleActivity = () => {
      setLastActivity(Date.now());
      setIsIdle(false);
    };
    
    // Add event listeners for user activity
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('scroll', handleActivity);
    
    return () => {
      // Remove event listeners on cleanup
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      
      // Clear any existing timers
      if (activityTimerRef.current) window.clearInterval(activityTimerRef.current);
      if (screensaverIntervalRef.current) window.clearInterval(screensaverIntervalRef.current);
    };
  }, []);
  
  // Check for idle state
  useEffect(() => {
    if (activityTimerRef.current) window.clearInterval(activityTimerRef.current);
    
    activityTimerRef.current = window.setInterval(() => {
      const idleTime = Date.now() - lastActivity;
      if (!isIdle && snap.screensaver.enabled && idleTime > snap.screensaver.idleTime) {
        setIsIdle(true);
      }
    }, 1000); // Check every second
    
    return () => {
      if (activityTimerRef.current) window.clearInterval(activityTimerRef.current);
    };
  }, [lastActivity, isIdle, snap.screensaver.enabled, snap.screensaver.idleTime]);
  
  // Handle screensaver layout cycling
  useEffect(() => {
    if (screensaverIntervalRef.current) window.clearInterval(screensaverIntervalRef.current);
    
    if (isIdle && snap.screensaver.enabled) {
      // Start cycling through layouts
      screensaverIntervalRef.current = window.setInterval(() => {
        const currentLayouts = snap.screensaver.layouts;
        const currentIndex = currentLayouts.indexOf(snap.layout.type);
        const nextIndex = (currentIndex + 1) % currentLayouts.length;
        bangumiStore.setLayoutType(currentLayouts[nextIndex]);
      }, snap.screensaver.interval);
    }
    
    return () => {
      if (screensaverIntervalRef.current) window.clearInterval(screensaverIntervalRef.current);
    };
  }, [isIdle, snap.screensaver.enabled, snap.screensaver.interval, snap.screensaver.layouts, snap.layout.type]);
  
  // Helper to get layout icon
  const getLayoutIcon = (type: LayoutType) => {
    switch (type) {
      case LayoutType.GRID:
        return <Grid3x3 size={16} />;
      case LayoutType.TIMELINE:
        return <ClockIcon size={16} />;
      case LayoutType.POSTER_WALL:
        return <ImageIcon size={16} />;
      default:
        return <Grid3x3 size={16} />;
    }
  };
  
  // Format milliseconds as human-readable time
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes < 1) {
      return `${seconds} 秒`;
    } else {
      return `${minutes} 分钟`;
    }
  };
  
  // Layout transition variants
  const layoutVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.4, ease: 'easeOut' }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      transition: { duration: 0.3, ease: 'easeIn' }
    }
  };
  
  return (
    <div className={cn("relative min-h-screen p-6", className)}>
      {/* Layout selection controls */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        <Card className="shadow-xl border-2 bg-background/80 backdrop-blur-sm">
          <CardContent className="p-2 flex items-center gap-2">
            <Tabs
              value={snap.layout.type}
              onValueChange={(value) => bangumiStore.setLayoutType(value as LayoutType)}
              className="w-fit"
            >
              <TabsList>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger value={LayoutType.GRID}>
                        <Grid3x3 size={18} />
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>网格视图</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger value={LayoutType.TIMELINE}>
                        <ClockIcon size={18} />
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>时间轴视图</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger value={LayoutType.POSTER_WALL}>
                        <ImageIcon size={18} />
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>海报墙视图</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TabsList>
            </Tabs>
            
            <Separator orientation="vertical" className="h-8" />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              className={showSettings ? "bg-muted" : ""}
            >
              <Settings size={18} />
            </Button>
            
            {snap.screensaver.enabled && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => bangumiStore.toggleScreensaver()}
                    >
                      {snap.screensaver.enabled ? <PlayCircle size={18} className="text-green-500" /> : <PauseCircle size={18} />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{snap.screensaver.enabled ? "屏保模式已启用" : "屏保模式已禁用"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-20 w-[90%] max-w-md"
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>布局与屏保设置</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={() => setShowSettings(false)}
                  >
                    <span className="sr-only">关闭</span>
                    &times;
                  </Button>
                </CardTitle>
                <CardDescription>
                  自定义布局和屏保模式设置
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Layout settings */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">布局设置</h3>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="animation-switch" className="flex items-center gap-2">
                      <RefreshCw size={14} />
                      启用动画效果
                    </Label>
                    <Switch
                      id="animation-switch"
                      checked={snap.layout.animation}
                      onCheckedChange={bangumiStore.toggleAnimation}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="details-switch" className="flex items-center gap-2">
                      <HelpCircle size={14} />
                      显示详细信息
                    </Label>
                    <Switch
                      id="details-switch"
                      checked={snap.layout.showDetails}
                      onCheckedChange={bangumiStore.toggleDetails}
                    />
                  </div>
                </div>
                
                <Separator />
                
                {/* Screensaver settings */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">屏保模式设置</h3>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="screensaver-switch">启用屏保模式</Label>
                    <Switch
                      id="screensaver-switch"
                      checked={snap.screensaver.enabled}
                      onCheckedChange={bangumiStore.toggleScreensaver}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="idle-time-slider">
                        闲置时间: {formatTime(snap.screensaver.idleTime)}
                      </Label>
                    </div>
                    <Slider
                      id="idle-time-slider"
                      disabled={!snap.screensaver.enabled}
                      min={10000}
                      max={600000}
                      step={10000}
                      value={[snap.screensaver.idleTime]}
                      onValueChange={(value) => bangumiStore.setScreensaver({ idleTime: value[0] })}
                      className="py-2"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="interval-slider">
                        切换间隔: {formatTime(snap.screensaver.interval)}
                      </Label>
                    </div>
                    <Slider
                      id="interval-slider"
                      disabled={!snap.screensaver.enabled}
                      min={5000}
                      max={120000}
                      step={5000}
                      value={[snap.screensaver.interval]}
                      onValueChange={(value) => bangumiStore.setScreensaver({ interval: value[0] })}
                      className="py-2"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>屏保布局选择</Label>
                    <div className="flex flex-wrap gap-2">
                      {Object.values(LayoutType).map((type) => (
                        <Button
                          key={type}
                          size="sm"
                          variant={snap.screensaver.layouts.includes(type) ? "default" : "outline"}
                          onClick={() => {
                            const current = [...snap.screensaver.layouts];
                            const index = current.indexOf(type);
                            if (index === -1) {
                              // Add to layouts if not already included
                              bangumiStore.setScreensaver({ layouts: [...current, type] });
                            } else if (current.length > 1) {
                              // Remove from layouts but ensure at least one layout remains
                              current.splice(index, 1);
                              bangumiStore.setScreensaver({ layouts: current });
                            }
                          }}
                          className="flex items-center gap-1"
                        >
                          {getLayoutIcon(type)}
                          <span>
                            {type === LayoutType.GRID && "网格视图"}
                            {type === LayoutType.TIMELINE && "时间轴视图"}
                            {type === LayoutType.POSTER_WALL && "海报墙视图"}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Screensaver active overlay (shown when in screensaver mode) */}
      {isIdle && snap.screensaver.enabled && (
        <div className="fixed inset-0 z-10 bg-background/10 backdrop-blur-sm pointer-events-none">
          <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
            屏保模式已启用 - 移动鼠标或按任意键退出
          </div>
        </div>
      )}
      
      {/* Main content with layouts */}
      <div className="container mx-auto max-w-7xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={snap.layout.type}
            variants={layoutVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="pt-4 pb-24"
          >
            {/* Render different layouts based on current selection */}
            {snap.layout.type === LayoutType.GRID && (
              <GridLayout config={snap.layout} />
            )}
            
            {snap.layout.type === LayoutType.TIMELINE && (
              <TimelineLayout config={snap.layout} />
            )}
            
            {snap.layout.type === LayoutType.POSTER_WALL && (
              <PosterWallLayout config={snap.layout} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default MainLayout;

