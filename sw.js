// Version of cache
const CACHE_VERSION = 'restaurant-v1';
// Version of prefetch cache
const CURRENT_CACHES = {
  prefetch: 'prefetch-cache-v' + CACHE_VERSION
};

// Skip Waiting
/* if (typeof self.skipWaiting === 'function') {
  console.log('self.skipWaiting() is supported.');
    self.addEventListener('install', event => {
        event.waitUntil(self.skipWaiting());
    });
} else {
    console.log('self.skipWaiting() is not supported.');
}
*/

// Installing the Service Worker
self.addEventListener('install', event => {
  // Perform install steps
  let now = Date.now();

  // Files to be prefetch cached
  const URLSTOPREFETCH = [
        '/',
        '/index.html',
        '/restaurant.html',
        '/restaurant.html?id=1',
        '/restaurant.html?id=2',
        '/restaurant.html?id=3',
        '/restaurant.html?id=4',
        '/restaurant.html?id=5',
        '/restaurant.html?id=6',
        '/restaurant.html?id=7',
        '/restaurant.html?id=8',
        '/restaurant.html?id=9',
        '/restaurant.html?id=10',
        '/img/',
        '/img/1.jpg',
        '/img/2.jpg',
        '/img/3.jpg',
        '/img/4.jpg',
        '/img/5.jpg',
        '/img/6.jpg',
        '/img/7.jpg',
        '/img/8.jpg',
        '/img/9.jpg',
        '/img/10.jpg',
        '/css/',
        '/css/responsive.css',
        '/css/styles.css',
        '/data/',
        '/data/restaurants.json',
        '/js/',
        '/js/dbhelper.js',
        '/js/main.js',
        '/js/restaurant_info.js',
        '/register.js',
        '/sw.js',
        'https://fonts.googleapis.com/css?family=Open+Sans:100,100i,300,400',
        'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
        'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js'
    ];
    console.log('Handling install event. Resources to prefetch:', URLSTOPREFETCH);

    event.waitUntil(
      caches.open(CURRENT_CACHES.prefetch).then(cache => {
        return cache.addAll(URLSTOPREFETCH).then(() => {
          console.log('All resources have been fetched and cached.');
            // skipWaiting() allows this service worker to 
            // become active immediately, bypassing the waiting 
            // state, even if there's a previous version
            // of the service worker already installed.
            self.skipWaiting();
            });
            let cachePromises = URLSTOPREFETCH.map(URLSTOPREFETCH => {
                // This constructs a new URL object
                // using the service worker's script
                // location as the base for relative URLs.
              let url = new URL(URLSTOPREFETCH, location.href);
                // Precaching resources that are later 
                // used in the fetch handler as
                // responses directly
               url.search += (url.search ? '&' : '?') + 'cache-bust=' + now;
                // use {mode: 'no-cors'} if 
                // the resources being fetched 
                // are served off of a server that 
                // doesn't support CORS
               let request = new Request(url, { mode: 'no-cors' });
                return fetch(request).then(response => {
                    if (response.status >= 400) {
                      throw new Error('request for ' + URLSTOPREFETCH +
                        ' failed with status ' + response.statusText);
                    }
                    // Use the original URL without the 
                    // cache-busting parameter as the key 
                    // for cache.put().
                    return cache.put(URLSTOPREFETCH, response);
                }).catch(error => {
                    console.error('Not caching ' + URLSTOPREFETCH + ' due to ' + error);
                });
            });

            return Promise.all(cachePromises).then( () => {
                console.log('Pre-fetching complete.');
            });
        }).catch(error => {
            console.error('Pre-fetching failed:', error);
        })
    );
});

/* if (self.clients && (typeof self.clients.claim === 'function')) {
  console.log('self.clients.claim() is supported.');
  self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
  });
} else {
  console.log('self.clients.claim() is not supported.');
}
*/
// Activating the Service Worker
self.addEventListener('activate', event => {
  // clients.claim() tells the active service worker to take immediate
  // control of all of the clients under its scope.
  self.clients.claim();
  // Delete all caches that aren't named in CURRENT_CACHES.
  let expectedCacheNames = Object.keys(CURRENT_CACHES).map(key => {
        return CURRENT_CACHES[key];
    }); 

    // Perform activation steps
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                  if (expectedCacheNames.indexOf(cacheName) === -1) {
                    // If this cache name isn't present in the array of "expected" cache names,
                    // then delete it.
                    console.log('Deleting out of date cache:', cacheName);
                    return caches.delete(cacheName);
                  }
                })
            );
        })
    );
});

// Fetching cache from the Service Worker
self.addEventListener('fetch', event => {
  console.log('Handling fetch event for', event.request.url);
    // Perform fetch steps
  event.respondWith(
    caches.match(event.request).then(response => {
       // Cache found - return response
       if (response)
           console.log('ServiceWorker returning cache response:', response);
         return response;

         console.log('No response found in cache. About to fetch from network...');

          return fetch(event.request).then(response => {
              console.log('Response from network is:', response);

              return response;
          }).catch(error => {
              // This catch() will handle exceptions thrown from the fetch() operation.
              console.error('Fetching failed:', error);

              throw error;
          });
            // Clone the request
            let fetchRequest = event.request.clone();

              return fetch(fetchRequest).then(response => {
              if (!response || response.status !== 200 || response.type !== 'basic') {
                cache.put(request, response);
                return response;
              }
                // Clone the response
              let responseToCache = response.clone();
                caches.open(CACHE_VERSION).then(cache => {
                    cache.put(event.request, responseToCache);
                });

                if (response.status < 400) {
                  cache.put(event.request, response.clone());
                }

                // Return the original response object, 
                // which will be used to fulfill the 
                // resource request.
                return response;
            }
            );
        })
    );
});

// Skip the waiting phase
/* self.addEventListener("message", event => {
    if(event.data.action == "skipWaiting") {
        self.skipWaiting();
        return;
    }
}); */