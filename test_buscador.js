// Script de prueba para el buscador de campos relacionales
// Ejecuta esto en la consola del navegador (F12)

console.log('=== TEST BUSCADOR ===');

// 1. Verificar que las funciones existen
function verificarFunciones() {
  const funcionesNecesarias = [
    'mostrarOpciones',
    'ocultarOpciones', 
    'filtrarOpciones',
    'filtrarOpcionesNuevaFila',
    'seleccionarOpcion',
    'seleccionarOpcionNuevaFila'
  ];
  
  console.log('Verificando funciones del buscador...');
  funcionesNecesarias.forEach(func => {
    if (typeof window[func] === 'function') {
      console.log(`✅ ${func} - OK`);
    } else {
      console.log(`❌ ${func} - NO ENCONTRADA`);
    }
  });
}

// 2. Verificar datos de prueba
function verificarDatosPrueba() {
  const secciones = JSON.parse(localStorage.getItem('crmSecciones') || '[]');
  
  if (secciones.length === 0) {
    console.log('❌ No hay datos de prueba. Ejecuta crearDatosPrueba() primero.');
    return false;
  }
  
  console.log('✅ Datos encontrados:', secciones.length, 'secciones');
  
  // Verificar que hay campos relacionales
  let camposRelacionales = 0;
  secciones.forEach(seccion => {
    if (seccion.columnas) {
      seccion.columnas.forEach(col => {
        if (typeof col === 'object' && col.tipo === 'relacional') {
          camposRelacionales++;
          console.log(`✅ Campo relacional encontrado: ${col.nombre} en ${seccion.nombre}`);
        }
      });
    }
  });
  
  if (camposRelacionales === 0) {
    console.log('❌ No hay campos relacionales configurados.');
    return false;
  }
  
  return true;
}

// 3. Crear datos de prueba mejorados
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
        { nombre: "Hogar", descripcion: "Artículos para el hogar", activo: "Sí" },
        { nombre: "Deportes", descripcion: "Artículos deportivos", activo: "Sí" },
        { nombre: "Libros", descripcion: "Libros y publicaciones", activo: "Sí" },
        { nombre: "Juguetes", descripcion: "Juguetes y entretenimiento", activo: "Sí" },
        { nombre: "Automóviles", descripcion: "Vehículos y repuestos", activo: "Sí" },
        { nombre: "Jardín", descripcion: "Artículos de jardinería", activo: "Sí" }
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
        { nombre: "Camiseta", precio: "25", categoria: "Ropa" },
        { nombre: "Sofá", precio: "500", categoria: "Hogar" }
      ]
    }
  ];
  
  localStorage.setItem('crmSecciones', JSON.stringify(datosPrueba));
  console.log('✅ Datos de prueba creados con 8 categorías para probar el buscador.');
  console.log('Recarga la página y ve a la sección "Productos" para probar el buscador.');
}

// 4. Simular búsqueda
function simularBusqueda() {
  console.log('Simulando búsqueda...');
  
  // Simular evento de input
  const evento = {
    target: {
      value: 'elec'
    }
  };
  
  const columna = {
    nombre: 'categoria',
    seccionRelacionada: 'Categorías',
    campoMostrar: 'nombre'
  };
  
  console.log('Buscando "elec" en categorías...');
  
  // Obtener opciones
  const secciones = JSON.parse(localStorage.getItem('crmSecciones') || '[]');
  const sec = secciones.find(s => s.nombre === columna.seccionRelacionada);
  
  if (sec && sec.datos) {
    const opciones = [...new Set(sec.datos.map(fila => fila[columna.campoMostrar]).filter(Boolean))];
    const filtradas = opciones.filter(opcion => opcion.toLowerCase().includes('elec'));
    
    console.log('Opciones totales:', opciones);
    console.log('Opciones filtradas:', filtradas);
    
    if (filtradas.length > 0) {
      console.log('✅ Búsqueda funcionando correctamente');
    } else {
      console.log('❌ No se encontraron resultados');
    }
  }
}

// Ejecutar pruebas
console.log('\n=== EJECUTANDO PRUEBAS ===');
verificarFunciones();
verificarDatosPrueba();

console.log('\n=== FUNCIONES DISPONIBLES ===');
console.log('crearDatosPrueba() - Crea datos de ejemplo con 8 categorías');
console.log('simularBusqueda() - Simula una búsqueda para verificar funcionamiento');
console.log('verificarDatosPrueba() - Verifica que hay datos para probar');
console.log('verificarFunciones() - Verifica que las funciones existen');

console.log('\n=== INSTRUCCIONES ===');
console.log('1. Ejecuta crearDatosPrueba() si no tienes datos');
console.log('2. Recarga la página');
console.log('3. Ve a la sección "Productos"');
console.log('4. Haz click en el campo "categoria"');
console.log('5. Escribe para buscar (ej: "elec", "ropa", "hogar")');
console.log('6. Click en una opción para seleccionarla'); 