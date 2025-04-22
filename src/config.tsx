import { Home, Settings, Calendar, AlertTriangle } from "lucide-react";
import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";

// Use React.lazy for code splitting
const App = lazy(() => import("./App"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const ErrorPage = lazy(() => import("./pages/ErrorPage"));

// Custom error boundary component
function ErrorBoundary() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md space-y-4 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="text-2xl font-semibold">哎呀，出错了</h1>
        <p className="text-muted-foreground">应用程序发生了错误，请刷新页面重试。</p>
        <div className="flex justify-center gap-4">
          <a href="/" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            返回主页
          </a>
        </div>
      </div>
    </div>
  );
}

// Loading component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

export const ROUTER_ITEMS = createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <App />
          </Suspense>
        ),
      },
      {
        path: "/settings",
        element: (
          <Suspense fallback={<PageLoader />}>
            <SettingsPage />
          </Suspense>
        ),
      },
      {
        path: "*",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ErrorPage />
          </Suspense>
        ),
      },
    ],
  },
]);

export const MENU_ITEMS = [
  {
    title: "首页",
    path: "/",
    icon: Home,
  },
  {
    title: "番组日历",
    path: "/calendar",
    icon: Calendar,
  },
  {
    title: "设置",
    path: "/settings",
    icon: Settings,
  },
];
