import { useFreighter } from './useFreighter'

export const useWalletAuth = () => {
  const { isWalletConnected, isFreighterAvailable } = useFreighter()

  /**
   * Check if user is authenticated with wallet
   * @returns boolean indicating if user is authenticated
   */
  const isAuthenticated = () => {
    return isFreighterAvailable.value && isWalletConnected.value
  }

  /**
   * Redirect to index page if not authenticated
   * @param showMessage - whether to show a console message
   */
  const requireAuth = (showMessage = true) => {
    if (!isAuthenticated()) {
      if (showMessage) {
        console.log('🔒 Authentication required, redirecting to index')
      }
      navigateTo('/')
      return false
    }
    return true
  }

  /**
   * Check authentication and redirect if needed
   * This is a reactive check that can be used in components
   */
  const checkAuth = () => {
    if (typeof window !== 'undefined' && !isAuthenticated()) {
      console.log('🔒 Authentication check failed, redirecting to index')
      navigateTo('/')
      return false
    }
    return true
  }

  return {
    isAuthenticated,
    requireAuth,
    checkAuth
  }
}
