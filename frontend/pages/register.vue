<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Yeni Hesap Oluştur
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="register">
        <!-- Hata mesajı kutusu -->
        <div v-if="errorMessage" class="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">
                {{ errorMessage }}
              </p>
            </div>
          </div>
        </div>
        
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="username" class="sr-only">Kullanıcı Adı</label>
            <input
              id="username"
              v-model="registerData.username"
              name="username"
              type="text"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Kullanıcı Adı"
            />
          </div>
          <div>
            <label for="email" class="sr-only">E-posta</label>
            <input
              id="email"
              v-model="registerData.email"
              name="email"
              type="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="E-posta adresi"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Şifre</label>
            <input
              id="password"
              v-model="registerData.password"
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
            Kayıt Ol
          </button>
        </div>
        
        <div v-if="successMessage" class="bg-green-50 border-l-4 border-green-500 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-green-700">
                {{ successMessage }}
              </p>
            </div>
          </div>
        </div>
        
        <div class="text-center">
          <router-link to="/login" class="text-blue-600 hover:text-blue-800">
            Zaten hesabınız var mı? Giriş yapın
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      registerData: {
        username: '',
        email: '',
        password: '',
        role: 'user' // Varsayılan olarak normal kullanıcı
      },
      loading: false,
      errorMessage: '',
      successMessage: ''
    };
  },
  created() {
    this.apiUrl = useRuntimeConfig().public.apiBaseUrl;
  },
  methods: {
    async register() {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';
      
      try {
        const response = await fetch(`${this.apiUrl}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.registerData)
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Kayıt başarısız');
        }

        this.successMessage = 'Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...';
        
        // Bilgileri temizle
        this.registerData = {
          username: '',
          email: '',
          password: '',
          role: 'user'
        };
        
        // Giriş sayfasına yönlendir
        setTimeout(() => {
          this.$router.push('/login');
        }, 2000);
      } catch (error) {
        this.errorMessage = error.message;
        console.error('Kayıt hatası:', error);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>