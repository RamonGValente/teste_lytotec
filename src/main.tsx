
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { preloadEssentialData, clearOldCache } from './utils/offlineQueries'

// Initialize PWA and preload essential data
const initializeApp = async () => {
  // Register service worker
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        type: 'module'
      });
      
      console.log('🚀 Service Worker registered successfully:', registration);
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      
      // Preload essential data for offline use
      setTimeout(() => {
        clearOldCache(); // Limpar cache antigo primeiro
        preloadEssentialData();
      }, 2000);
      
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
    }
  }
};

// Initialize the application
const root = createRoot(document.getElementById("root")!)
root.render(<App />)

// Initialize PWA features
initializeApp();
