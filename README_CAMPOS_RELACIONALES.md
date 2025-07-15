# Campos Relacionales en el CRM Dinámico

## Descripción

La nueva funcionalidad de campos relacionales permite crear enlaces entre diferentes secciones del CRM, permitiendo que un campo en una sección muestre datos de otra sección.

## Ejemplo de Uso

### 1. Crear la sección "Categorías"

1. Ve al CRM Dinámico
2. Crea una nueva sección llamada "Categorías"
3. Agrega campos como:
   - `nombre` (tipo: texto)
   - `descripcion` (tipo: texto)
   - `activo` (tipo: texto)

### 2. Crear la sección "Productos"

1. Crea otra sección llamada "Productos"
2. Agrega campos como:
   - `nombre` (tipo: texto)
   - `precio` (tipo: número)
   - `categoria` (tipo: relacional)

### 3. Configurar el campo relacional

Para el campo `categoria` en la sección "Productos":

1. **Tipo de campo**: Selecciona "Relacional"
2. **Sección relacionada**: Selecciona "Categorías"
3. **Campo a mostrar**: Selecciona "nombre" (el campo de Categorías que quieres mostrar)

### 4. Resultado

Ahora cuando agregues productos:
- El campo `categoria` mostrará un dropdown con todos los nombres de categorías
- Al seleccionar una categoría, se guardará el nombre de la categoría en el producto
- Esto crea una relación entre productos y categorías

## Tipos de Campos Disponibles

### Campos Simples
- **Texto**: Para nombres, descripciones, etc.
- **Número**: Para precios, cantidades, etc.
- **Fecha**: Para fechas de creación, vencimiento, etc.

### Campos Relacionales
- **Relacional**: Para enlazar con otras secciones

## Configuración de Campos Relacionales

Cuando selecciones "Relacional" como tipo de campo:

1. **Sección relacionada**: Lista todas las secciones disponibles (excepto la actual)
2. **Campo a mostrar**: Lista todos los campos de la sección seleccionada

## Ejemplos de Uso Común

### Clientes y Vendedores
- Sección "Vendedores" con campos: `nombre`, `email`, `telefono`
- Sección "Clientes" con campos: `nombre`, `email`, `vendedor` (relacional → Vendedores.nombre)

### Productos y Proveedores
- Sección "Proveedores" con campos: `nombre`, `contacto`, `telefono`
- Sección "Productos" con campos: `nombre`, `precio`, `proveedor` (relacional → Proveedores.nombre)

### Casos y Abogados
- Sección "Abogados" con campos: `nombre`, `especialidad`, `telefono`
- Sección "Casos" con campos: `numero`, `descripcion`, `abogado` (relacional → Abogados.nombre)

## Ventajas

1. **Integridad de datos**: Evita errores de escritura en campos relacionados
2. **Facilidad de uso**: Dropdowns automáticos con opciones válidas
3. **Flexibilidad**: Puedes cambiar qué campo mostrar de la sección relacionada
4. **Escalabilidad**: Fácil agregar nuevas opciones en la sección relacionada

## Notas Importantes

- Los campos relacionales solo muestran valores únicos de la sección relacionada
- Si eliminas un valor de la sección relacionada, los registros que lo usen mantendrán el valor
- Puedes tener múltiples campos relacionales en una misma sección
- Los campos relacionales funcionan en ambas direcciones (sección A puede relacionarse con sección B y viceversa) 