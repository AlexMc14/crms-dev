<template>
    <div>
      <canvas ref="canvas"></canvas>
    </div>
  </template>
  
  <script>
  
  export default {
    extends: Line,
    props: {
      chartData: {
        type: Object,
        required: true,
      },
      options: {
        type: Object,
        default: () => ({
          responsive: true,
          maintainAspectRatio: false,
        }),
      },
    },
    mounted() {
      // Renderiza la gráfica al montar el componente
      this.renderChart(this.chartData, this.options);
    },
  };
  </script>
  
  <style scoped>
  /* Estilo opcional */
  /* .chart-container {
    position: relative;
    height: 400px;
    width: 100%;
  } */
  </style>
  