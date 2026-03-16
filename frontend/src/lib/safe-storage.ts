export function safeGetItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  
  export function safeSetItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // localStorage may be full or unavailable (private browsing, etc.)
    }
  }
  
  export function safeRemoveItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // localStorage may be unavailable
    }
  }
  
  // In-memory token cache to avoid localStorage reads on every request
  let cachedToken: string | null = null;
  
  export function getCachedToken(): string | null {
    if (cachedToken !== null) return cachedToken;
    cachedToken = safeGetItem("authToken");
    return cachedToken;
  }
  
  export function setCachedToken(token: string): void {
    cachedToken = token;
    safeSetItem("authToken", token);
  }
  
  export function clearCachedToken(): void {
    cachedToken = null;
    safeRemoveItem("authToken");
  }