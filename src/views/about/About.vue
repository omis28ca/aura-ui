<script setup>
import avatar1 from '@/assets/images/avatars/1.jpg'
import avatar2 from '@/assets/images/avatars/2.jpg'
import avatar3 from '@/assets/images/avatars/3.jpg'
import avatar4 from '@/assets/images/avatars/4.jpg'
import avatar5 from '@/assets/images/avatars/5.jpg'
import avatar6 from '@/assets/images/avatars/6.jpg'

import { CChartLine } from '@coreui/vue-chartjs'

const data = {
  labels: ['months', 'a', 'b', 'c', 'd'],
  datasets: [
    {
      label: 'Data One',
      backgroundColor: 'rgb(228,102,81,0.9)',
      data: [30, 39, 10, 50, 30, 70, 35],
    },
    {
      label: 'Data Two',
      backgroundColor: 'rgb(0,216,255,0.9)',
      data: [39, 80, 40, 35, 40, 20, 45],
    },
  ],
}

const config = {
  type: 'line',
  data: data,
  options: {
    responsive: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Chart.js Line Chart'
      }
    }
  },
};




</script>

<template>
  <div>

    <div class="container">
      <div class="row">
        <div class="col-md-4 d-flex justify-content-start align-items-start">
          <!-- Image centered in the column -->
          <img src="@/assets/images/logo.png" alt="Logo" class="img-fluid img-logo" >
        </div>
        <div class="col-md-8 d-flex justify-content-center align-items-center">
          <CCard class="mb-4">
            <CCardBody>
              <div class="row">
                <div class="col-md-8  d-flex justify-content-center align-items-center">
                  <span class="h5">
                  For more information on the AURA Hygienic Technology, visit: <i class="text-aura">www.aurahygienic.com</i> or scan the QR code.
                    </span>
                </div>
                <div class="col-md-4  d-flex justify-content-center align-items-center">
                  <img src="@/assets/images/qr.png" alt="Logo" class="img-logo" >
                </div>
              </div>
            </CCardBody>
          </CCard>
        </div>
      </div>
    </div>

    <div id="bottom" class="container">
      <div class="row">
        <div class="col-md-12">
          <div class="row">
            <div class="col-md-6  ">
                <strong>CURRENT&nbsp;SENSOR&nbsp;LEVEL: <button type="button" class="btn btn-sm btn-light rounded-pill ppm-text">0.018</button></strong>
            </div>

            <div class="col-md-6 d-flex justify-content-end align-items-end">
              <strong>SENSOR&nbsp;HISTORY</strong>
            </div>

          </div>
        </div>
        <div class="align-items-center">
          <CChartLine :data="data" width="800" />
        </div>



      </div>
    </div>

  </div>
</template>

<style>

.text-aura {
  font-weight: bold;
  color: aqua;
}

.ppm-text {
  font-weight: bold;
  font-size: larger;
  padding: 3px;
}

.img-logo {
  height: 100px;
}

/* Ensure the outer div fills the height of its parent */

/* Stretch the main container to use all available space */
.container:first-of-type {
  flex: 1 0 auto; /* Grow to fill available space */
}

/* Position the bottom container at the bottom of the outer div */
#bottom {
  position: absolute;
  bottom: 0;
  width: 100%;
  margin-bottom: 50px;
}
</style>
