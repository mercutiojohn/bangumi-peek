import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { Item, BangumiType } from '@/types/bangumi';
import { bangumiStore } from '@/store/bangumi';
import { formatDate } from '@/lib/utils';

interface BangumiCardProps {
  item: Item;
  index: number;
  showDetails?: boolean;
}

export function BangumiCard({ item, index, showDetails = true }: BangumiCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isFavorite = bangumiStore.isFavorite(item.id || '');

  // Get type badge color
  const getTypeColor = (type: BangumiType) => {
    switch (type) {
      case BangumiType.TV:
        return 'bg-blue-500';
      case BangumiType.MOVIE:
        return 'bg-purple-500';
      case BangumiType.OVA:
        return 'bg-amber-500';
      case BangumiType.WEB:
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Default placeholder image if no cover is available
  const coverImage = item.coverImage || 'https://placehold.co/300x450/0F172A/FFFFFF?text=No+Image';

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: 'easeOut'
      }
    }),
    hover: {
      scale: 1.05,
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      custom={index}
      variants={cardVariants}
      whileHover={isHovered ? "hover" : ""}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="h-full"
    >
      <Card className="h-full overflow-hidden flex flex-col border-2 transition-colors hover:border-primary">
        <div className="relative aspect-[2/3] overflow-hidden bg-secondary/20">
          <img 
            src={coverImage} 
            alt={item.title}
            className="object-cover w-full h-full transition-transform duration-300"
            style={{ transform: isHovered ? 'scale(1.1)' : 'scale(1)' }}
          />
          <Badge className={`absolute top-2 right-2 ${getTypeColor(item.type)}`}>
            {item.type.toUpperCase()}
          </Badge>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 left-2 bg-background/50 backdrop-blur-sm hover:bg-background/80"
            onClick={(e) => {
              e.stopPropagation();
              bangumiStore.toggleFavorite(item.id || '');
            }}
          >
            <Heart className={isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"} size={18} />
          </Button>
        </div>

        {showDetails && (
          <>
            <CardHeader className="p-3">
              <CardTitle className="line-clamp-1 text-base">{item.title}</CardTitle>
              <CardDescription className="line-clamp-1 text-xs">
                {item.titleTranslate?.zh?.[0] || ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0 text-xs space-y-1 text-muted-foreground flex-grow">
              {item.begin && (
                <div>放送开始: {formatDate(new Date(item.begin))}</div>
              )}
              {item.broadcast && (
                <div>放送时间: {item.broadcast}</div>
              )}
            </CardContent>
            <CardFooter className="p-3 border-t flex justify-between">
              <Badge variant="outline" className="text-xs">
                {item.lang === 'jp' ? '日语' : item.lang === 'zh-cn' ? '国语' : item.lang}
              </Badge>
            </CardFooter>
          </>
        )}
      </Card>
    </motion.div>
  );
}

export default BangumiCard;

