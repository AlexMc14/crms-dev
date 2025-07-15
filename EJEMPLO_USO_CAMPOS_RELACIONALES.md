# Ejemplo de Uso - Campos Relacionales

## Paso a Paso para Probar

### 1. Limpiar datos existentes (opcional)
Si tienes datos antiguos que pueden causar conflictos:
1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña "Application" o "Aplicación"
3. En "Local Storage", elimina la clave "crmSecciones"
4. Recarga la página

### 2. Crear la sección "Categorías"
1. Ve al CRM Dinámico
2. Crea una nueva sección llamada "Categorías"
3. Agrega estos campos:
   - `nombre` (tipo: texto)
   - `descripcion` (tipo: texto)
   - `activo` (tipo: texto)
4. Agrega algunos datos de ejemplo:
   - Nombre: "Electrónicos", Descripción: "Productos electrónicos", Activo: "Sí"
   - Nombre: "Ropa", Descripción: "Vestimenta", Activo: "Sí"
   - Nombre: "Hogar", Descripción: "Artículos para el hogar", Activo: "Sí"

### 3. Crear la sección "Productos"
1. Crea otra sección llamada "Productos"
2. Agrega estos campos:
   - `nombre` (tipo: texto)
   - `precio` (tipo: número)
   - `categoria` (tipo: relacional)

### 4. Configurar el campo relacional
Para el campo `categoria` en "Productos":
1. **Tipo de campo**: Selecciona "Relacional"
2. **Sección relacionada**: Selecciona "Categorías"
3. **Campo a mostrar**: Selecciona "nombre"
4. Haz clic en "Agregar Campo"

### 5. Verificar que funciona
1. En la tabla de "Productos", deberías ver:
   - Una columna "Categoria" con un dropdown
   - El dropdown debería mostrar: "Electrónicos", "Ropa", "Hogar"
2. Agrega un producto:
   - Nombre: "Laptop"
   - Precio: 999
   - Categoría: Selecciona "Electrónicos" del dropdown

### 6. Probar la relación
1. Ve a la sección "Categorías"
2. Agrega una nueva categoría: "Deportes"
3. Vuelve a "Productos"
4. El dropdown de categoría debería incluir "Deportes"

## Solución de Problemas

### Si los campos relacionales no aparecen:
1. Verifica que la sección relacionada tenga datos
2. Asegúrate de que el campo a mostrar tenga valores
3. Recarga la página

### Si todos los campos tienen el mismo valor:
1. Limpia el localStorage como se indica en el paso 1
2. Crea las secciones desde cero

### Si el dropdown está vacío:
1. Verifica que la sección relacionada tenga datos
2. Asegúrate de que el campo a mostrar tenga valores no vacíos
3. Verifica que los nombres de las secciones coincidan exactamente

## Estructura de Datos Esperada

### Sección "Categorías":
```json
{
  "nombre": "Categorías",
  "columnas": [
    {"nombre": "nombre", "tipo": "texto"},
    {"nombre": "descripcion", "tipo": "texto"},
    {"nombre": "activo", "tipo": "texto"}
  ],
  "datos": [
    {"nombre": "Electrónicos", "descripcion": "Productos electrónicos", "activo": "Sí"},
    {"nombre": "Ropa", "descripcion": "Vestimenta", "activo": "Sí"}
  ]
}
```

### Sección "Productos":
```json
{
  "nombre": "Productos",
  "columnas": [
    {"nombre": "nombre", "tipo": "texto"},
    {"nombre": "precio", "tipo": "numero"},
    {"nombre": "categoria", "tipo": "relacional", "seccionRelacionada": "Categorías", "campoMostrar": "nombre"}
  ],
  "datos": [
    {"nombre": "Laptop", "precio": "999", "categoria": "Electrónicos"}
  ]
}
``` 