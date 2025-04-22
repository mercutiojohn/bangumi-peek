import { useState, useEffect } from 'react';
import { useSnapshot } from 'valtio';
import Masonry from 'react-masonry-css';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Calendar, Clock, Info, ExternalLink } from 'lucide-react';
import { bangumiStore } from '@/store/bangumi';
import { Item, LayoutConfig, BangumiType } from '@/types/bangumi';
import { cn, formatDate, formatTime } from '@/lib/utils';

interface PosterWallLayoutProps {
  config?: Partial<LayoutConfig>;
  className?: string;
}

export function PosterWallLayout({ config, className }: PosterWallLayoutProps) {
  // Get store state
  const { state } = bangumiStore;
  const snap = useSnapshot(state);
  
  // Current filter (show all by default)
  const [filter, setFilter] = useState<BangumiType | 'all'>('all');
  
  // Current selected item for preview
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  
  // Track loaded images
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  
  // Track mount state for animations
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  
  // Get all items
  const allItems = snap.data?.items || [];
  
  // Apply filters
  const filteredItems = allItems.filter(item => 
    filter === 'all' || item.type === filter
  );
  
  // Mark image as loaded
  const handleImageLoad = (id: string) => {
    setLoadedImages(prev => ({
      ...prev,
      [id]: true
    }));
  };
  
  // Check if image is loaded
  const isImageLoaded = (id: string) => {
    return loadedImages[id] || false;
  };
  
  // Get gradient color by anime type
  const getGradientByType = (type: BangumiType) => {
    switch (type) {
      case BangumiType.TV:
        return 'from-blue-900 to-indigo-900';
      case BangumiType.MOVIE:
        return 'from-purple-900 to-pink-900';
      case BangumiType.OVA:
        return 'from-amber-900 to-orange-900';
      case BangumiType.WEB:
        return 'from-green-900 to-emerald-900';
      default:
        return 'from-gray-900 to-slate-900';
    }
  };
  
  // Breakpoints for the masonry layout
  const breakpointColumnsObj = {
    default: 5,
    1536: 4,
    1280: 4,
    1024: 3,
    768: 2,
    640: 2,
    500: 1
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };
  
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };
  
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight">番组海报墙</h2>
        
        <Tabs defaultValue="all" value={filter} onValueChange={(v) => setFilter(v as BangumiType | 'all')}>
          <TabsList>
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value={BangumiType.TV}>TV</TabsTrigger>
            <TabsTrigger value={BangumiType.MOVIE}>剧场版</TabsTrigger>
            <TabsTrigger value={BangumiType.OVA}>OVA</TabsTrigger>
            <TabsTrigger value={BangumiType.WEB}>WEB</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          variants={containerVariants}
          initial="hidden"
          animate={isMounted ? "visible" : "hidden"}
          exit="hidden"
        >
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="flex w-auto -ml-4"
            columnClassName="pl-4 bg-background"
          >
            {filteredItems.map((item, index) => {
              const imageUrl = item.coverImage || 'https://placehold.co/600x900/0F172A/FFFFFF?text=No+Image';
              const isFavorite = bangumiStore.isFavorite(item.id || '');
              
              return (
                <motion.div
                  key={item.id || index}
                  variants={itemVariants}
                  className="mb-4"
                >
                  <div 
                    className={cn(
                      "group relative rounded-lg overflow-hidden cursor-pointer",
                      "transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                    )}
                    onClick={() => setSelectedItem(item)}
                  >
                    {/* Image container */}
                    <div className="relative aspect-[2/3] overflow-hidden bg-muted">
                      {/* Loading skeleton */}
                      {!isImageLoaded(item.id || `item-${index}`) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted">
                          <Skeleton className="h-full w-full" />
                        </div>
                      )}
                      
                      {/* Actual image with lazy loading */}
                      <img
                        src={imageUrl}
                        alt={item.title}
                        loading="lazy"
                        className={cn(
                          "w-full h-full object-cover transition-transform duration-500",
                          "group-hover:scale-110",
                          !isImageLoaded(item.id || `item-${index}`) && "opacity-0",
                          isImageLoaded(item.id || `item-${index}`) && "opacity-100"
                        )}
                        onLoad={() => handleImageLoad(item.id || `item-${index}`)}
                      />
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
                        <h3 className="text-white font-bold line-clamp-2 mb-1">{item.title}</h3>
                        {item.titleTranslate?.zh?.[0] && (
                          <p className="text-white/80 text-sm line-clamp-1 mb-2">
                            {item.titleTranslate.zh[0]}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-white border-white/50">
                            {item.type.toUpperCase()}
                          </Badge>
                          <div className="text-xs text-white/70">点击查看详情</div>
                        </div>
                      </div>
                      
                      {/* Type badge for all posters */}
                      <Badge className="absolute top-2 right-2 z-10">
                        {item.type.toUpperCase()}
                      </Badge>
                      
                      {/* Favorite button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 left-2 z-10 bg-black/30 backdrop-blur-sm hover:bg-black/50"
                        onClick={(e) => {
                          e.stopPropagation();
                          bangumiStore.toggleFavorite(item.id || '');
                        }}
                      >
                        <Heart 
                          className={isFavorite ? "fill-red-500 text-red-500" : "text-white"} 
                          size={16} 
                        />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </Masonry>
        </motion.div>
      </AnimatePresence>
      
      {/* Detail dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-3xl">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedItem.title}</DialogTitle>
                {selectedItem.titleTranslate?.zh?.[0] && (
                  <DialogDescription>
                    {selectedItem.titleTranslate.zh[0]}
                  </DialogDescription>
                )}
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                {/* Poster column */}
                <div className="col-span-1">
                  <div className="aspect-[2/3] rounded-lg overflow-hidden bg-muted relative">
                    <img
                      src={selectedItem.coverImage || 'https://placehold.co/600x900/0F172A/FFFFFF?text=No+Image'}
                      alt={selectedItem.title}
                      className="w-full h-full object-cover"
                    />
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-t opacity-50", 
                      getGradientByType(selectedItem.type)
                    )} />
                  </div>
                </div>
                
                {/* Info column */}
                <div className="col-span-1 md:col-span-2 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} className="text-muted-foreground" />
                      <span className="text-sm">
                        放送开始: {selectedItem.begin ? formatDate(new Date(selectedItem.begin)) : '未知'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock size={16} className="text-muted-foreground" />
                      <span className="text-sm">
                        放送时间: {selectedItem.broadcast || '未知'}
                      </span>
                    </div>
                  </div>
                  
                  {selectedItem.comment && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium flex items-center gap-1 mb-1">
                        <Info size={14} /> 简介
                      </h4>
                      <p className="text-sm text-muted-foreground border-l-2 border-primary/20 pl-3">
                        {selectedItem.comment}
                      </p>
                    </div>
                  )}
                  
                  {selectedItem.sites && selectedItem.sites.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
                        <ExternalLink size={14} /> 相关链接
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.sites.map((site, idx) => (
                          <Button 
                            key={`${site.site}-${idx}`}
                            variant="outline" 
                            size="sm"
                            asChild
                          >
                            <a 
                              href={site.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1"
                            >
                              <span>{site.site}</span>
                              <ExternalLink size={12} />
                            </a>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter className="flex justify-between items-center mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    bangumiStore.toggleFavorite(selectedItem.id || '');
                  }}
                >
                  <Heart 
                    className={bangumiStore.isFavorite(selectedItem.id || '') ? "fill-red-500 text-red-500 mr-2" : "mr-2"} 
                    size={16} 
                  />
                  {bangumiStore.isFavorite(selectedItem.id || '') ? '取消收藏' : '收藏'}
                </Button>
                
                <Button onClick={() => setSelectedItem(null)}>关闭</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PosterWallLayout;

