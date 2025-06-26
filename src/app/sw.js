const CACHE_NAME = 'manus-fisio-v1.0.0'
const STATIC_CACHE = 'manus-fisio-static-v1.0.0'
const DYNAMIC_CACHE = 'manus-fisio-dynamic-v1.0.0'

// Recursos para cache estático
const STATIC_ASSETS = [
  '/',
  '/notebooks',
  '/projects',
  '/team',
  '/calendar',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// Recursos para cache dinâmico (páginas visitadas)
const DYNAMIC_ASSETS = [
  '/api/notebooks',
  '/api/projects',
  '/api/users',
  '/api/tasks'
]

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('Service Worker: Static assets cached')
        return self.skipWaiting()
      })
  )
})

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker: Activated')
        return self.clients.claim()
      })
  )
})

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Ignorar requisições não-HTTP
  if (!request.url.startsWith('http')) return

  // Estratégia Cache First para recursos estáticos
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request)
        .then(response => {
          return response || fetch(request)
        })
    )
    return
  }

  // Estratégia Network First para API calls
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Se a resposta for válida, cache ela
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(request, responseClone)
              })
          }
          return response
        })
        .catch(() => {
          // Se falhar, tente o cache
          return caches.match(request)
            .then(response => {
              if (response) {
                return response
              }
              // Retorna resposta offline para APIs
              return new Response(
                JSON.stringify({
                  error: 'Offline',
                  message: 'Dados não disponíveis offline',
                  offline: true
                }),
                {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: { 'Content-Type': 'application/json' }
                }
              )
            })
        })
    )
    return
  }

  // Estratégia Stale While Revalidate para páginas
  event.respondWith(
    caches.match(request)
      .then(response => {
        const fetchPromise = fetch(request)
          .then(networkResponse => {
            // Atualiza o cache com a nova resposta
            if (networkResponse.status === 200) {
              const responseClone = networkResponse.clone()
              caches.open(DYNAMIC_CACHE)
                .then(cache => {
                  cache.put(request, responseClone)
                })
            }
            return networkResponse
          })
          .catch(() => {
            // Se falhar e não tiver cache, retorna página offline
            if (!response) {
              return caches.match('/')
                .then(fallback => {
                  return fallback || new Response(
                    `<!DOCTYPE html>
                    <html>
                    <head>
                      <title>Offline - Manus Fisio</title>
                      <meta charset="utf-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1">
                      <style>
                        body { 
                          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                          background: #0f172a; 
                          color: #f8fafc; 
                          display: flex; 
                          align-items: center; 
                          justify-content: center; 
                          height: 100vh; 
                          margin: 0;
                          text-align: center;
                        }
                        .offline-container {
                          max-width: 400px;
                          padding: 2rem;
                        }
                        .offline-icon {
                          font-size: 4rem;
                          margin-bottom: 1rem;
                        }
                        .offline-title {
                          font-size: 1.5rem;
                          font-weight: 600;
                          margin-bottom: 0.5rem;
                        }
                        .offline-message {
                          color: #cbd5e1;
                          margin-bottom: 1.5rem;
                        }
                        .retry-button {
                          background: #3b82f6;
                          color: white;
                          border: none;
                          padding: 0.75rem 1.5rem;
                          border-radius: 0.5rem;
                          cursor: pointer;
                          font-size: 1rem;
                        }
                        .retry-button:hover {
                          background: #2563eb;
                        }
                      </style>
                    </head>
                    <body>
                      <div class="offline-container">
                        <div class="offline-icon">📱</div>
                        <h1 class="offline-title">Você está offline</h1>
                        <p class="offline-message">
                          Verifique sua conexão com a internet e tente novamente.
                        </p>
                        <button class="retry-button" onclick="window.location.reload()">
                          Tentar Novamente
                        </button>
                      </div>
                    </body>
                    </html>`,
                    {
                      headers: { 'Content-Type': 'text/html' }
                    }
                  )
                })
            }
          })

        // Retorna cache se disponível, senão aguarda network
        return response || fetchPromise
      })
  )
})

// Notificações Push
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received')
  
  if (event.data) {
    const data = event.data.json()
    
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: data.tag || 'manus-fisio-notification',
      data: data.data || {},
      actions: [
        {
          action: 'open',
          title: 'Abrir',
          icon: '/icons/icon-96x96.png'
        },
        {
          action: 'close',
          title: 'Fechar'
        }
      ],
      requireInteraction: data.requireInteraction || false,
      silent: false,
      vibrate: [200, 100, 200]
    }

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked')
  
  event.notification.close()

  if (event.action === 'open') {
    const urlToOpen = event.notification.data?.url || '/'
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(clientList => {
          // Se já há uma janela aberta, foca nela
          for (let i = 0; i < clientList.length; i++) {
            const client = clientList[i]
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus()
            }
          }
          
          // Senão, abre nova janela
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen)
          }
        })
    )
  }
})

// Sincronização em background
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync')
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Sincronizar dados pendentes quando voltar online
      syncPendingData()
    )
  }
})

// Função para sincronizar dados pendentes
async function syncPendingData() {
  try {
    // Buscar dados pendentes no IndexedDB ou cache
    const pendingData = await getPendingData()
    
    if (pendingData.length > 0) {
      console.log('Service Worker: Syncing pending data')
      
      for (const data of pendingData) {
        try {
          await fetch(data.url, {
            method: data.method,
            headers: data.headers,
            body: JSON.stringify(data.body)
          })
          
          // Remove dados sincronizados
          await removePendingData(data.id)
        } catch (error) {
          console.error('Service Worker: Sync failed for:', data.url)
        }
      }
    }
  } catch (error) {
    console.error('Service Worker: Background sync failed:', error)
  }
}

// Funções auxiliares para dados pendentes (implementar com IndexedDB)
async function getPendingData() {
  // Implementar busca no IndexedDB
  return []
}

async function removePendingData(id) {
  // Implementar remoção no IndexedDB
  console.log('Removing pending data:', id)
} 