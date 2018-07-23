if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {  
      navigator.serviceWorker.register('/sw.js').then(registration => {
        // If no Controller, exit early
        if (!navigator.serviceWorker.controller) {
          return;
       }
       // Registration was successful
       console.log('Service Worker registration is successful!');

      let serviceWorker;

        // Service Worker is installing
      if (registration.installing) {
        serviceWorker = registration.installing;
        console.log('installing');
        // Service Worker is waiting
      } else if (registration.waiting) {
          serviceWorker = registration.waiting;
          console.log('waiting');
        // Service Worker is activating
      } else if (registration.active) {
          serviceWorker = registration.active;
          console.log('active');
        // Service Worker is redundant
      } /* else if (registration.redundant) {
            serviceWorker = registration.active;
            console.log('active');
        } */
      if (serviceWorker) {
          serviceWorker.addEventListener('updatefound', () => {
          // A wild service worker has appeared in reg.installing!
          serviceWorker.state;
          serviceWorker.addEventListener('statechange', () => {
            // serviceWorker.state has changed
            if (this.state == "installed") {
               console.log("An update is Ready!");
            } 
              }).catch (function(error) {
                  console.log('Service worker registration failed:', error);
              })
          });
        }
    });
});
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        // A new worker has skipped waiting and become
        // the new active worker.
       if (typeof self.skipWaiting === 'function') {
        window.location.reload();
        }
    });
}