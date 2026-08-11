// Vercel Speed Insights integration
// This module loads and initializes Speed Insights from CDN
(function() {
  'use strict';
  
  // Only load Speed Insights in production (when hosted on Vercel)
  // It won't track data in development/localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('Speed Insights: Skipping in development mode');
    return;
  }
  
  // Dynamically import Speed Insights from CDN
  const script = document.createElement('script');
  script.type = 'module';
  script.textContent = `
    import { injectSpeedInsights } from 'https://cdn.jsdelivr.net/npm/@vercel/speed-insights@1/dist/index.mjs';
    injectSpeedInsights();
  `;
  
  // Append to document head
  document.head.appendChild(script);
})();
