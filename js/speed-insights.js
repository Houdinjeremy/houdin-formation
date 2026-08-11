/**
 * Vercel Speed Insights Integration
 * This script initializes Vercel Speed Insights for tracking Web Vitals metrics.
 * Documentation: https://vercel.com/docs/speed-insights
 */
(function() {
  'use strict';
  
  // Initialize the Speed Insights queue
  function initQueue() {
    if (window.si) return;
    window.si = function() {
      (window.siq = window.siq || []).push(arguments);
    };
  }
  
  // Check if we're in a browser environment
  function isBrowser() {
    return typeof window !== 'undefined';
  }
  
  // Detect environment (development vs production)
  function isDevelopment() {
    try {
      // Check if we're running on localhost or development domains
      return window.location.hostname === 'localhost' || 
             window.location.hostname === '127.0.0.1' ||
             window.location.hostname.includes('preview');
    } catch (e) {
      return false;
    }
  }
  
  // Get the appropriate script source
  function getScriptSrc() {
    if (isDevelopment()) {
      return 'https://va.vercel-scripts.com/v1/speed-insights/script.debug.js';
    }
    return '/_vercel/speed-insights/script.js';
  }
  
  // Main injection function
  function injectSpeedInsights(options) {
    options = options || {};
    
    if (!isBrowser()) {
      return null;
    }
    
    // Initialize the queue before the script loads
    initQueue();
    
    var src = getScriptSrc();
    
    // Don't inject twice
    if (document.head.querySelector('script[src*="' + src + '"]')) {
      return null;
    }
    
    // Create and configure the script element
    var script = document.createElement('script');
    script.src = src;
    script.defer = true;
    
    // Add SDK metadata
    script.setAttribute('data-sdkn', '@vercel/speed-insights/web');
    script.setAttribute('data-sdkv', '2.0.0');
    
    // Add optional configuration
    if (options.sampleRate) {
      script.setAttribute('data-sample-rate', options.sampleRate.toString());
    }
    
    if (options.debug !== undefined) {
      script.setAttribute('data-debug', options.debug.toString());
    }
    
    // Error handling
    script.onerror = function() {
      console.warn(
        '[Vercel Speed Insights] Failed to load script from ' + src + '. ' +
        'Please check if any content blockers are enabled and try again.'
      );
    };
    
    // Inject the script
    document.head.appendChild(script);
    
    return script;
  }
  
  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      injectSpeedInsights({
        debug: isDevelopment()
      });
    });
  } else {
    // DOM is already loaded
    injectSpeedInsights({
      debug: isDevelopment()
    });
  }
  
  // Export for manual usage if needed
  window.vercelSpeedInsights = {
    inject: injectSpeedInsights
  };
})();
