// Utility to detect which domain we're on
export function getDomainType(): 'chat' | 'landing' {
  if (typeof window === 'undefined') return 'chat';
  
  const hostname = window.location.hostname;
  
  // If we're on chat.throp.ai, show chat directly
  if (hostname.includes('chat.')) return 'chat';
  
  // If we're on throp.ai main domain, show landing
  if (hostname === 'throp.ai') return 'landing';
  
  // Default to chat for localhost, netlify.app, etc.
  return 'chat';
}

export function shouldAutoShowChat(): boolean {
  return getDomainType() === 'chat';
}
