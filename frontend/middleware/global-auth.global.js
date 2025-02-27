// middleware/auth.js
export default defineNuxtRouteMiddleware((to, from) => {
    // Sadece client tarafında çalış (tarayıcıda)
    if (process.client) {
      const token = localStorage.getItem('token')
      
      // Token yoksa ve login/register sayfalarında değilse yönlendir
      if (!token && to.path !== '/login' && to.path !== '/register') {
        return navigateTo('/login')
      }
    }
  })