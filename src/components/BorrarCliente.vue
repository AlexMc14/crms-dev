<template>
  <div>
    <form>
      <div class="row">
        <div class="col-12">
          <span>¿Estás seguro que deseas eliminar a {{ client.nombre + client.apellidos }}?</span>
        </div>
        <div class="col-12 text-center mt-4">
          <p-button type="danger" round @click.native.prevent="deleteClient">
            Sí, borrar
          </p-button>
          <p-button class="ml-3" type="info" round @click.native.prevent="cancelDelete">
            No, cancelar
          </p-button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>

export default {
  props: {
    client: {
      type: Object,
      require: false,
    },
  },
  setup(props, { emit }) {

    const cancelDelete = () => {
      emit("cancelDelete");
    };
    const deleteClient = () => {
      emit("deleteClient");
    };

    return {
      deleteClient,
      cancelDelete,
    };
  },
};
</script>

<style>
.custom-select-wrapper {
  position: relative;
  width: 300px;
}

.custom-select {
  appearance: none;
  width: 100%;
  padding: 10px 40px 10px 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #fffcf5 !important;
  color: #66615b;
  font-size: 16px;
  cursor: pointer;
  outline: none;
  position: relative;
}

.custom-select:focus {
  border-color: #007BFF;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}

.custom-select-wrapper::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 25px;
  width: 10px;
  height: 10px;
  background.color: #fffcf5;
  clip-path: polygon(100% 0%, 0 0%, 50% 100%);
  transform: translateY(-50%);
  pointer-events: none;
}
</style>
