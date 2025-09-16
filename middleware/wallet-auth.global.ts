export default defineNuxtRouteMiddleware((to) => {
  // Skip middleware on server-side
  if (typeof window === 'undefined') return

  // Allow access to index page without wallet connection
  if (to.path === '/' || to.path === '/index') {
    return
  }

  // Check if Freighter extension is available
  if (!window.freighterApi) {
    console.log('🔒 Freighter not available, redirecting to index')
    return navigateTo('/')
  }

  // Check if wallet is connected using the Freighter API
  const checkWalletConnection = async () => {
    try {
      if (!window.freighterApi) {
        console.log('🔒 Freighter API not available')
        return navigateTo('/')
      }

      const isConnected = await window.freighterApi.isConnected()
      if (!isConnected.isConnected) {
        console.log('🔒 Wallet not connected, redirecting to index')
        return navigateTo('/')
      }
      
      // Additional check: try to get the address to ensure we have access
      const addressResult = await window.freighterApi.getAddress()
      if (addressResult.error || !addressResult.address) {
        console.log('🔒 No wallet address available, redirecting to index')
        return navigateTo('/')
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error)
      return navigateTo('/')
    }
  }

  // Run the check
  checkWalletConnection()
})
