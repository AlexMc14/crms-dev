<template>
  <div>
    <div class="invoice-container" ref="invoice">
      <div class="invoice-header" style="margin-bottom: -60px;">
        <!-- <img :src="headerImage" alt="Encabezado de Factura" class="header-image" /> -->
        <img src="../assets/img/header.png" alt="Encabezado de Factura" class="header-image" />
      </div>
      
      <div class="invoice-body">
        <div class="company-info">
          <p>Nombre: {{ company.name }}</p>
          <p>Teléfono: {{ company.phone }}</p>
          <p>Dirección: {{ company.address }}</p>
          <p>Correo electrónico: {{ company.email }}</p>
          <p>CIF: {{ company.cif }}</p>
        </div>
        
        <table class="invoice-table">
          <thead>
            <tr>
              <th style="color:white; text-align: center; background:  rgb(0 175 223);">SERVICIO</th>
              <th style="color:white; text-align: center; background:  rgb(0 175 223);">PRECIO</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in services" :key="index">
              <td>{{ item.name }}</td>
              <td>{{ item.price.toFixed(2) }} €</td>
            </tr>
          </tbody>
        </table>
        
        <div class="totals mt-3">
          <p>Total: {{ subtotal.toFixed(2) }} €</p>
          <!-- <p>IVA (21%): {{ vat.toFixed(2) }} €</p> -->
          <!-- <p>Total: {{ total.toFixed(2) }} €</p> -->
        </div>
      </div>
      
      <div class="invoice-footer">
        <!-- <img :src="footerImage" alt="Pie de página" class="footer-image" /> -->
        <img src="../assets/img/footer.png" alt="Pie de página" class="footer-image" />
      </div>
    </div>
    
    <div class="add-service">
      <h3>Añadir Servicio</h3>
      <label>Servicio: <input v-model="item.name" /></label>
      <label>Precio (€): <input v-model.number="item.price" type="number" /></label>
      <button @click="addItem">Añadir</button>
    </div>
    
    <button @click="exportToPDF">Exportar a PDF</button>
  </div>
</template>

<script>
import html2pdf from "html2pdf.js";

export default {
  data() {
    return {
      headerImage: '/mnt/data/PARTE SUPERIOR.png',
      footerImage: '/mnt/data/Fondo para escritos sin viabilidad.png',
      company: {
        name: '',
        phone: '',
        address: '',
        email: '',
        cif: ''
      },
      services: [],
      item: {
        name: '',
        price: 0
      }
    };
  },
  computed: {
    subtotal() {
      return this.services.reduce((sum, item) => sum + (item.price || 0), 0);
    },
    vat() {
      return this.subtotal * 0.21;
    },
    total() {
      return this.subtotal + this.vat;
    }
  },
  methods: {
    exportToPDF() {
      const element = this.$refs.invoice;
      html2pdf().from(element).save("factura.pdf");
    },
    addItem() {
      if (this.item.name && this.item.price > 0) {
        this.services.push({ ...this.item });
        this.item.name = '';
        this.item.price = 0;
      }
    }
  }
};
</script>

<style>
.invoice-container {
  width: 100%;
  max-width: 800px;
  margin: auto;
  padding: 20px;
  border: 1px solid #ccc;
  background: white;
}
.header-image, .footer-image {
  width: 100%;
  display: block;
  height: 270px;
}
.company-info p, .invoice-table td, .invoice-table th {
  padding: 5px;
  margin: 5px 0;
}
.invoice-table {
  width: 100%;
  border-collapse: collapse;
}
.invoice-table th, .invoice-table td {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: left;
}
.add-service {
  margin: 20px 0;
}
button {
  padding: 10px;
  margin: 10px 0;
  cursor: pointer;
}
</style>
