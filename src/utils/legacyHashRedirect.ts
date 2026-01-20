/**
 * Legacy Hash Redirect Utility
 * 
 * Handles migration from HashRouter (#/path) to BrowserRouter (/path).
 * Runs once on initial page load before React mounts.
 * 
 * If a user visits an old hash URL like https://neurowiki.ai/#/calculators/aspects,
 * this will redirect to https://neurowiki.ai/calculators/aspects (preserving query strings).
 */

export const handleLegacyHashRedirect = (): void => {
  // Only run on initial load, before React mounts
  if (typeof window === 'undefined') return;

  const hash = window.location.hash;
  
  // Check if there's a hash path (legacy routing)
  if (hash && hash.startsWith('#/')) {
    // Extract the path after '#'
    const hashPath = hash.substring(1); // e.g., "/calculators/aspects" or "/calculators?id=nihss"
    
    // Parse the URL to preserve query strings from hash
    const [pathname, hashSearch] = hashPath.split('?');
    
    // Merge hash query params with existing search params (hash takes precedence)
    const existingParams = new URLSearchParams(window.location.search);
    const hashParams = hashSearch ? new URLSearchParams(hashSearch) : null;
    
    // Build new search string
    let newSearch = '';
    if (hashParams && hashParams.toString()) {
      newSearch = '?' + hashParams.toString();
    } else if (existingParams.toString()) {
      newSearch = '?' + existingParams.toString();
    }
    
    // Build the new URL
    const newUrl = `${window.location.origin}${pathname}${newSearch}`;
    
    // Use replace to avoid creating a history entry (prevents back-button loops)
    window.location.replace(newUrl);
  }
};
