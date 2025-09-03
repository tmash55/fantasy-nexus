export function getRedirectUrl() {
    // Get the base URL from environment variable or window.location.origin
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    
    // Use existing API callback route
    return `${baseUrl}/api/auth/callback`;
  }
  
  export function getBaseUrl() {
    return process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
  } 