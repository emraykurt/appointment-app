// nuxt.config.js
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],

  // Tamamen statik site oluştur
  nitro: {
    preset: 'static'
  },

  app: {
    head: {
      title: 'Randevu Sistemi',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: 'Basit randevu sistemi uygulaması' }
      ],
    }
  },

  // SPA modu
  ssr: false,

  // TypeScript'i sadece geliştirme ortamında etkinleştir
  typescript: {
    shim: false,
    strict: false,
    typeCheck: false
  },

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'
    }
  },

  compatibilityDate: '2025-02-27'
})