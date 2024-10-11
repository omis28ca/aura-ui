<script setup>
import { CContainer } from '@coreui/vue'
import bkg from '@/assets/images/bkgmain.png'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import AppSidebar from '@/components/AppSidebar.vue'
</script>

<template>
  <div class="tiledBackground">
    <AppSidebar />
    <div class="wrapper d-flex flex-column min-vh-100">
      <AppHeader />
      <div class="body flex-grow-1 custom-gradient">

        <router-view />

      </div>
      <AppFooter />
    </div>
  </div>
</template>

<style scoped>

.custom-gradient {
  height: 100%; /* Adjust the height as needed */
  background: linear-gradient(to bottom, transparent 50%, white 50%);
}

.tiledBackground {
  background-image: url('@/assets/images/bkgmain.png');
}


</style>
