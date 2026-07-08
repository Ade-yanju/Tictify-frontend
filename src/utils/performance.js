/**
 * Performance Monitoring & Optimization Utilities
 */

// Core Web Vitals monitoring
export const monitorWebVitals = () => {
  if ("web-vital" in window) {
    // Largest Contentful Paint (LCP)
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === "largest-contentful-paint") {
          const lcp = entry.startTime;
          recordMetric("web_vital_lcp", lcp);

          if (lcp > 2500) {
            console.warn(`Slow LCP: ${lcp}ms`);
          }
        }
      }
    });

    observer.observe({ entryTypes: ["largest-contentful-paint"] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          recordMetric("web_vital_cls", clsValue);

          if (clsValue > 0.1) {
            console.warn(`High CLS: ${clsValue}`);
          }
        }
      }
    });

    clsObserver.observe({ entryTypes: ["layout-shift"] });

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fid = entry.processingDuration;
        recordMetric("web_vital_fid", fid);

        if (fid > 100) {
          console.warn(`Slow FID: ${fid}ms`);
        }
      }
    });

    fidObserver.observe({ entryTypes: ["first-input"] });
  }
};

// Record custom metrics
export const recordMetric = (name, value, unit = "ms") => {
  const metric = {
    name,
    value,
    unit,
    timestamp: Date.now(),
    url: window.location.href,
  };

  // Store in sessionStorage for analytics
  try {
    const existing = JSON.parse(sessionStorage.getItem("_metrics") || "[]");
    existing.push(metric);
    sessionStorage.setItem("_metrics", JSON.stringify(existing.slice(-100)));
  } catch (error) {
    console.error("Failed to record metric", error);
  }

  // Send to analytics if configured
  if (window.__ANALYTICS__) {
    window.__ANALYTICS__.recordEvent("performance_metric", metric);
  }
};

// Lazy load images
export const lazyLoadImages = () => {
  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.add("loaded");
          imageObserver.unobserve(img);
        }
      });
    });

    document.querySelectorAll("img[data-src]").forEach((img) => {
      imageObserver.observe(img);
    });
  }
};

// Route-based code splitting
export const preloadRoute = (routePath) => {
  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = routePath;
  document.head.appendChild(link);
};

// Component performance profiling
export const withPerformanceMetrics = (Component, componentName) => {
  return (props) => {
    const startTime = performance.now();

    return Component(props, () => {
      const endTime = performance.now();
      recordMetric(`component_render_${componentName}`, endTime - startTime);
    });
  };
};

// Memory usage monitoring
export const monitorMemory = () => {
  if (performance.memory) {
    setInterval(() => {
      const used = performance.memory.usedJSHeapSize;
      const limit = performance.memory.jsHeapSizeLimit;
      const percentage = (used / limit) * 100;

      recordMetric("memory_usage_percent", percentage);

      if (percentage > 90) {
        console.warn(`High memory usage: ${percentage.toFixed(2)}%`);
      }
    }, 30000); // Every 30 seconds
  }
};

// API request monitoring
export const monitorAPICall = async (url, options = {}) => {
  const startTime = performance.now();

  try {
    const response = await fetch(url, options);
    const endTime = performance.now();
    const duration = endTime - startTime;

    recordMetric(`api_${options.method || "GET"}`, duration);

    if (duration > 3000) {
      console.warn(`Slow API request to ${url}: ${duration}ms`);
    }

    return response;
  } catch (error) {
    const endTime = performance.now();
    recordMetric(`api_error`, endTime - startTime);
    throw error;
  }
};

// Batch DOM updates
export const batchDOMUpdates = (updates) => {
  requestAnimationFrame(() => {
    updates.forEach((update) => update());
  });
};

// Debounce helper
export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle helper
export const throttle = (func, limit) => {
  let lastRun = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastRun >= limit) {
      func(...args);
      lastRun = now;
    }
  };
};

// Intersection Observer helper
export const observeElement = (element, callback, options = {}) => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        callback(entry);
      }
    },
    { threshold: 0.1, ...options }
  );

  observer.observe(element);
  return observer;
};

// Enable performance monitoring
export const enablePerformanceMonitoring = () => {
  monitorWebVitals();
  lazyLoadImages();
  monitorMemory();

  logger.info("Performance monitoring enabled");
};

export default {
  monitorWebVitals,
  recordMetric,
  lazyLoadImages,
  preloadRoute,
  withPerformanceMetrics,
  monitorMemory,
  monitorAPICall,
  batchDOMUpdates,
  debounce,
  throttle,
  observeElement,
  enablePerformanceMonitoring,
};
