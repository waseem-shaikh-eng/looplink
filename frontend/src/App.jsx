import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './shared/lib/toast';
import DashboardPage from './features/campaigns/pages/DashboardPage';
import CampaignListPage from './features/campaigns/pages/CampaignListPage';
import CreateCampaignPage from './features/campaigns/pages/CreateCampaignPage';
import CampaignEditPage from './features/campaigns/pages/CampaignEditPage';
import CampaignDistributionPage from './features/campaigns/pages/CampaignDistributionPage';
import LandingPage from './features/enrollment/pages/LandingPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/builder" replace />} />
            <Route path="/builder" element={<DashboardPage />} />
            <Route path="/builder/campaigns" element={<CampaignListPage />} />
            <Route path="/builder/campaigns/new" element={<CreateCampaignPage />} />
            <Route path="/builder/campaigns/:id" element={<CampaignEditPage />} />
            <Route path="/builder/campaigns/:id/distribution" element={<CampaignDistributionPage />} />
            <Route path="/c/:token" element={<LandingPage />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}
