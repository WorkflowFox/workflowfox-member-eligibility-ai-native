import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './styles/industry.css';
import './styles/app.css';

// Technical failures surface a "Try again" button (spec §14.2), so no
// automatic retries — the representative decides when to re-run.
const queryClient = new QueryClient({
  defaultOptions: { mutations: { retry: false } },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
