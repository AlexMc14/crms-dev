<template>
    <div>
      <canvas ref="canvas"></canvas>
    </div>
  </template>
  
  <script>
  
  export default {
    extends: Bar,
    props: ["chartData", "options"],
    mounted() {
      // Renderiza el gráfico cuando el componente se monta
      this.renderChart(this.chartData, this.options);
    },
  };
  </script>
  
  <style scoped>
  /* Opcional: añade estilos personalizados si es necesario */
  </style>
  