<script setup>
import MultiRangeSlider from "multi-range-slider-vue";
import "../../../node_modules/multi-range-slider-vue/MultiRangeSliderBarOnly.css"



import { CChartLine } from '@coreui/vue-chartjs'
import {ref} from "vue";

const sliderValue = ref(50);

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

const   UpdateValues = (e) => {
  console.log(e.minValue);
  console.log(e.maxValue);
}


</script>

<template>
  <div>


    <div class="row d-flex mx-auto text-center">
      <div class="col-md-6" style="border-right: 1px solid #000;">
        <table>
          <tr>
            <td>System Status</td>
            <td><button class="btn btn-primary control-btn">ON</button></td>
            <td><button class="btn btn-outline-dark control-btn">OFF</button></td>
            <td> </td>
          </tr>
          <tr>
            <td>Fan Speed</td>
            <td><button class="btn btn-outline-dark control-btn">+</button></td>
            <td><button class="btn btn-outline-dark control-btn">-</button></td>
            <td>35%</td>
          </tr>
          <tr>
            <td>Power Level</td>
            <td><button class="btn btn-outline-dark control-btn">+</button></td>
            <td><button class="btn btn-outline-dark control-btn">-</button></td>
            <td>50%</td>
          </tr>
        </table>
      </div>
      <div class="col-md-6">
        <table>
          <tr>
            <td>Brightness</td>
            <td>

              <div class="custom-slider">
                -<input
                  v-model="sliderValue"
                  type="range"
                  min="0"
                  max="100"
                  class="slider"
                />+
              </div>

            </td>
          </tr>
          <tr>
            <td>Work Hours</td>
            <td>22.45 hrs</td>
          </tr>
        </table>
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

table {
  border-collapse: collapse;
  width: 100%;
}
td {
  padding: 8px;
  text-align: center; /* Center align text in the cells */
}

.bg-light-blue {
  background-color: #e0f7fa;
}
.sensor-panel {
  background-color: #e3f2fd;
  padding: 10px;
  border-radius: 5px;
}
.control-btn {
  min-width: 80px;
}


.custom-slider {
  --trackHeight: 1.5rem;
  --thumbRadius: 1.9rem;
}

/* style the input element with type "range" */
.custom-slider input[type="range"] {
  position: relative;
  appearance: none;
  /* pointer-events: none; */
  border-radius: 999px;
  z-index: 0;
}

/* ::before element to replace the slider track */
.custom-slider input[type="range"]::before {
  content: "";
  position: absolute;
  width: var(--ProgressPercent, 100%);
  height: 100%;
  background: #1273e0 ;
  /* z-index: -1; */
  pointer-events: none;
  border-radius: 999px;
}

/* `::-webkit-slider-runnable-track` targets the track (background) of a range slider in chrome and safari browsers. */
.custom-slider input[type="range"]::-webkit-slider-runnable-track {
  appearance: none;
  background: #1273e0 ;
  height: var(--trackHeight);
  border-radius: 999px;
}

/* `::-moz-range-track` targets the track (background) of a range slider in Mozilla Firefox. */
.custom-slider input[type="range"]::-moz-range-track {
  appearance: none;
  background: #1273e0 ;
  height: var(--trackHeight);
  border-radius: 999px;
}

.custom-slider input[type="range"]::-webkit-slider-thumb {
  position: relative;
  top: 50%;
  transform: translate(0, -50%);
  width: var(--thumbRadius);
  height: var(--thumbRadius);
  /* margin-top: calc((var(--trackHeight) - var(--thumbRadius)) / 2); */
  background: #ffffff;
  border-radius: 999px;
  pointer-events: all;
  appearance: none;
  z-index: 1;
}
</style>
