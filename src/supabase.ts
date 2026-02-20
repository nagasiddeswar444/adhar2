// Supabase has been replaced with Node.js backend
// Import the API client instead
import { api } from './lib/api'

// Export API as default for backward compatibility
export { api as supabase }

// Helper function to check if API is configured
export const isSupabaseConfigured = () => {
  return true // API is always available when server is running
}

// For backward compatibility - export the same interface
export const isConfigured = isSupabaseConfigured
