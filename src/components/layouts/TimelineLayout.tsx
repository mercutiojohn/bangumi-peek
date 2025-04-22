import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSnapshot } from 'valtio';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CalendarDays, Heart } from 'lucide-react';
import { bangumiStore } from '@/store/bangumi';
import { Item, LayoutConfig, WeekDay } from '@/types/bangumi';
import { cn, formatDate, formatTime, getWeekdayName } from '@/lib/utils';

interface TimelineLayoutProps {
  config?: Partial<LayoutConfig>;
  className?: string;
}

interface TimelineItem {
  time: string;
  date: Date;
  items: Item[];
}

export function TimelineLayout({ config, className }: TimelineLayoutProps) {
  // Get the store state
  const { state } = bangumiStore;
  const snap = useSnapshot(state);
  
  // Current selected day - default to today
  const [selectedDay, setSelectedDay] = useState<WeekDay>(new Date().getDay() as WeekDay);
  
  // Track mount state for animations
  const [isMounted, setIsMounted] = useState(false);
  
  // Store the current time for countdown calculations
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update current time every minute
  useEffect(() => {
    setIsMounted(true);
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => {
      clearInterval(timer);
      setIsMounted(false);
    };
  }, []);

  // Get all bangumi items for the selected day
  const allItems = bangumiStore.getBangumiByWeekday()[selectedDay] || [];
  
  // Group items by broadcast time and sort chronologically
  const timelineItems: TimelineItem[] = useMemo(() => {
    const itemsByTime: Record<string, Item[]> = {};
    
    // Group by broadcast time
    allItems.forEach(item => {
      if (!item.begin) return;
      
      const date = new Date(item.begin);
      const timeStr = formatTime(date);
      
      if (!itemsByTime[timeStr]) {
        itemsByTime[timeStr] = [];
      }
      
      itemsByTime[timeStr].push(item);
    });
    
    // Convert to array and sort by time
    return Object.entries(itemsByTime)
      .map(([time, items]) => {
        // Parse time string to create a sortable date object
        const [hours, minutes] = time.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        
        return { time, date, items };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [allItems]);
  
  // Day selection tabs
  const dayTabs = Array.from({ length: 7 }, (_, i) => ({
    value: i.toString(),
    label: getWeekdayName(i as WeekDay),
    isToday: i === new Date().getDay(),
  }));
  
  // Calculate time remaining until broadcast
  const getTimeRemaining = (broadcastTime: Date): string => {
    const diffMs = broadcastTime.getTime() - currentTime.getTime();
    
    if (diffMs <= 0) {
      return "正在放送中";
    }
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 24) {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}天后`;
    }
    
    return `${diffHours}小时${diffMinutes}分钟后`;
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  
  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };
  
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">播出时间表</h2>
          <div className="flex space-x-1">
            {dayTabs.map((tab) => (
              <Button
                key={tab.value}
                variant={selectedDay.toString() === tab.value ? "default" : "outline"}
                size="sm"
                className={cn(
                  "relative",
                  tab.isToday && selectedDay.toString() !== tab.value && "border-primary/50"
                )}
                onClick={() => setSelectedDay(Number(tab.value) as WeekDay)}
              >
                {tab.label}
                {tab.isToday && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
                )}
              </Button>
            ))}
          </div>
        </div>
        
        <Separator />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDay}
            variants={containerVariants}
            initial="hidden"
            animate={isMounted ? "visible" : "hidden"}
            exit="hidden"
            className="relative pl-6 pt-2"
          >
            {/* Vertical timeline line */}
            <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />
            
            {timelineItems.length > 0 ? (
              timelineItems.map((timeItem, idx) => (
                <div key={timeItem.time} className="mb-8 relative">
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-0 w-1.5 h-1.5 rounded-full bg-primary -translate-x-[3px]" />
                  
                  {/* Time label */}
                  <div className="flex items-center mb-3">
                    <Badge variant="outline" className="text-xs font-mono flex gap-1">
                      <Clock size={12} />
                      {timeItem.time}
                    </Badge>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {getTimeRemaining(timeItem.date)}
                    </span>
                  </div>
                  
                  {/* Anime cards */}
                  <div className="grid gap-4">
                    {timeItem.items.map((item, index) => (
                      <motion.div
                        key={item.id || index}
                        variants={itemVariants}
                        className="relative"
                      >
                        <Card className="overflow-hidden">
                          <CardContent className="p-0">
                            <div className="flex">
                              {/* Image */}
                              <div className="w-24 h-24 sm:w-32 sm:h-32 relative flex-shrink-0">
                                <img
                                  src={item.coverImage || 'https://placehold.co/300x450/0F172A/FFFFFF?text=No+Image'}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="absolute top-1 left-1 h-6 w-6 bg-background/50 backdrop-blur-sm hover:bg-background/80"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    bangumiStore.toggleFavorite(item.id || '');
                                  }}
                                >
                                  <Heart 
                                    className={bangumiStore.isFavorite(item.id || '') ? "fill-red-500 text-red-500" : "text-muted-foreground"} 
                                    size={12} 
                                  />
                                </Button>
                              </div>
                              
                              {/* Content */}
                              <div className="p-3 flex flex-col justify-between flex-grow">
                                <div>
                                  <h3 className="font-semibold line-clamp-1">{item.title}</h3>
                                  <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                                    {item.titleTranslate?.zh?.[0] || ''}
                                  </p>
                                </div>
                                
                                <div className="flex justify-between items-end mt-2">
                                  <div className="flex items-center text-xs text-muted-foreground">
                                    <CalendarDays size={12} className="mr-1" />
                                    {item.begin ? formatDate(new Date(item.begin)) : '未知日期'}
                                  </div>
                                  
                                  <Badge>
                                    {item.type.toUpperCase()}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <Card className="p-8 text-center mt-4">
                <p className="text-muted-foreground">
                  {getWeekdayName(selectedDay)}没有放送的番组
                </p>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default TimelineLayout;

