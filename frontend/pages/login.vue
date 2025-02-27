<template>
    <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Randevu Sistemine Giriş
          </h2>
        </div>
        <form class="mt-8 space-y-6" @submit.prevent="login">
          <div class="rounded-md shadow-sm -space-y-px">
            <div>
              <label for="email" class="sr-only">E-posta</label>
              <input
                id="email"
                v-model="loginData.email"
                name="email"
                type="email"
                required
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="E-posta adresi"
              />
            </div>
            <div>
              <label for="password" class="sr-only">Şifre</label>
              <input
                id="password"
                v-model="loginData.password"
                name="password"
                type="password"
                required
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Şifre"
              />
            </div>
          </div>
  
          <div>
            <button
              type="submit"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              :disabled="loading"
            >
              <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              Giriş Yap
            </button>
          </div>
          
          <div v-if="errorMessage" class="text-red-600 text-center">
            {{ errorMessage }}
          </div>
          
          <div class="text-center mt-4">
            <p>Hesabınız yok mu? <NuxtLink to="/register" class="text-blue-600 hover:underline">Kayıt Olun</NuxtLink></p>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script>
export default {
    data() {
      return {
        loginData: {
          email: '',
          password: ''
        },
        loading: false,
        errorMessage: ''
      };
    },
    created() {
    // useRuntimeConfig() Nuxt 3'te global olarak erişilebilir
    this.apiUrl = useRuntimeConfig().public.apiBaseUrl;
  },
    

    methods: {
      async login() {
        this.loading = true;
        this.errorMessage = '';
        
        try {
          const response = await fetch(`${this.apiUrl}/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.loginData)
          });
  
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.msg || 'Giriş başarısız');
          }
  
          // Token'ı localStorage'a kaydet
          localStorage.setItem('token', data.token);
          
          // Ana sayfaya yönlendir
          this.$router.push('/');
          
          // Sayfa yenileme (token'ın okunması için)
          setTimeout(() => {
            window.location.reload();
          }, 300);
        } catch (error) {
          this.errorMessage = error.message;
          console.error('Giriş hatası:', error);
        } finally {
          this.loading = false;
        }
      }
    }
  };
  </script>