<template>
  <div class="listado-productos-container">
    <b-alert v-if="showSuccess" variant="success" style="position: fixed; width: 100%; top: 0px; z-index: 9999;" show>Producto borrado correctamente</b-alert>
    
    <!-- Header con título y botón de añadir -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="ti-briefcase"></i>
          Listado de Productos
        </h1>
        <p class="page-subtitle">Gestión y administración de productos y servicios</p>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="main-content">
      <!-- Filtros rediseñados -->
      <div class="table-section">
        <div class="table-header">
          <h2>Filtros de Búsqueda</h2>
          <button class="btn-add" @click="createModal = true">
            <i class="ti-plus"></i> Añadir Producto
          </button>
        </div>
        
        <div class="filters-content">
          <div class="row">
            <!-- Filtro por nombre -->
            <div class="col-md-4 mb-3">
              <div class="form-group">
                <label for="nombreInput">Nombre</label>
                <input
                  id="nombreInput"
                  type="text"
                  class="form-control"
                  v-model="filters.nombre"
                  placeholder="Buscar por nombre"
                  @keyup.enter="fetchData"
                >
              </div>
            </div>

            <!-- Filtro por categoría -->
            <div class="col-md-4 mb-3">
              <div class="form-group">
                <label for="categoriaInput">Categoría</label>
                <input
                  id="categoriaInput"
                  type="text"
                  class="form-control"
                  v-model="filters.categoria"
                  placeholder="Buscar por categoría"
                  @keyup.enter="fetchData"
                >
              </div>
            </div>

            <!-- Filtro por precio -->
            <div class="col-md-4 mb-3">
              <div class="form-group">
                <label for="precioInput">Precio máximo</label>
                <input
                  id="precioInput"
                  type="number"
                  class="form-control"
                  v-model="filters.precioMax"
                  placeholder="Precio máximo"
                  @keyup.enter="fetchData"
                >
              </div>
            </div>
          </div>

          <div class="row">
            <!-- Ordenamiento -->
            <div class="col-md-4 mb-3">
              <div class="form-group">
                <label for="orderSelect">Ordenar por</label>
                <select id="orderSelect" v-model="order" class="form-control" @change="handleOrderChange">
                  <option value="nombre">Nombre</option>
                  <option value="precio">Precio</option>
                  <option value="categoria">Categoría</option>
                  <option value="stock">Stock</option>
                </select>
              </div>
            </div>

            <!-- Dirección del ordenamiento -->
            <div class="col-md-4 mb-3">
              <div class="form-group">
                <label for="orderDirection">Dirección</label>
                <select id="orderDirection" v-model="orderDirection" class="form-control" @change="handleOrderChange">
                  <option value="asc">Ascendente</option>
                  <option value="desc">Descendente</option>
                </select>
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="col-md-4 mb-3 d-flex align-items-end">
              <div class="w-100">
                <button class="btn-search" @click="fetchData">
                  <i class="ti-search"></i> Buscar
                </button>
                <button class="btn-clear" @click="clearFilters">
                  <i class="ti-eraser"></i> Limpiar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de productos -->
      <div class="table-section">
        <div class="table-header">
          <h2>Listado de Productos</h2>
        </div>
        <Listados :items="filteredProductos" :fields="fields" :current-page="currentPage" @page-changed="handlePageChange">
          <template #tableActions="{ data }">
            <button v-if="showAsAdmin" class="btn-edit" @click="editProduct(data.item)" title="Editar">
              <i class="ti-pencil"></i>
            </button>
            <button v-if="showAsAdmin" class="btn-delete" @click="deleteProduct(data.item)" title="Borrar">
              <i class="ti-trash"></i>
            </button>
            <button class="btn-view" @click="viewProduct(data.item)" title="Ver">
              <i class="ti-eye"></i>
            </button>
          </template>
        </Listados>
      </div>

      <!-- Modal de edición -->
      <b-modal v-model="modalShow" id="bv-modal-example" hide-footer>
        <template #modal-title>
          Editar producto
        </template>
        <div class="row">
          <div class="col-6">
            <label for="">Nombre</label>
            <input type="text" class="form-control" v-model="productToEdit.nombre">
          </div>
          <div class="col-6">
            <label for="">Categoría</label>
            <input type="text" class="form-control" v-model="productToEdit.categoria">
          </div>
          <div class="col-6">
            <label for="">Precio (€)</label>
            <input type="number" class="form-control" v-model.number="productToEdit.precio" step="0.01" min="0">
          </div>
          <div class="col-6">
            <label for="">Impuestos (%)</label>
            <input type="number" class="form-control" v-model.number="productToEdit.impuesto" step="0.01" min="0">
          </div>
          <div class="col-6">
            <label for="">Stock</label>
            <input type="number" class="form-control" v-model.number="productToEdit.stock" min="0" placeholder="Solo para productos">
          </div>
          <div class="col-6">
            <label for="">Coste Interno (€)</label>
            <input type="number" class="form-control" v-model.number="productToEdit.costeInterno" step="0.01" min="0" placeholder="Opcional">
          </div>
          <div class="col-12">
            <label for="">Descripción</label>
            <textarea class="form-control" v-model="productToEdit.descripcion" rows="3"></textarea>
          </div>
          <b-button @click="saveChanges" class="btn-search mx-5 mt-4">Guardar cambios</b-button>
        </div>
      </b-modal>

      <!-- Modal de eliminación -->
      <b-modal v-model="modalDelete" id="bv-modal-example" hide-footer>
        <template #modal-title>
          Borrar producto
        </template>
        <div class="text-center">
          <p>¿Estás seguro de que quieres eliminar el producto <strong>{{ productToDelete.nombre }}</strong>?</p>
          <p class="text-danger">Esta acción no se puede deshacer.</p>
          <div class="mt-3">
            <b-button variant="danger" @click="deleteUser" class="mr-2">Eliminar</b-button>
            <b-button variant="secondary" @click="modalDelete = false">Cancelar</b-button>
          </div>
        </div>
      </b-modal>

      <!-- Modal de creación -->
      <b-modal v-model="createModal" id="bv-modal-example" hide-footer>
        <template #modal-title>
          Añadir producto
        </template>
        <div class="row">
          <div class="col-6">
            <label for="">Nombre</label>
            <input type="text" class="form-control" v-model="createProduct.nombre">
          </div>
          <div class="col-6">
            <label for="">Categoría</label>
            <input type="text" class="form-control" v-model="createProduct.categoria">
          </div>
          <div class="col-6">
            <label for="">Precio (€)</label>
            <input type="number" class="form-control" v-model.number="createProduct.precio" step="0.01" min="0">
          </div>
          <div class="col-6">
            <label for="">Impuestos (%)</label>
            <input type="number" class="form-control" v-model.number="createProduct.impuesto" step="0.01" min="0">
          </div>
          <div class="col-6">
            <label for="">Stock</label>
            <input type="number" class="form-control" v-model.number="createProduct.stock" min="0" placeholder="Solo para productos">
          </div>
          <div class="col-6">
            <label for="">Coste Interno (€)</label>
            <input type="number" class="form-control" v-model.number="createProduct.costeInterno" step="0.01" min="0" placeholder="Opcional">
          </div>
          <div class="col-12">
            <label for="">Descripción</label>
            <textarea class="form-control" v-model="createProduct.descripcion" rows="3"></textarea>
          </div>
        </div>
        <b-button class="btn-search mt-4" @click="addProduct">Añadir producto</b-button>
      </b-modal>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch, onBeforeUnmount } from "vue";
import Listados from "@/components/Listados.vue";
import { productosService } from '@/services/api/queries';

export default {
  components: {
    Listados,
  },
  setup() {
    const createProduct = ref({
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: null,
      categoria: '',
      impuesto: 21,
      costeInterno: null
    });
    const createModal = ref(false);
    const products = ref([]);
  
    const productToEdit = ref({});
    const modalShow = ref(false);
    const modalDelete = ref(false);
    const showSuccess = ref(false);
    const productToDelete = ref({});
    const currentPage = ref(1);
    const userData = JSON.parse(localStorage.getItem('userInform'));
    const showAsAdmin = computed(() => {
      return userData.admin && userData.admin === true ? true : false;
    })
    
    // Filtros
    const filters = ref({
      nombre: '',
      categoria: '',
      precioMax: '',
    });
    
    // Ordenamiento
    const order = ref('nombre');
    const orderDirection = ref('asc');
    
    const fields = [
      { key: 'nombre', label: 'Nombre' },
      { key: 'descripcion', label: 'Descripción' },
      { key: 'precio', label: 'Precio' },
      { key: 'categoria', label: 'Categoría' },
      { key: 'stock', label: 'Stock' },
      { key: 'actions', label: '' }
    ];

    const fetchData = async () => {
      try {
        // Construir parámetros para la API
        const params = {};
        
        // Agregar filtros individuales si existen
        if (filters.value.nombre.trim()) {
          params.nombre = filters.value.nombre.trim();
        }
        if (filters.value.categoria.trim()) {
          params.categoria = filters.value.categoria.trim();
        }
        if (filters.value.precioMax) {
          params.precioMax = parseFloat(filters.value.precioMax);
        }
        
        console.log('Parámetros enviados a la API:', params);
        const response = await productosService.getAll(params);
        console.log('Respuesta de la API:', response);
        products.value = response;
      } catch (error) {
        console.error('Error al obtener productos:', error);
      }
    };

    const clearFilters = () => {
      filters.value.nombre = '';
      filters.value.categoria = '';
      filters.value.precioMax = '';
      order.value = 'nombre';
      orderDirection.value = 'asc';
      fetchData();
    };

    const handleOrderChange = () => {
      console.log('Cambio de ordenamiento:', { order: order.value, direction: orderDirection.value });
      // El ordenamiento se hace en el frontend con el computed
    };

    const filteredProductos = computed(() => {
      let productList = products.value;
      
      // Ordenamiento en el frontend
      productList.sort((a, b) => {
        let aValue = a[order.value];
        let bValue = b[order.value];
        
        // Manejar casos especiales
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        // Aplicar dirección del ordenamiento
        if (orderDirection.value === 'asc') {
          if (aValue < bValue) return -1;
          if (aValue > bValue) return 1;
        } else {
          if (aValue > bValue) return -1;
          if (aValue < bValue) return 1;
        }
        
        return 0;
      });
      
      return productList;
    });

    const editProduct = (product) => {
      console.log(product);
      productToEdit.value = { ...product };
      modalShow.value = true;
    };

    const handlePageChange = (page) => {
      currentPage.value = parseInt(page);
      fetchData();
    };

    const addProduct = async () => {
      try {
        await productosService.create(createProduct.value);
        createProduct.value = {
          nombre: '',
          descripcion: '',
          precio: 0,
          stock: null,
          categoria: '',
          impuesto: 21,
          costeInterno: null
        };
        createModal.value = false;
        fetchData();
      } catch (error) {
        console.error('Error al crear producto:', error);
      }
    }

    onMounted(() => {
      fetchData();
    })

    const saveChanges = async () => {
      try {
        await productosService.update(productToEdit.value._id, productToEdit.value);
        modalShow.value = false;
        fetchData();
      } catch (error) {
        console.error('Error al actualizar producto:', error);
      }
    }

    const deleteUser = async () => {
      try {
        await productosService.delete(productToDelete.value._id);
        showSuccess.value = true;
        modalDelete.value = false;
        fetchData();
        setTimeout(() => {
          showSuccess.value = false;
        }, 3000);
      } catch (error) {
        console.error("Error al eliminar el producto:", error);
      }
    }

    const viewProduct = (product) => {
      // Aquí podrías implementar la vista detallada del producto
      console.log('Ver producto:', product);
    };

    return {
      createProduct,
      saveChanges,
      createModal,
      fields,
      filteredProductos,
      editProduct,
      modalShow,
      productToEdit,
      modalDelete,
      productToDelete,
      showSuccess,
      showAsAdmin,
      addProduct,
      deleteUser,
      deleteProduct: (product) => {
        productToDelete.value = product;
        modalDelete.value = true;
      },
      filters,
      order,
      orderDirection,
      clearFilters,
      handleOrderChange,
      fetchData,
      currentPage,
      handlePageChange,
      viewProduct
    }
  }
};
</script>

<style scoped>
.listado-productos-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1b6659 0%, #2d8a7a 100%);
  padding: 0;
}

.page-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  padding: 40px 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
}

.page-title {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 36px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.page-title i {
  color: #1b6659;
  font-size: 40px;
}

.page-subtitle {
  margin: 0;
  color: #7f8c8d;
  font-size: 18px;
  font-weight: 500;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.table-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  padding: 30px;
  margin-bottom: 40px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.table-header h2 {
  margin: 0;
  color: #1b6659;
  font-size: 24px;
  font-weight: 700;
}

.btn-add {
  background: linear-gradient(135deg, #1b6659 0%, #2d8a7a 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(27, 102, 89, 0.4);
}

.filters-content {
  margin-top: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.form-group label {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-control {
  padding: 10px;
  border: 2px solid rgba(27, 102, 89, 0.2);
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: #1b6659;
  box-shadow: 0 0 0 3px rgba(27, 102, 89, 0.1);
}

.btn-search, .btn-clear {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  width: 100%;
  margin-bottom: 10px;
}

.btn-search {
  background: linear-gradient(135deg, #1b6659 0%, #2d8a7a 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(27, 102, 89, 0.3);
}

.btn-clear {
  background: rgba(189, 195, 199, 0.2);
  color: #7f8c8d;
}

.btn-search:hover, .btn-clear:hover {
  transform: translateY(-2px);
}

.btn-search:hover {
  box-shadow: 0 6px 20px rgba(27, 102, 89, 0.4);
}

/* Botones de acción en la tabla */
.btn-edit, .btn-delete, .btn-view {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  margin-right: 8px;
  transition: color 0.2s;
}

.btn-edit {
  color: #1b6659;
}

.btn-delete {
  color: #e74c3c;
}

.btn-view {
  color: #e67e22;
}

.btn-edit:hover {
  color: #2d8a7a;
}

.btn-delete:hover {
  color: #c0392b;
}

.btn-view:hover {
  color: #d35400;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .page-title {
    font-size: 28px;
  }
  .page-title i {
    font-size: 32px;
  }
  .main-content {
    padding: 20px 5px;
  }
  .table-section {
    padding: 10px;
  }
  .table-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  .btn-add {
    align-self: center;
  }
}
</style> 