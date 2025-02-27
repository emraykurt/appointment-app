<template>
    <transition name="modal-fade">
      <div v-if="isVisible" class="fixed inset-0 flex items-center justify-center z-50 overflow-hidden">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black bg-opacity-50" @click="closeOnBackdrop ? $emit('close') : null"></div>
        
        <!-- Modal -->
        <div class="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-md mx-4 z-10">
          <!-- Header -->
          <div class="px-6 py-4 border-b" :class="headerClass">
            <h3 class="text-lg font-medium" :class="titleClass">{{ title }}</h3>
          </div>
          
          <!-- Content -->
          <div class="px-6 py-4 max-h-[60vh] overflow-y-auto">
            <p class="text-gray-700">{{ message }}</p>
            <slot></slot>
          </div>
          
          <!-- Footer -->
          <div class="px-6 py-3 bg-gray-50 flex justify-end space-x-3">
            <button 
              v-if="showCancelButton" 
              @click="$emit('close')" 
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {{ cancelButtonText }}
            </button>
            <button 
              @click="$emit('confirm')" 
              class="px-4 py-2 text-sm font-medium text-white rounded-md"
              :class="confirmButtonClass"
            >
              {{ confirmButtonText }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </template>
  
  <script>
  export default {
    props: {
      isVisible: {
        type: Boolean,
        default: false
      },
      title: {
        type: String,
        default: 'Bilgi'
      },
      message: {
        type: String,
        default: ''
      },
      type: {
        type: String,
        default: 'info', // 'info', 'success', 'error', 'warning'
        validator: (value) => ['info', 'success', 'error', 'warning'].includes(value)
      },
      showCancelButton: {
        type: Boolean,
        default: false
      },
      confirmButtonText: {
        type: String,
        default: 'Tamam'
      },
      cancelButtonText: {
        type: String,
        default: 'İptal'
      },
      closeOnBackdrop: {
        type: Boolean,
        default: true
      }
    },
    computed: {
      headerClass() {
        switch (this.type) {
          case 'success': return 'bg-green-50 border-green-200';
          case 'error': return 'bg-red-50 border-red-200';
          case 'warning': return 'bg-yellow-50 border-yellow-200';
          default: return 'bg-blue-50 border-blue-200';
        }
      },
      titleClass() {
        switch (this.type) {
          case 'success': return 'text-green-800';
          case 'error': return 'text-red-800';
          case 'warning': return 'text-yellow-800';
          default: return 'text-blue-800';
        }
      },
      confirmButtonClass() {
        switch (this.type) {
          case 'success': return 'bg-green-600 hover:bg-green-700';
          case 'error': return 'bg-red-600 hover:bg-red-700';
          case 'warning': return 'bg-yellow-600 hover:bg-yellow-700';
          default: return 'bg-blue-600 hover:bg-blue-700';
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .modal-fade-enter-active, .modal-fade-leave-active {
    transition: opacity 0.3s;
  }
  .modal-fade-enter-from, .modal-fade-leave-to {
    opacity: 0;
  }
  </style>