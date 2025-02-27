<template>
  <div class="min-h-screen bg-gray-50">
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-12">
      <!-- Ana içerik -->
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Left Column: User Info & Appointment Details -->
        <div class="w-full lg:w-1/3 space-y-6">
          <!-- User Info Form -->
          <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Kişisel Bilgiler</h2>
            <div class="space-y-4">
              <div>
                <label for="fullName" class="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
                <input
                  id="fullName"
                  v-model="userData.fullName"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Adınız Soyadınız"
                />
              </div>
            </div>
          </div>

          <!-- Admin istatistik paneli -->
          <div v-if="userRole === 'admin'" class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Admin Paneli</h2>
            <div class="space-y-3">
              <div class="flex justify-between">
                <p class="text-sm text-gray-500">Toplam Randevu:</p>
                <p class="font-medium">{{ appointments.length }}</p>
              </div>
              <div class="flex justify-between">
                <p class="text-sm text-gray-500">Bugünkü Randevular:</p>
                <p class="font-medium">{{ todayAppointments.length }}</p>
              </div>
            </div>
          </div>

          <!-- Appointment Confirmation -->
          <div v-if="selectedSlot.date && selectedSlot.time" class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Randevu Bilgileri</h2>
            <div class="space-y-3 mb-6">
              <div class="flex justify-between">
                <p class="text-sm text-gray-500">Tarih:</p>
                <p class="font-medium">{{ formatSelectedDate }}</p>
              </div>
              <div class="flex justify-between">
                <p class="text-sm text-gray-500">Saat:</p>
                <p class="font-medium">{{ selectedSlot.time }}</p>
              </div>
            </div>
            <button
              @click="confirmAppointment"
              class="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                İşleniyor...
              </span>
              <span v-else>Randevuyu Onayla</span>
            </button>
          </div>

          <!-- Existing Appointments -->
          <div v-if="appointments.length > 0" class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">
              {{ userRole === 'admin' ? 'Tüm Randevular' : 'Randevularınız' }}
            </h2>
            <div v-if="isLoading" class="py-4 text-center">
              <svg class="animate-spin h-6 w-6 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div v-else class="divide-y divide-gray-200">
              <div v-for="appointment in appointments" :key="appointment._id" class="py-3">
                <div class="flex justify-between items-start">
                  <div>
                    <p class="font-medium text-gray-900">{{ appointment.name }}</p>
                    <p class="text-sm text-gray-500">{{ formatDateForDisplay(appointment.date) }} - {{ appointment.time }}</p>
                  </div>
                  <button
                    @click="promptCancelAppointment(appointment._id)"
                    class="text-red-600 hover:text-red-900 text-sm"
                    :disabled="isDeletingAppointment === appointment._id"
                  >
                    <span v-if="isDeletingAppointment === appointment._id">
                      <svg class="animate-spin inline-block h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                    <span v-else>İptal</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Calendar -->
        <div class="w-full lg:w-2/3">
          <div class="bg-white shadow rounded-lg overflow-hidden">
            <!-- Calendar Navigation -->
            <div class="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <button @click="previousWeek" class="p-2 rounded-full hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 class="text-xl font-semibold text-gray-800">{{ calendarDateRange }}</h2>
              <button @click="nextWeek" class="p-2 rounded-full hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <!-- Calendar Grid -->
            <div class="grid grid-cols-8 border-b border-gray-200">
              <!-- Time column -->
              <div class="border-r border-gray-200">
                <div class="h-12 flex items-center justify-center font-medium text-gray-500">Saat</div>
              </div>
              <!-- Days columns -->
              <div v-for="day in currentWeekDays" :key="day.date" class="text-center">
                <div class="h-12 flex flex-col justify-center">
                  <span class="text-sm font-medium text-gray-900">{{ day.name }}</span>
                  <span class="text-sm text-gray-500">{{ day.shortDate }}</span>
                </div>
              </div>
            </div>

            <!-- Time Slots -->
<div class="divide-y divide-gray-200">
  <div v-for="timeSlot in timeSlots" :key="timeSlot" class="grid grid-cols-8">
    <!-- Time label -->
    <div class="border-r border-gray-200 py-3 px-2 text-center text-sm text-gray-500 flex items-center justify-center">{{ timeSlot }}</div>
    
    <!-- Appointment slots -->
    <div v-for="day in currentWeekDays" :key="`${day.date}-${timeSlot}`" class="relative">
      <!-- Seçilebilir slotlar için -->
      <button
        v-if="isSlotSelectable(day.date, timeSlot)"
        @click="selectAppointment(day.date, timeSlot)"
        :class="[
          'w-full h-full py-3 px-2',
          getSlotStyle(day.date, timeSlot)
        ]"
      >
        <span :class="['inline-block w-full text-sm font-medium', isSelectedSlot(day.date, timeSlot) ? 'text-blue-800' : 'text-green-800']">
          {{ timeSlot }}
        </span>
      </button>
      
      <!-- Geçmiş slotlar için -->
      <div 
        v-else-if="isPastDate(day.date) || isPastTime(day.date, timeSlot)" 
        class="w-full h-full py-3 px-2 bg-gray-100 flex items-center justify-center"
      >
        <span class="text-sm font-medium text-gray-400 text-center line-through">
          {{ timeSlot }}
        </span>
      </div>
      
      <!-- Dolu slotlar için -->
      <div 
        v-else 
        class="w-full h-full py-3 px-2 bg-gray-200 opacity-50 flex items-center justify-center"
      >
        <span class="text-sm font-medium text-gray-500 text-center line-through">
          {{ timeSlot }}
        </span>
      </div>
    </div>
  </div>
</div>
          </div>
        </div>
      </div>
    </main>
    
    <!-- Modal Bileşeni -->
    <Modal
      :isVisible="modal.isVisible"
      :title="modal.title"
      :message="modal.message"
      :type="modal.type"
      :showCancelButton="modal.showCancelButton"
      :confirmButtonText="modal.confirmButtonText"
      :cancelButtonText="modal.cancelButtonText"
      @close="closeModal"
      @confirm="modal.onConfirm ? modal.onConfirm() : closeModal()"
    />
  </div>
</template>

<script>
import Modal from '~/components/Modal.vue';

export default {
  components: {
    Modal
  },
  data() {
    return {
      userData: { fullName: '' },
      currentWeekStart: new Date(), // Takvim başlangıç tarihi
      selectedSlot: { date: null, time: null },
      appointments: [],
      bookedSlots: [], // Tüm dolu randevu slotları
      isLoading: false,
      isSubmitting: false,
      isDeletingAppointment: null,
      timeSlots: [], // Saat dilimleri
      userRole: 'user', // Varsayılan olarak user
      token: null,
      modal: {
        isVisible: false,
        title: '',
        message: '',
        type: 'info',
        showCancelButton: false,
        confirmButtonText: 'Tamam',
        cancelButtonText: 'İptal',
        onConfirm: null
      },
      appointmentToCancel: null // İptal edilecek randevu ID'si
    };
  },
  created() {
    // useRuntimeConfig() Nuxt 3'te global olarak erişilebilir
    this.apiUrl = useRuntimeConfig().public.apiBaseUrl;
  },
  computed: {
    currentWeekDays() {
      const days = [];
      const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
      const startDate = new Date(this.currentWeekStart);
      const startDay = startDate.getDay();
      // Haftayı Pazartesi'den başlatmak için ayarlama
      if (startDay === 0) {
        startDate.setDate(startDate.getDate() - 6);
      } else if (startDay > 1) {
        startDate.setDate(startDate.getDate() - (startDay - 1));
      }
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        days.push({
          date: this.formatDate(date),
          name: dayNames[i],
          shortDate: `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}`,
        });
      }
      return days;
    },
    calendarDateRange() {
      if (this.currentWeekDays.length === 0) return '';
      const firstDay = this.currentWeekDays[0].shortDate;
      const lastDay = this.currentWeekDays[6].shortDate;
      const year = new Date().getFullYear();
      return `${firstDay}.${year} - ${lastDay}-${year}`;
    },
    formatSelectedDate() {
      if (!this.selectedSlot.date) return '';
      const dateParts = this.selectedSlot.date.split('-');
      return `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`;
    },
    todayAppointments() {
      const today = this.formatDate(new Date());
      return this.appointments.filter(appointment => appointment.date === today);
    }
  },
  mounted() {
  this.generateTimeSlots(); // Saat dilimlerini oluştur
  
  // Bugünkü tarihi al ve geçmiş günlere gidilmemesi için kontrol ekle
  const today = new Date();
  this.currentWeekStart = today; // Bugünden başla
  
  // Token kontrolü
  this.token = localStorage.getItem("token");
  
  // Token varsa kullanıcı bilgilerini al
  if (this.token) {
    this.decodeUserRole();
    this.fetchAppointments();
    this.fetchBookedSlots(); // Tüm dolu slotları getir
  }
},

// Hafta navigasyonu - önceki haftaya gitme kontrolü
previousWeek() {
  const newDate = new Date(this.currentWeekStart);
  newDate.setDate(newDate.getDate() - 7);
  
  // Eğer yeni hafta bugünün bulunduğu haftadan önceyse, işlemi engelle
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Hafta başlangıcını kontrol et
  const weekStartDate = this.getWeekStartDate(newDate);
  if (weekStartDate < today) {
    this.showModal("Uyarı", "Geçmiş tarihlere gidemezsiniz.", "warning");
    return;
  }
  
  this.currentWeekStart = newDate;
},

// Hafta başlangıç tarihini alma yardımcı fonksiyonu
getWeekStartDate(date) {
  const newDate = new Date(date);
  const day = newDate.getDay();
  
  // Haftayı Pazartesi'den başlatmak için ayarlama
  if (day === 0) { // Pazar
    newDate.setDate(newDate.getDate() - 6);
  } else if (day > 1) { // Salı-Cumartesi
    newDate.setDate(newDate.getDate() - (day - 1));
  }
  
  newDate.setHours(0, 0, 0, 0);
  return newDate;
},
  methods: {
    
    // Modal fonksiyonları
    showModal(title, message, type = 'info', showCancelButton = false, onConfirm = null) {
      this.modal = {
        isVisible: true,
        title,
        message,
        type,
        showCancelButton,
        confirmButtonText: 'Tamam',
        cancelButtonText: 'İptal',
        onConfirm
        
      };
    },
    closeModal() {
      this.modal.isVisible = false;
    },
    // Tarih formatı ve kontrol fonksiyonları
    formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    // Geçmiş tarih kontrolü - bugünden önceki tarihler için true döndürür
    isPastDate(dateStr) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Günün başlangıcına ayarla

      const date = new Date(dateStr);
      date.setHours(0, 0, 0, 0);

      return date < today;
    },

    // Geçmiş saat kontrolü - bugün için önceki saatler için true döndürür
    isPastTime(dateStr, timeStr) {
      const today = this.formatDate(new Date());

      // Eğer bugün değilse, saat kontrolünü atlayalım
      if (dateStr !== today) return false;

      const now = new Date();
      const [hours, minutes] = timeStr.split(':').map(Number);

      // Şu anki saatten önceki saatler için true döndürür
      if (hours < now.getHours()) return true;
      if (hours === now.getHours() && minutes <= now.getMinutes()) return true;

      return false;
    },

    // Slot uygunluk kontrolü
    isSlotAvailable(date, time) {
      // Geçmiş günler için false döndür
      if (this.isPastDate(date)) return false;

      // Bugün için geçmiş saatler için false döndür
      if (this.isPastTime(date, time)) return false;

      // Kullanıcı ve başkalarının randevularını kontrol et
      return !this.bookedSlots.some(slot => slot.date === date && slot.time === time);
    },

    // Slot seçilebilir mi?
    isSlotSelectable(date, time) {
      // Geçmiş günler veya saatler için false döndür
      if (this.isPastDate(date) || this.isPastTime(date, time)) return false;

      // Randevusu olmayan slotlar seçilebilir
      return this.isSlotAvailable(date, time);
    },

    // Slot görünümü
    getSlotStyle(date, time) {
      if (this.isPastDate(date) || this.isPastTime(date, time)) {
        return 'bg-gray-200 cursor-not-allowed opacity-50'; // Geçmiş zaman 
      }

      if (!this.isSlotAvailable(date, time)) {
        return 'bg-gray-100 cursor-not-allowed'; // Dolu slot
      }

      if (this.isSelectedSlot(date, time)) {
        return 'bg-blue-100 hover:bg-blue-200'; // Seçili slot
      }

      return 'bg-green-100 hover:bg-green-200'; // Müsait slot
    },
    


    
    // Kullanıcı işlemleri
    decodeUserRole() {
      try {
        // Token'dan role bilgisini çıkar
        const base64Url = this.token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);
        this.userRole = payload.role || 'user';
      } catch (error) {
        console.error('Token decode edilemedi:', error);
        this.userRole = 'user'; // Hata durumunda varsayılan olarak user rol
      }
    },
    
    // Takvim ve slot işlemleri
    generateTimeSlots() {
      const slots = [];
      for (let hour = 8; hour < 18; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
      this.timeSlots = slots;
    },
    formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    formatDateForDisplay(dateString) {
      if (!dateString) return '';
      const dateParts = dateString.split('-');
      return `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`;
    },
    isSlotAvailable(date, time) {
      // Kullanıcı ve başkalarının randevularını kontrol et
      return !this.bookedSlots.some(slot => slot.date === date && slot.time === time);
    },
    isSelectedSlot(date, time) {
      return this.selectedSlot.date === date && this.selectedSlot.time === time;
    },
    selectAppointment(date, time) {
      this.selectedSlot = { date, time };
    },
    previousWeek() {
      const newDate = new Date(this.currentWeekStart);
      newDate.setDate(newDate.getDate() - 7);
      this.currentWeekStart = newDate;
    },
    nextWeek() {
      const newDate = new Date(this.currentWeekStart);
      newDate.setDate(newDate.getDate() + 7);
      this.currentWeekStart = newDate;
    },
    
    // API istekleri
    async fetchAppointments() {
      this.isLoading = true;
      try {
        this.token = localStorage.getItem("token");
        if (!this.token) {
          throw new Error("Giriş yapmalısınız");
        }

        const response = await fetch(`${this.apiUrl}/appointments`, {
          method: "GET",
          headers: {
            "Authorization": this.token,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Randevular alınamadı");
        }

        const data = await response.json();
        this.appointments = data;
      } catch (error) {
        console.error("Randevular alınırken hata oluştu:", error);
        this.showModal("Hata", error.message, "error");
      } finally {
        this.isLoading = false;
      }
    },
    
    // Tüm dolu slotları getir
    async fetchBookedSlots() {
      try {
        this.token = localStorage.getItem("token");
        if (!this.token) {
          throw new Error("Giriş yapmalısınız");
        }

        const response = await fetch(`${this.apiUrl}/available-slots`, {
          method: "GET",
          headers: {
            "Authorization": this.token,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Randevu durumları alınamadı");
        }

        const data = await response.json();
        this.bookedSlots = data;
      } catch (error) {
        console.error("Randevu durumları alınırken hata oluştu:", error);
      }
    },
    
    async confirmAppointment() {
      if (!this.userData.fullName) {
        this.showModal("Uyarı", "Lütfen adınızı giriniz.", "warning");
        return;
      }

      if (!this.selectedSlot.date || !this.selectedSlot.time) {
        this.showModal("Uyarı", "Lütfen bir randevu tarihi ve saati seçiniz.", "warning");
        return;
      }

      this.isSubmitting = true;

      try {
        this.token = localStorage.getItem("token");
        if (!this.token) {
          throw new Error("Giriş yapmalısınız");
        }

        const appointmentData = {
          name: this.userData.fullName,
          date: this.selectedSlot.date,
          time: this.selectedSlot.time,
        };
        
        const response = await fetch(`${this.apiUrl}/appointments`, {
          method: "POST",
          headers: {
            "Authorization": this.token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(appointmentData),
        });

        const responseData = await response.json();
        
        if (!response.ok) {
          throw new Error(responseData.error || "Randevu oluşturulamadı");
        }

        // Veri yenileme
        await Promise.all([
          this.fetchAppointments(),
          this.fetchBookedSlots()
        ]);
        
        this.selectedSlot = { date: null, time: null };
        this.showModal("Başarılı", "Randevunuz başarıyla oluşturuldu!", "success");
      } catch (error) {
        console.error("Randevu oluşturulurken hata oluştu:", error);
        this.showModal("Hata", error.message, "error");
      } finally {
        this.isSubmitting = false;
      }
    },
    
    // İptal onayı iste
    promptCancelAppointment(id) {
      this.appointmentToCancel = id;
      this.showModal(
        "Randevu İptal", 
        "Bu randevuyu iptal etmek istediğinize emin misiniz?", 
        "warning", 
        true, 
        () => this.cancelAppointment(id)
      );
    },
    
    async cancelAppointment(id) {
      this.isDeletingAppointment = id;

      try {
        this.token = localStorage.getItem("token");
        if (!this.token) {
          throw new Error("Giriş yapmalısınız");
        }

        const response = await fetch(`${this.apiUrl}/appointments/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": this.token,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Randevu iptal edilemedi");
        }

        // Veri yenileme
        await Promise.all([
          this.fetchAppointments(),
          this.fetchBookedSlots()
        ]);
        
        this.showModal("Başarılı", "Randevu başarıyla iptal edildi.", "success");
      } catch (error) {
        console.error("Randevu iptal edilirken hata oluştu:", error);
        this.showModal("Hata", error.message, "error");
      } finally {
        this.isDeletingAppointment = null;
        this.appointmentToCancel = null;
        this.closeModal();
      }
    },
  },
};
</script>

