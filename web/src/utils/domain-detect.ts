// Utility to detect which domain we're on
export function getDomainType(): 'chat' | 'landing' | 'local' {
  if (typeof window === 'undefined') return 'local';
  
  const hostname = window.location.hostname;
  
  // If we're on chat.throp.ai, show chat directly
  if (hostname === 'chat.throp.ai') return 'chat';
  
  // If we're on throp.ai main domain, show landing
  if (hostname === 'throp.ai') return 'landing';
  
  // Default to local for localhost, netlify.app, etc.
  // Local allows switching between landing and chat
  return 'local';
}

export function shouldAutoShowChat(): boolean {
  return getDomainType() === 'chat';
}

export function canNavigateBetweenPages(): boolean {
  // Only allow navigation between pages on local/dev environments
  return getDomainType() === 'local';
}

export function getChatUrl(): string {
  const domainType = getDomainType();
  
  if (domainType === 'landing') {
    // If on throp.ai, redirect to chat.throp.ai
    return 'https://chat.throp.ai';
  }
  
  // For local or already on chat, stay on same domain
  return '/';
}

export function getLandingUrl(): string {
  const domainType = getDomainType();
  
  if (domainType === 'chat') {
    // If on chat.throp.ai, redirect to throp.ai
    return 'https://throp.ai';
  }
  
  // For local, stay on same domain
  return '/';
}