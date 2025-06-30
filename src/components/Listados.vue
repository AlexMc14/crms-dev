<template>
    <div>
      <slot name="filters"></slot>
      <slot name="order"></slot>
      <b-pagination
        v-if="items.length > 0"
        v-model="currentPage"
        :total-rows="items.length"
        :per-page="perPage"
        class="mt-3 pagination"
      ></b-pagination>
  
      <div v-if="paginatedItems.length > 0" class="table-container">
        <b-table
          :items="paginatedItems"
          :fields="fields"
          striped
          hover
        >
          <template #cell(actions)="data">
            <slot name="tableActions" v-bind:data="data"></slot>
          </template>
        </b-table>
      </div>
  
      <div v-else class="no-elements">
        No hay elementos con el filtro seleccionado
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, watchEffect } from "vue";
  
  export default {
    props: {
      items: {
        type: Array,
        required: true
      },
      fields: {
        type: Array,
        required: true
      },
      perPage: {
        type: Number,
        default: 10
      },
      currentPage: {
        type: Number,
        default: 1
      }
    },
    setup(props, { emit }) {
      const localCurrentPage = computed({
        get: () => props.currentPage,
        set: (value) => {
          emit('page-changed', value);
        }
      });
  
      const paginatedItems = computed(() => {
        const start = (props.currentPage - 1) * props.perPage;
        const end = start + props.perPage;
        const slicedItems = props.items.slice(start, end);
  
        return slicedItems;
      });
  
      return {
        currentPage: localCurrentPage,
        paginatedItems
      };
    }
  };
  </script>
<style scoped>
/* Contenedor principal con efecto glassmorphism */
.table-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  overflow: hidden;
  margin: 30px 0;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.table-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background-size: 200% 100%;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Estilos de la tabla */
.table {
  margin-bottom: 0;
  background: transparent;
}

.table th {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  color: white;
  font-weight: 700;
  font-size: 15px;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 20px 16px;
  border: none;
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.table th:first-child {
  border-top-left-radius: 20px;
}

.table th:last-child {
  border-top-right-radius: 20px;
}

.table th:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 50%, #e085f0 100%);
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.table th::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #ff6b6b, #4ecdc4);
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.table th:hover::after {
  width: 80%;
}

.table td {
  padding: 18px 16px;
  border: none;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  font-size: 15px;
  color: #2c3e50;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  vertical-align: middle;
  position: relative;
  font-weight: 500;
}

.table tbody tr {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  margin: 8px 0;
}

.table tbody tr:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  transform: translateY(-4px) scale(1.01);
  box-shadow: 
    0 10px 30px rgba(102, 126, 234, 0.2),
    0 0 0 1px rgba(102, 126, 234, 0.1);
  border-radius: 15px;
  margin: 8px 12px;
}

.table tbody tr:hover td {
  color: #667eea;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(102, 126, 234, 0.1);
}

/* Efecto de rayas alternadas con gradiente */
.table tbody tr:nth-child(even) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%);
}

.table tbody tr:nth-child(even):hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
}

/* Paginación con diseño futurista */
.pagination {
  margin-top: 30px;
  justify-content: center;
  gap: 8px;
}

.page-link {
  border: none;
  color: #667eea;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 12px 18px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.page-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  transition: left 0.6s;
}

.page-link:hover::before {
  left: 100%;
}

.page-link:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: translateY(-3px) scale(1.05);
  box-shadow: 
    0 8px 25px rgba(102, 126, 234, 0.4),
    0 0 0 1px rgba(102, 126, 234, 0.2);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.page-item.active .page-link {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  box-shadow: 
    0 8px 25px rgba(102, 126, 234, 0.5),
    0 0 0 1px rgba(102, 126, 234, 0.3);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transform: scale(1.1);
}

/* Mensaje de no elementos con diseño llamativo */
.no-elements {
  text-align: center;
  padding: 60px 30px;
  color: #6c757d;
  font-size: 18px;
  font-weight: 500;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-radius: 20px;
  margin: 30px 0;
  border: 2px dashed rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.no-elements::before {
  content: "📊";
  font-size: 48px;
  display: block;
  margin-bottom: 20px;
  animation: bounce 2s infinite;
}

.no-elements::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
  animation: shimmer 3s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

/* Responsive mejorado */
@media (max-width: 768px) {
  .table th,
  .table td {
    padding: 15px 10px;
    font-size: 14px;
  }
  
  .table th {
    font-size: 13px;
    padding: 18px 12px;
  }
  
  .page-link {
    padding: 10px 14px;
    font-size: 13px;
  }
  
  .table-container {
    margin: 20px 10px;
    border-radius: 15px;
  }
}

/* Animaciones de entrada más dramáticas */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.8) rotate(-2deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

.table-container {
  animation: slideInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.table tbody tr {
  animation: fadeInScale 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  animation-fill-mode: both;
}

.table tbody tr:nth-child(1) { animation-delay: 0.1s; }
.table tbody tr:nth-child(2) { animation-delay: 0.2s; }
.table tbody tr:nth-child(3) { animation-delay: 0.3s; }
.table tbody tr:nth-child(4) { animation-delay: 0.4s; }
.table tbody tr:nth-child(5) { animation-delay: 0.5s; }

/* Efecto de partículas flotantes */
.table-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(240, 147, 251, 0.05) 0%, transparent 50%);
  pointer-events: none;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(1deg); }
}

/* Efecto de neón en hover */
.table tbody tr:hover::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
  border-radius: 17px;
  z-index: -1;
  opacity: 0.3;
  filter: blur(4px);
  animation: neonPulse 2s infinite;
}

@keyframes neonPulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}
</style>