
import { useState, useEffect } from 'react';

export const usePWAUpdate = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Registrar o service worker
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('PWA: Service Worker registrado');
          setRegistration(reg);

          // Verificar por updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              console.log('PWA: Nova versão encontrada');
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('PWA: Update disponível');
                  setUpdateAvailable(true);
                }
              });
            }
          });

          // Verificar updates periodicamente
          setInterval(() => {
            reg.update();
          }, 60000); // Verificar a cada minuto
        })
        .catch((error) => {
          console.error('PWA: Erro ao registrar Service Worker:', error);
        });

      // Listener para quando um novo service worker assume o controle
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('PWA: Nova versão ativada');
        setUpdateAvailable(false);
      });
    }
  }, []);

  const applyUpdate = async () => {
    if (registration && registration.waiting) {
      // Enviar mensagem para o service worker waiting para assumir o controle
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Recarregar a página para aplicar a atualização
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return {
    updateAvailable,
    applyUpdate
  };
};
