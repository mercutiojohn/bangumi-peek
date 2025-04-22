import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { ErrorBoundary } from 'react-error-boundary';

// Import global styles
import './index.css';

// Import router configuration
import { ROUTER_ITEMS } from './config';

// Fallback error component
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
    <h2 className="text-2xl font-bold text-destructive mb-4">出错了</h2>
    <p className="text-muted-foreground mb-4">应用程序遇到了意外错误：</p>
    <pre className="bg-muted p-4 rounded-md overflow-auto mb-4 max-w-full">
      {error.message}
    </pre>
    <button
      onClick={resetErrorBoundary}
      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
    >
      重试
    </button>
  </div>
);

// Log error details in development mode
const logError = (error: Error, info: { componentStack: string }) => {
  if (import.meta.env.DEV) {
    console.error('应用程序错误:', error);
    console.error('组件堆栈:', info.componentStack);
  }
};

// Create the app container
const container = document.getElementById('root');

if (!container) {
  throw new Error('找不到根元素，无法挂载应用程序');
}

const root = createRoot(container);

root.render(
  <StrictMode>
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={logError}
      onReset={() => {
        // Reset the app state or refresh the page
        window.location.href = '/';
      }}
    >
      <RouterProvider router={ROUTER_ITEMS} />
    </ErrorBoundary>
  </StrictMode>
);

// Enable hot module replacement in development
if (import.meta.env.DEV && import.meta.hot) {
  import.meta.hot.accept();
}
