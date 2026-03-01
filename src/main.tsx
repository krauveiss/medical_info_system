import { createRoot } from 'react-dom/client'
import './index.css'
import { AppRouter } from './app/AppRouter.tsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();
createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <AppRouter></AppRouter>
  </QueryClientProvider>
)
