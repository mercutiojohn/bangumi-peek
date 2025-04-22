import { useState } from 'react';
import { useSnapshot } from 'valtio';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  LayoutGrid,
  Clock,
  Image as ImageIcon,
  Monitor,
  Moon,
  Sun,
  Palette,
  RotateCcw,
  Save,
  InfoIcon
} from 'lucide-react';
import { bangumiStore } from '@/store/bangumi';
import { LayoutType } from '@/types/bangumi';
import { useTheme } from '@/components/ui/theme-provider';
import { cn, formatTime } from '@/lib/utils';

const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">主题</h3>
        <p className="text-xs text-muted-foreground">选择您喜欢的显示主题。</p>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant={theme === 'light' ? 'default' : 'outline'}
          className="flex flex-col items-center justify-center gap-1 h-20"
          onClick={() => setTheme('light')}
        >
          <Sun size={18} />
          <span className="text-xs">亮色</span>
        </Button>
        
        <Button
          variant={theme === 'dark' ? 'default' : 'outline'}
          className="flex flex-col items-center justify-center gap-1 h-20"
          onClick={() => setTheme('dark')}
        >
          <Moon size={18} />
          <span className="text-xs">暗色</span>
        </Button>
        
        <Button
          variant={theme === 'system' ? 'default' : 'outline'}
          className="flex flex-col items-center justify-center gap-1 h-20"
          onClick={() => setTheme('system')}
        >
          <Monitor size={18} />
          <span className="text-xs">系统</span>
        </Button>
      </div>
    </div>
  );
};

const LayoutSelector = () => {
  const { state } = bangumiStore;
  const snap = useSnapshot(state);
  
  const defaultLayout = snap.layout.type;
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">默认布局</h3>
        <p className="text-xs text-muted-foreground">选择应用启动时的默认布局。</p>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant={defaultLayout === LayoutType.GRID ? 'default' : 'outline'}
          className="flex flex-col items-center justify-center gap-1 h-20"
          onClick={() => bangumiStore.setLayoutType(LayoutType.GRID)}
        >
          <LayoutGrid size={18} />
          <span className="text-xs">网格视图</span>
        </Button>
        
        <Button
          variant={defaultLayout === LayoutType.TIMELINE ? 'default' : 'outline'}
          className="flex flex-col items-center justify-center gap-1 h-20"
          onClick={() => bangumiStore.setLayoutType(LayoutType.TIMELINE)}
        >
          <Clock size={18} />
          <span className="text-xs">时间轴视图</span>
        </Button>
        
        <Button
          variant={defaultLayout === LayoutType.POSTER_WALL ? 'default' : 'outline'}
          className="flex flex-col items-center justify-center gap-1 h-20"
          onClick={() => bangumiStore.setLayoutType(LayoutType.POSTER_WALL)}
        >
          <ImageIcon size={18} />
          <span className="text-xs">海报墙视图</span>
        </Button>
      </div>
      
      <div className="space-y-2 pt-4">
        <h3 className="text-sm font-medium">布局选项</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="animation-toggle">启用动画效果</Label>
            <Switch 
              id="animation-toggle" 
              checked={snap.layout.animation}
              onCheckedChange={bangumiStore.toggleAnimation}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="details-toggle">显示详细信息</Label>
            <Switch 
              id="details-toggle" 
              checked={snap.layout.showDetails}
              onCheckedChange={bangumiStore.toggleDetails}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ScreensaverSettings = () => {
  const { state } = bangumiStore;
  const snap = useSnapshot(state);
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">屏保模式</h3>
        <p className="text-xs text-muted-foreground">配置屏保模式的行为和外观。</p>
      </div>
      
      <div className="flex items-center justify-between">
        <Label htmlFor="screensaver-toggle">启用屏保模式</Label>
        <Switch 
          id="screensaver-toggle" 
          checked={snap.screensaver.enabled}
          onCheckedChange={bangumiStore.toggleScreensaver}
        />
      </div>
      
      <div className="space-y-4 pt-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
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
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
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
          />
        </div>
        
        <div className="space-y-2">
          <Label>屏保布局</Label>
          <div className="grid grid-cols-3 gap-2">
            {Object.values(LayoutType).map((type) => (
              <Button
                key={type}
                size="sm"
                variant={snap.screensaver.layouts.includes(type) ? "default" : "outline"}
                className="flex items-center justify-center gap-1"
                onClick={() => {
                  const current = [...snap.screensaver.layouts];
                  const index = current.indexOf(type);
                  if (index === -1) {
                    bangumiStore.setScreensaver({ layouts: [...current, type] });
                  } else if (current.length > 1) {
                    current.splice(index, 1);
                    bangumiStore.setScreensaver({ layouts: current });
                  }
                }}
              >
                {type === LayoutType.GRID && (
                  <>
                    <LayoutGrid size={14} />
                    <span>网格</span>
                  </>
                )}
                {type === LayoutType.TIMELINE && (
                  <>
                    <Clock size={14} />
                    <span>时间轴</span>
                  </>
                )}
                {type === LayoutType.POSTER_WALL && (
                  <>
                    <ImageIcon size={14} />
                    <span>海报墙</span>
                  </>
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const AboutSection = () => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">关于应用</h3>
        <p className="text-xs text-muted-foreground">番组日历屏保 (Bangumi Peek) 的信息。</p>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">番组日历屏保</CardTitle>
          <CardDescription>现代化的番组信息展示应用</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>版本: 1.0.0</p>
          <p className="text-muted-foreground">
            番组日历屏保是一个集成了bangumi-list-v3的番剧数据和RSSence现代UI设计的应用，
            提供了多种现代化的排版布局，可作为屏保使用。
          </p>
        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-between">
          <Button variant="outline" size="sm" asChild>
            <a href="https://github.com/yourusername/bangumi-peek" target="_blank" rel="noopener noreferrer">
              查看源码
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="https://github.com/yourusername/bangumi-peek/issues" target="_blank" rel="noopener noreferrer">
              报告问题
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("appearance");
  
  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0,
      y: -20,
      transition: { 
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };
  
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="container max-w-4xl mx-auto py-8 px-4"
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">设置</h1>
          <p className="text-muted-foreground">自定义应用的外观和行为。</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="appearance" className="flex items-center gap-1">
              <Palette size={16} />
              <span>外观</span>
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex items-center gap-1">
              <LayoutGrid size={16} />
              <span>布局</span>
            </TabsTrigger>
            <TabsTrigger value="screensaver" className="flex items-center gap-1">
              <Monitor size={16} />
              <span>屏保</span>
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-1">
              <InfoIcon size={16} />
              <span>关于</span>
            </TabsTrigger>
          </TabsList>
          
          <Card>
            <CardContent className="pt-6">
              <TabsContent value="appearance" className="mt-0">
                <ThemeSelector />
              </TabsContent>
              
              <TabsContent value="layout" className="mt-0">
                <LayoutSelector />
              </TabsContent>
              
              <TabsContent value="screensaver" className="mt-0">
                <ScreensaverSettings />
              </TabsContent>
              
              <TabsContent value="about" className="mt-0">
                <AboutSection />
              </TabsContent>
            </CardContent>
            
            <CardFooter className="border-t flex justify-between">
              <Button variant="outline" className="gap-1">
                <RotateCcw size={16} />
                <span>重置设置</span>
              </Button>
              
              <Button className="gap-1">
                <Save size={16} />
                <span>保存设置</span>
              </Button>
            </CardFooter>
          </Card>
        </Tabs>
      </div>
    </motion.div>
  );
}

