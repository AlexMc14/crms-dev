// Script de depuración para el CRM
// Ejecuta esto en la consola del navegador (F12)

console.log('=== DEBUG CRM ===');

// 1. Verificar localStorage
const secciones = JSON.parse(localStorage.getItem('crmSecciones') || '[]');
console.log('Secciones en localStorage:', secciones);

// 2. Verificar estructura de cada sección
secciones.forEach((seccion, index) => {
  console.log(`\n--- Sección ${index + 1}: ${seccion.nombre} ---`);
  console.log('Columnas:', seccion.columnas);
  console.log('Datos:', seccion.datos);
  
  // Verificar campos relacionales
  if (seccion.columnas) {
    const camposRelacionales = seccion.columnas.filter(col => 
      typeof col === 'object' && col.tipo === 'relacional'
    );
    if (camposRelacionales.length > 0) {
      console.log('Campos relacionales encontrados:', camposRelacionales);
    }
  }
});

// 3. Función para limpiar datos corruptos
function limpiarDatosCorruptos() {
  console.log('Limpiando datos corruptos...');
  localStorage.removeItem('crmSecciones');
  console.log('Datos eliminados. Recarga la página.');
}

// 4. Función para crear datos de prueba
function crearDatosPrueba() {
  const datosPrueba = [
    {
      nombre: "Categorías",
      columnas: [
        { nombre: "nombre", tipo: "texto" },
        { nombre: "descripcion", tipo: "texto" },
        { nombre: "activo", tipo: "texto" }
      ],
      datos: [
        { nombre: "Electrónicos", descripcion: "Productos electrónicos", activo: "Sí" },
        { nombre: "Ropa", descripcion: "Vestimenta", activo: "Sí" },
        { nombre: "Hogar", descripcion: "Artículos para el hogar", activo: "Sí" }
      ]
    },
    {
      nombre: "Productos",
      columnas: [
        { nombre: "nombre", tipo: "texto" },
        { nombre: "precio", tipo: "numero" },
        { nombre: "categoria", tipo: "relacional", seccionRelacionada: "Categorías", campoMostrar: "nombre" }
      ],
      datos: [
        { nombre: "Laptop", precio: "999", categoria: "Electrónicos" },
        { nombre: "Camiseta", precio: "25", categoria: "Ropa" }
      ]
    }
  ];
  
  localStorage.setItem('crmSecciones', JSON.stringify(datosPrueba));
  console.log('Datos de prueba creados. Recarga la página.');
}

// 5. Función para verificar relaciones
function verificarRelaciones() {
  const secciones = JSON.parse(localStorage.getItem('crmSecciones') || '[]');
  
  secciones.forEach(seccion => {
    if (seccion.columnas) {
      seccion.columnas.forEach(col => {
        if (typeof col === 'object' && col.tipo === 'relacional') {
          const seccionRelacionada = secciones.find(s => s.nombre === col.seccionRelacionada);
          if (!seccionRelacionada) {
            console.error(`❌ Campo relacional "${col.nombre}" en "${seccion.nombre}" apunta a sección inexistente: "${col.seccionRelacionada}"`);
          } else {
            const campoExiste = seccionRelacionada.columnas.some(c => 
              (typeof c === 'string' ? c : c.nombre) === col.campoMostrar
            );
            if (!campoExiste) {
              console.error(`❌ Campo relacional "${col.nombre}" en "${seccion.nombre}" apunta a campo inexistente: "${col.campoMostrar}" en "${col.seccionRelacionada}"`);
            } else {
              console.log(`✅ Campo relacional "${col.nombre}" en "${seccion.nombre}" está correctamente configurado`);
            }
          }
        }
      });
    }
  });
}

console.log('\n=== FUNCIONES DISPONIBLES ===');
console.log('limpiarDatosCorruptos() - Elimina todos los datos del CRM');
console.log('crearDatosPrueba() - Crea datos de ejemplo para probar');
console.log('verificarRelaciones() - Verifica que las relaciones estén correctas');

// Ejecutar verificación automática
verificarRelaciones(); 