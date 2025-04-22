import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSnapshot } from 'valtio';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { BangumiCard } from '@/components/bangumi/BangumiCard';
import { bangumiStore } from '@/store/bangumi';
import { LayoutConfig, WeekDay } from '@/types/bangumi';
import { cn, getWeekdayName } from '@/lib/utils';

interface GridLayoutProps {
  config?: Partial<LayoutConfig>;
  className?: string;
}

export function GridLayout({ config, className }: GridLayoutProps) {
  // Get the store state
  const { state } = bangumiStore;
  const snap = useSnapshot(state);
  
  // Current selected weekday tab
  const [activeTab, setActiveTab] = useState<string>(WeekDay.MONDAY.toString());
  
  // Track mount state for animations
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Get bangumi data grouped by weekday
  const bangumiByWeekday = bangumiStore.getBangumiByWeekday();

  // Prepare tabs data
  const tabs = Object.entries(bangumiByWeekday).map(([day, items]) => ({
    value: day,
    label: getWeekdayName(Number(day) as WeekDay),
    count: items.length,
  }));

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <Tabs
        defaultValue={activeTab}
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold tracking-tight">番组日历</h2>
          <TabsList className="grid grid-cols-7">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="relative"
                onClick={() => setActiveTab(tab.value)}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className="absolute -top-1 -right-1 text-xs bg-primary text-white rounded-full w-4 h-4 flex items-center justify-center">
                    {tab.count}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <AnimatePresence mode="wait">
          {tabs.map((tab) => (
            <TabsContent
              key={tab.value}
              value={tab.value}
              className="mt-0"
              forceMount={activeTab === tab.value}
            >
              {bangumiByWeekday[Number(tab.value) as WeekDay].length > 0 ? (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate={isMounted && activeTab === tab.value ? "visible" : "hidden"}
                  exit="hidden"
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
                >
                  {bangumiByWeekday[Number(tab.value) as WeekDay].map((item, index) => (
                    <BangumiCard
                      key={item.id || index}
                      item={item}
                      index={index}
                      showDetails={snap.layout.showDetails}
                    />
                  ))}
                </motion.div>
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">
                    {tab.label}没有放送的番组
                  </p>
                </Card>
              )}
            </TabsContent>
          ))}
        </AnimatePresence>
      </Tabs>
    </div>
  );
}

export default GridLayout;

