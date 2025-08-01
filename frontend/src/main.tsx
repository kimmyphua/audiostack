import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { TOAST_CONFIG } from './constants';
import './index.css';
import './styles/globals.scss';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <App />
      <Toaster
        position={TOAST_CONFIG.position}
        toastOptions={{
          duration: TOAST_CONFIG.duration,
          style: TOAST_CONFIG.style,
        }}
      />
    </BrowserRouter>
  </QueryClientProvider>
);
