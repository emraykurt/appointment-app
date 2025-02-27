<template>
  <div>
    
    <nav v-if="showNavbar" class="bg-blue-600 text-white p-4">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <NuxtLink to="/" class="font-bold text-xl">Randevu Sistemi</NuxtLink>
        <div v-if="isLoggedIn" class="flex items-center space-x-4">
          <span>{{ userData.username || 'Kullanıcı' }}</span>
          <button @click="logout" class="bg-red-500 hover:bg-red-600 py-1 px-3 rounded">Çıkış Yap</button>
        </div>
        <div v-else class="space-x-4">
          <NuxtLink to="/login" class="hover:underline">Giriş Yap</NuxtLink>
          <NuxtLink to="/register" class="bg-white text-blue-600 hover:bg-gray-100 py-1 px-3 rounded">Kayıt Ol</NuxtLink>
        </div>
      </div>
    </nav>
    
    
    <NuxtPage />
  </div>
</template>

<script>
const apiUrl = process.env.API_BASE_URL || 'http://localhost:3001/api';
export default {
  name: 'App',
  data() {
    return {
      isLoggedIn: false,
      userRole: 'user',
      showNavbar: true,
      token: null,
      userData: {
        username: '',
        email: '',
        role: 'user'
      }
    }
  },
  mounted() {
    // Sayfaya girişte token ve giriş durumunu kontrol et
    this.checkLoginStatus()
    
    // Ana sayfaya yönlendirme için hemen kontrol
    const token = localStorage.getItem('token')
    const currentPath = this.$router.currentRoute.value.path
    
    // Eğer ana sayfadaysa ve token yoksa, login sayfasına yönlendir
    if (currentPath === '/' && !token) {
      this.$router.push('/login')
    }
    
    // Tüm sayfa değişikliklerinde token kontrolü
    this.$router.beforeEach((to, from, next) => {
      // login ve register sayfaları için kontrol yapmaya gerek yok
      if (to.path === '/login' || to.path === '/register') {
        this.showNavbar = true
        return next()
      }
      
      // Ana sayfa veya korunan sayfalar için giriş kontrolü
      const token = localStorage.getItem('token')
      if (!token && to.path !== '/login' && to.path !== '/register') {
        return next('/login')
      }
      
      next()
    })
  },
  methods: {
    async checkLoginStatus() {
      this.token = localStorage.getItem('token')
      this.isLoggedIn = !!this.token
      
      if (this.isLoggedIn) {
        this.decodeUserRole()
        await this.fetchUserData() // Kullanıcı verisini al
      }
    },
    decodeUserRole() {
      try {
        // Token'dan role bilgisini çıkar
        const base64Url = this.token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        }).join(''))

        const payload = JSON.parse(jsonPayload)
        this.userRole = payload.role || 'user'
      } catch (error) {
        console.error('Token decode edilemedi:', error)
        this.userRole = 'user' // Hata durumunda varsayılan olarak user rol
      }
    },
    async fetchUserData() {
      try {
        const response = await fetch(`${apiUrl}/user`, {
          method: 'GET',
          headers: {
            'Authorization': this.token,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          throw new Error('Kullanıcı bilgileri alınamadı')
        }
        
        this.userData = await response.json()
      } catch (error) {
        console.error('Kullanıcı verisi çekilirken hata:', error)
      }
    },
    logout() {
      localStorage.removeItem('token')
      this.isLoggedIn = false
      this.token = null
      this.userRole = 'user'
      this.userData = {
        username: '',
        email: '',
        role: 'user'
      }
      this.$router.push('/login')
    }
  }
}
</script>