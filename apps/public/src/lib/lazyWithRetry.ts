import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

/**
 * Wraps React.lazy() with automatic page reload on chunk load failure.
 *
 * After a new deployment, cached chunk URLs may 404. This wrapper detects
 * the failure and reloads the page once to force fetching fresh chunks.
 * A sessionStorage flag prevents infinite reload loops.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): LazyExoticComponent<T> {
  return lazy(async () => {
    const hasRefreshed = sessionStorage.getItem('chunk-refresh') === 'true';
    try {
      const component = await factory();
      sessionStorage.removeItem('chunk-refresh');
      return component;
    } catch (error) {
      if (!hasRefreshed) {
        sessionStorage.setItem('chunk-refresh', 'true');
        window.location.reload();
        // Prevent rendering while reload is in progress
        return new Promise<{ default: T }>(() => {});
      }
      // Second failure after reload → let ErrorBoundary handle it
      throw error;
    }
  });
}
