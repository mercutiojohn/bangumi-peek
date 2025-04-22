import { useEffect, useState } from 'react';
import { useRouteError, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertTriangle,
  Home,
  RefreshCw,
  Search,
  HelpCircle,
  FileQuestion
} from 'lucide-react';

interface ErrorInfo {
  status?: number;
  statusText?: string;
  message?: string;
}

export default function ErrorPage() {
  const error = useRouteError() as ErrorInfo;
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  
  // Auto-redirect to home page after countdown
  useEffect(() => {
    if (countdown <= 0) {
      navigate('/');
      return;
    }
    
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [countdown, navigate]);
  
  // Get error details
  const isNotFound = error.status === 404;
  const errorTitle = isNotFound 
    ? "页面不存在" 
    : error.statusText || "发生错误";
  const errorMessage = isNotFound
    ? "您访问的页面不存在或已被移除。"
    : error.message || "应用程序遇到了意外错误，请稍后再试。";
  
  // Animation variants
  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1 
      } 
    }
  };
  
  const itemVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 } 
    }
  };
  
  const iconVariants = {
    initial: { scale: 0.8, rotate: 0 },
    animate: { 
      scale: 1, 
      rotate: isNotFound ? [0, -10, 10, -10, 10, 0] : 360, 
      transition: { 
        duration: isNotFound ? 0.5 : 2,
        ease: isNotFound ? "easeInOut" : "linear",
        repeat: isNotFound ? 0 : Infinity,
        repeatType: "loop"
      } 
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="w-full max-w-md"
      >
        <Card className="border-2 overflow-hidden">
          <CardHeader className="text-center pb-2">
            <motion.div 
              className="mx-auto my-4"
              variants={iconVariants}
            >
              {isNotFound ? (
                <FileQuestion className="h-20 w-20 text-muted-foreground" />
              ) : (
                <RefreshCw className="h-20 w-20 text-muted-foreground" />
              )}
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                {isNotFound ? null : <AlertTriangle className="h-5 w-5 text-destructive" />}
                <span>{errorTitle}</span>
              </CardTitle>
            </motion.div>
          </CardHeader>
          
          <CardContent className="text-center">
            <motion.p 
              variants={itemVariants}
              className="text-muted-foreground mb-6"
            >
              {errorMessage}
            </motion.p>
            
            <motion.div 
              variants={itemVariants}
              className="flex flex-col gap-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-2">
                  <HelpCircle size={16} />
                  <span>返回上一页</span>
                </Button>
                
                <Button variant="outline" onClick={() => window.location.reload()} className="flex items-center gap-2">
                  <RefreshCw size={16} />
                  <span>刷新页面</span>
                </Button>
              </div>
              
              <Button asChild className="w-full justify-center flex items-center gap-2">
                <Link to="/">
                  <Home size={16} />
                  <span>返回首页 ({countdown}秒)</span>
                </Link>
              </Button>
            </motion.div>
          </CardContent>
          
          <CardFooter className="flex justify-center border-t py-4">
            <motion.div 
              variants={itemVariants}
              className="flex items-center text-sm text-muted-foreground"
            >
              <Search size={14} className="mr-2" />
              <span>找不到您需要的内容？尝试在首页搜索</span>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

