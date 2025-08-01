<template>
  <div class="crm-seccion-container">
    <!-- Header con título -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          {{ seccionActual ? seccionActual.nombre : 'Sección no encontrada' }}
        </h1>
      </div>
    </div>


          <!-- Acciones de la sección -->
      <!-- <div class="table-section">
        <div class="table-header">
          <h2>Acciones de la Sección</h2>
        </div>
        <div class="actions-section">
          <div class="row">
            <div class="col-md-3">
              <button class="btn-secondary" @click="exportarSeccion">
                <i class="ti-download"></i> Exportar Sección
              </button>
            </div>
            <div class="col-md-3">
              <button class="btn-secondary" @click="limpiarSeccion">
                <i class="ti-trash"></i> Limpiar Sección
              </button>
            </div>
            <div class="col-md-3">
              <button class="btn-secondary" @click="guardarSeccion">
                <i class="ti-save"></i> Guardar Cambios
              </button>
            </div>
            <div class="col-md-3">
              <button class="btn-secondary" @click="$router.push('/crm-dinamico')">
                <i class="ti-arrow-left"></i> Volver al CRM
              </button>
            </div>
          </div>
        </div>
      </div> -->

    <!-- Contenido principal -->
    <div v-if="cargando" class="text-center">Cargando...</div>
    <div v-else-if="seccionActual" class="main-content">
      <!-- Gestión de campos para esta sección -->
      <div class="table-section">
        <div class="table-header">
          <h2>Gestión de Campos</h2>
          <div class="header-actions">
            <button class="btn-config" @click="showFieldsModal = true">
              <i class="ti-settings"></i> Configurar Campos
            </button>
            <button 
              v-if="hasDateField && hasCalendarConfigs && !calendarEnabled" 
              class="btn-calendar" 
              @click="showCalendarSettings = true"
            >
              <i class="ti-calendar"></i> Habilitar Calendario
            </button>
            <button 
              v-if="calendarEnabled" 
              class="btn-calendar-config" 
              @click="showCalendarSettings = true"
            >
              <i class="ti-settings"></i> Configurar Calendario
            </button>
          </div>
        </div>
        <div class="fields-summary">
          <div class="summary-stats">
            <div class="stat-item">
              <span class="stat-number">{{ seccionActual.columnas.length }}</span>
              <span class="stat-label">Campos definidos</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ seccionActual.datos ? seccionActual.datos.length : 0 }}</span>
              <span class="stat-label">Registros</span>
            </div>
          </div>
          <div class="fields-preview">
            <h5>Campos actuales:</h5>
            <div class="fields-tags">
              <span 
                v-for="(columna, index) in seccionActual.columnas.slice(0, 5)" 
                :key="index" 
                class="field-tag"
                :class="getTipoClase(columna)"
              >
                {{ (columna.nombre || columna).charAt(0).toUpperCase() + (columna.nombre || columna).slice(1) }}
              </span>
              <span v-if="seccionActual.columnas.length > 5" class="field-tag-more">
                +{{ seccionActual.columnas.length - 5 }} más
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Selector de vista -->
      <div class="view-selector-section">
        <div class="view-tabs">
          <button 
            class="view-tab" 
            :class="{ active: currentView === 'table' }"
            @click="currentView = 'table'"
          >
            <i class="ti-list"></i> Tabla
          </button>
          <button 
            class="view-tab" 
            :class="{ active: currentView === 'calendar' }"
            @click="currentView = 'calendar'"
            v-if="calendarEnabled"
          >
            <i class="ti-calendar"></i> Calendario
          </button>
        </div>
        
        <!-- Información de vista avanzada -->
        <!-- <div class="advanced-view-info">
          <div class="info-badge">
            <i class="ti-database"></i>
            <span>Vista Avanzada con Filtros y Paginación</span>
          </div>
        </div> -->
      </div>

      <!-- Filtros dinámicos colapsables -->
      <div v-if="currentView === 'table'" class="filtros-section">
        <div class="filtros-header-collapsible" @click="toggleFiltros">
          <div class="filtros-title">
            <i class="ti-filter"></i>
            <span>Filtros Avanzados</span>
            <span v-if="filtrosActivos" class="filtros-count">({{ Object.keys(filtrosActivos).length }} activos)</span>
          </div>
          <div class="filtros-toggle">
            <i class="ti-angle-down" :class="{ 'rotated': filtrosAbiertos }"></i>
          </div>
        </div>
        
        <div v-if="filtrosAbiertos" class="filtros-content-collapsible">
          <div v-if="!seccionActual || !seccionActual.columnas" class="text-center text-muted">
            <p>Cargando campos de filtros...</p>
          </div>
          <FiltrosDinamicos
            v-else
            :campos-disponibles="seccionActual.columnas"
            :secciones="secciones"
            @filtros-cambiados="aplicarFiltros"
          />
        </div>
      </div>

      <!-- Vista de tabla -->
      <div v-if="currentView === 'table'" class="table-section">
        <div class="table-header">
          <div class="header-left">
            <h2>Datos de {{ seccionActual.nombre }}</h2>
            <span class="record-count">
              {{ pagination.totalItems || 0 }} registros
            </span>
          </div>
          <div class="header-right">
            <button class="btn-add-header" @click="showAddModal = true">
              <i class="ti-plus"></i> Agregar Registro
            </button>
          </div>
        </div>
        <div class="table-responsive">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th v-for="columna in seccionActual.columnas" :key="columna.nombre || columna" class="text-capitalize">
                  {{ (columna.nombre || columna).charAt(0).toUpperCase() + (columna.nombre || columna).slice(1) }}
                </th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <!-- Loading de registros -->
              <tr v-if="loading">
                <td :colspan="seccionActual.columnas.length + 1" class="text-center">
                  <i class="ti-reload" style="animation: spin 1s linear infinite;"></i>
                  Cargando registros...
                </td>
              </tr>
              
              <!-- Sin registros -->
              <tr v-else-if="!registros || registros.length === 0">
                <td :colspan="seccionActual.columnas.length + 1" class="text-center text-muted">
                  <div v-if="Object.keys(filtrosActivos).length > 0">
                    <i class="ti-search" style="font-size: 2rem; color: #ccc; margin-bottom: 10px;"></i>
                    <p>No se encontraron registros con los filtros aplicados.</p>
                    <button class="btn-clear-filters" @click="limpiarFiltros">
                      <i class="ti-close"></i> Limpiar Filtros
                    </button>
                  </div>
                  <div v-else>
                    <i class="ti-database" style="font-size: 2rem; color: #ccc; margin-bottom: 10px;"></i>
                    <p>No hay registros aún.</p>
                    <button class="btn-add" @click="showAddModal = true">
                      <i class="ti-plus"></i> Agregar primer registro
                    </button>
                  </div>
                </td>
              </tr>
              
              <!-- Registros -->
              <tr v-for="(fila, filaIndex) in registros" :key="fila._id || filaIndex">
                <td v-for="columna in seccionActual.columnas" :key="columna.nombre || columna">
                  <template v-if="fila._id ? filaEditando === fila._id : true">
                    <template v-if="columna.tipo === 'relacional'">
                      <div class="search-select-container">
                        <input
                          type="text"
                          class="form-control form-control-sm"
                          v-model="fila.valores[columna.nombre]"
                          :placeholder="'Buscar en ' + columna.seccionRelacionada"
                          @input="filtrarOpciones($event, columna, fila, filaIndex)"
                          @focus="mostrarOpciones(columna, fila, filaIndex)"
                          autocomplete="off"
                        >
                        <div v-if="opcionesVisibles[columna.nombre + '_' + filaIndex]" class="opciones-dropdown">
                          <div
                            v-for="opcion in opcionesFiltradas[columna.nombre + '_' + filaIndex]"
                            :key="opcion"
                            class="opcion-item"
                            @mousedown.prevent="seleccionarOpcion(opcion, columna.nombre, fila, filaIndex)"
                          >
                            {{ opcion }}
                          </div>
                          <div v-if="opcionesFiltradas[columna.nombre + '_' + filaIndex].length === 0" class="no-opciones">
                            No se encontraron resultados
                          </div>
                        </div>
                      </div>
                    </template>
                    <template v-else-if="columna.tipo === 'numero'">
                      <input
                        type="number"
                        class="form-control form-control-sm"
                        v-model="fila.valores[columna.nombre]"
                        :placeholder="'Ingrese ' + columna.nombre"
                      >
                    </template>
                    <template v-else-if="columna.tipo === 'fecha'">
                      <input
                        type="date"
                        class="form-control form-control-sm"
                        v-model="fila.valores[columna.nombre]"
                        :placeholder="'Ingrese ' + columna.nombre"
                      >
                    </template>
                    <template v-else>
                      <input
                        type="text"
                        class="form-control form-control-sm"
                        v-model="fila.valores[columna.nombre]"
                        :placeholder="'Ingrese ' + columna.nombre"
                      >
                    </template>
                  </template>
                  <template v-else>
                    {{ fila.valores[columna.nombre] }}
                  </template>
                </td>
                <td class="text-center">
                  <button class="btn-delete" @click="eliminarFila(filaIndex)" title="Eliminar fila">
                    <i class="ti-trash"></i>
                  </button>
                 <!-- Para filas nuevas (sin _id): solo mostrar guardar -->
                 <template v-if="!fila._id">
                   <button class="btn-add" @click="guardarFilaEditada(fila, filaIndex)" title="Guardar">
                     <i class="ti-save"></i>
                   </button>
                 </template>
                 <!-- Para filas existentes -->
                 <template v-else>
                   <button v-if="filaEditando !== fila._id" class="btn-edit ml-2" @click="filaEditando = fila._id" title="Editar">
                     <i class="ti-pencil"></i>
                   </button>
                   <button v-if="filaEditando === fila._id" class="btn-add" @click="guardarFilaEditada(fila, filaIndex); filaEditando = null" title="Guardar cambios">
                     <i class="ti-save"></i>
                   </button>
                   <button v-if="filaEditando === fila._id" class="btn-edit" @click="revertirFila(fila, filaIndex); filaEditando = null" title="Cancelar">
                     <i class="ti-close"></i>
                   </button>
                 </template>
                </td>
              </tr>
            </tbody>
                    </table>
        </div>
        
        <!-- Controles de paginación -->
        <div class="paginacion-controls" v-if="pagination && pagination.totalPages > 1">
          <div class="pagination-info">
            <span>
              Mostrando {{ pagination.currentPage * pagination.itemsPerPage - pagination.itemsPerPage + 1 }} 
              a {{ Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems) }} 
              de {{ pagination.totalItems }} registros
            </span>
          </div>
          
          <div class="pagination-buttons">
            <button 
              class="btn-pagination" 
              :disabled="!pagination.hasPrevPage"
              @click="cambiarPagina(pagination.prevPage)"
            >
              <i class="ti-angle-left"></i> Anterior
            </button>
            
            <span class="page-info">
              Página {{ pagination.currentPage }} de {{ pagination.totalPages }}
            </span>
            
            <button 
              class="btn-pagination" 
              :disabled="!pagination.hasNextPage"
              @click="cambiarPagina(pagination.nextPage)"
            >
              Siguiente <i class="ti-angle-right"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Vista de calendario -->
      <div v-if="currentView === 'calendar'" class="calendar-section">
        <!-- Selector de calendarios -->
        <div v-if="calendarConfigs.length > 1" class="calendar-selector">
          <h6>Calendarios de {{ seccionActual.nombre }}:</h6>
          <div class="calendar-tabs">
            <button
              v-for="calendar in calendarConfigs"
              :key="calendar._id"
              class="calendar-tab"
              :class="{ active: selectedCalendar && selectedCalendar._id === calendar._id }"
              @click="selectCalendar(calendar)"
            >
              <span class="calendar-color" :style="{ backgroundColor: calendar.defaultColor }"></span>
              {{ calendar.title }}
              <span v-if="!calendar.enabled" class="disabled-badge">Deshabilitado</span>
            </button>
          </div>
        </div>
        
        <div class="table-header">
          <h2>{{ calendarTitle || 'Calendario' }}</h2>
          <div class="calendar-controls">
            <span class="record-count">{{ calendarEvents.length }} eventos</span>
            <button class="btn-config" @click="showCalendarSettings = true">
              <i class="ti-settings"></i> Configurar Calendario
            </button>
          </div>
        </div>
        
        <!-- Debug info -->
        <div class="debug-info">
          <h6>Estado del Calendario:</h6>
          <p>✅ Calendario habilitado: {{ calendarEnabled }}</p>
          <p>📅 Campo de fecha: {{ dateFieldName || 'No configurado' }}</p>
          <p>📝 Campo de título: {{ titleFieldName || 'No configurado' }}</p>
          <p>📊 Eventos disponibles: {{ calendarEvents.length }}</p>
          <p>👁️ Vista actual: {{ currentView }}</p>
          <button class="btn-test" @click="currentView = 'calendar'">
            🔄 Forzar Vista Calendario
          </button>
        </div>
        
                  <CalendarView 
            v-if="calendarEnabled && dateFieldName && titleFieldName"
            :key="`calendar-${seccionActual ? seccionActual._id || seccionActual.id : 'no-section'}`"
            :events="calendarEvents"
            :date-field="dateFieldName"
            :title-field="titleFieldName"
            :available-fields="{}"
            :loading="calendarLoading"
            @add-event="addCalendarEvent"
            @update-event="updateCalendarEvent"
            @delete-event="deleteCalendarEvent"
            @month-changed="loadCalendarData"
          />
        
        <div v-if="calendarEnabled && dateFieldName && titleFieldName && calendarEvents.length === 0" class="no-events">
          <i class="ti-calendar" style="font-size: 3rem; color: #ccc; margin-bottom: 15px;"></i>
          <h6>No hay eventos en el calendario</h6>
          <p>Agrega algunos registros con fechas para verlos en el calendario.</p>
        </div>
      </div>
    </div>
    <div v-else class="main-content">
      <div class="table-section">
        <div class="text-center">
          <i class="ti-alert" style="font-size: 4rem; color: #dc3545; margin-bottom: 20px;"></i>
          <h3>Sección no encontrada</h3>
          <p>La sección que buscas no existe o ha sido eliminada.</p>
          <button class="btn-add" @click="$router.push('/crm-dinamico')">
            <i class="ti-arrow-left"></i> Volver al CRM
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación para limpiar sección -->
    <b-modal v-model="showClearModal" title="Confirmar acción" hide-footer>
      <div class="text-center">
        <p>¿Estás seguro de que quieres eliminar todos los datos de la sección <strong>{{ seccionActual ? seccionActual.nombre : '' }}</strong>?</p>
        <p class="text-danger">Esta acción no se puede deshacer.</p>
        <div class="mt-3">
          <b-button variant="danger" @click="confirmarLimpiarSeccion" class="mr-2">Eliminar Todo</b-button>
          <b-button variant="secondary" @click="showClearModal = false">Cancelar</b-button>
        </div>
      </div>
    </b-modal>

    <!-- Modal de configuración del calendario -->
    <b-modal 
      v-model="showCalendarSettings" 
      title="Configuración del Calendario" 
      size="lg"
      hide-footer
    >
      <div class="calendar-settings">
        <!-- Selección de calendario -->
        <div class="setting-section">
          <h5>Seleccionar Calendario</h5>
          <p>Elige un calendario existente o crea uno nuevo:</p>
          
          <div class="calendar-selection">
            <div class="calendar-options">
              <div 
                v-for="calendar in calendarConfigs" 
                :key="calendar._id"
                class="calendar-option"
                :class="{ active: selectedCalendar && selectedCalendar._id === calendar._id }"
                @click="selectCalendarFromModal(calendar)"
              >
                <div class="option-header">
                  <span class="option-color" :style="{ backgroundColor: calendar.defaultColor }"></span>
                  <span class="option-title">{{ calendar.title }}</span>
                  <span v-if="!calendar.enabled" class="option-status">Deshabilitado</span>
                </div>
                <div class="option-details">
                  <small>{{ calendar.dateField }} → {{ calendar.titleField }}</small>
                </div>
              </div>
              
              <div class="calendar-option new-option" @click="createNewCalendar">
                <div class="option-header">
                  <span class="option-icon">+</span>
                  <span class="option-title">Crear Nuevo Calendario</span>
                </div>
                <div class="option-details">
                  <small>Configurar desde cero</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Configuración del calendario seleccionado -->
        <div v-if="selectedCalendar || calendarEnabled" class="setting-section">
          <h5>{{ selectedCalendar ? 'Configurar: ' + selectedCalendar.title : 'Nuevo Calendario' }}</h5>
          <p>Configura los campos y opciones del calendario:</p>
          
          <div class="form-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="calendarEnabled"
                @change="toggleCalendar"
              >
              <span class="checkmark"></span>
              Habilitar calendario para esta sección
            </label>
          </div>
        </div>

        <div v-if="calendarEnabled" class="setting-section">
          <h6>Configuración de Campos</h6>
          
          <div class="form-group">
            <label>Título del calendario:</label>
            <input
              type="text"
              class="form-control"
              v-model="calendarTitle"
              placeholder="Ej: Calendario de Citas, Eventos del Mes..."
              :disabled="!calendarEnabled"
              @input="onTitleChange"
            >
            <small class="text-muted">Valor actual: "{{ calendarTitle }}"</small>
          </div>
          
          <div class="form-group">
            <label>Campo de fecha:</label>
            <select class="form-control" v-model="dateFieldName" :disabled="!calendarEnabled">
              <option value="">Selecciona un campo de fecha</option>
              <option v-for="columna in dateFields" :key="columna.nombre" :value="columna.nombre">
                {{ columna.nombre }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Campo de título:</label>
            <select class="form-control" v-model="titleFieldName" :disabled="!calendarEnabled">
              <option value="">Selecciona un campo para el título</option>
              <option v-for="columna in textFields" :key="columna.nombre" :value="columna.nombre">
                {{ columna.nombre }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Campos para mostrar en el calendario:</label>
            <div class="fields-checkboxes">
              <div v-if="availableFieldsForCalendar.length === 0" class="no-fields">
                <p>No hay campos adicionales disponibles para mostrar.</p>
              </div>
              <template v-else>
                <div v-for="fieldName in availableFieldsForCalendar" :key="fieldName" class="field-checkbox">
                  <label class="checkbox-label">
                    <input 
                      type="checkbox" 
                      :value="fieldName"
                      v-model="selectedDisplayFields"
                      :disabled="!calendarEnabled"
                    >
                    <span class="checkmark"></span>
                    {{ fieldName }}
                  </label>
                </div>
              </template>
            </div>
          </div>

          <div class="form-group">
            <label>Color por defecto:</label>
            <select class="form-control" v-model="defaultEventColor">
              <option value="#007bff">Azul</option>
              <option value="#28a745">Verde</option>
              <option value="#ffc107">Amarillo</option>
              <option value="#dc3545">Rojo</option>
              <option value="#6f42c1">Púrpura</option>
              <option value="#fd7e14">Naranja</option>
            </select>
          </div>
        </div>

                  <div class="setting-actions">
            <div class="config-status">
              <span v-if="calendarEnabled && dateFieldName && titleFieldName" class="status-ok">
                <i class="ti-check"></i> Configuración válida
              </span>
              <span v-else-if="calendarEnabled" class="status-warning">
                <i class="ti-alert"></i> Campos requeridos incompletos
              </span>
              <span v-else class="status-disabled">
                <i class="ti-close"></i> Calendario deshabilitado
              </span>
            </div>
            <div class="action-buttons">
              <button class="btn-save" @click="saveCalendarSettings">
                <i class="ti-save"></i> Guardar en Servidor
              </button>
              <button class="btn-cancel" @click="showCalendarSettings = false">
                <i class="ti-close"></i> Cancelar
              </button>
            </div>
          </div>
      </div>
    </b-modal>

    <!-- Modal de gestión de campos -->
    <b-modal 
      v-model="showFieldsModal" 
      title="Configuración de Campos" 
      size="lg"
      hide-footer
      @hidden="limpiarFormularioCampo"
    >
      <div class="fields-modal-content">
        <!-- Formulario para agregar nuevo campo -->
        <div class="new-field-section">
          <h5 class="section-title">
            <i class="ti-plus"></i> Agregar Nuevo Campo
          </h5>
          <div class="field-form-modal">
            <div class="row">
              <div class="col-md-4">
                <div class="form-group">
                  <label>Nombre del campo</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="nuevoCampo.nombre"
                    placeholder="Ej: nombre, email, teléfono..."
                  >
                </div>
              </div>
              <div class="col-md-3">
                <div class="form-group">
                  <label>Tipo de campo</label>
                  <select class="form-control" v-model="nuevoCampo.tipo">
                    <option value="texto">Texto</option>
                    <option value="numero">Número</option>
                    <option value="fecha">Fecha</option>
                    <option value="relacional">Relacional</option>
                  </select>
                </div>
              </div>
              <div class="col-md-3" v-if="nuevoCampo.tipo === 'relacional'">
                <div class="form-group">
                  <label>Sección relacionada</label>
                  <select class="form-control" v-model="nuevoCampo.seccionRelacionada">
                    <option value="">Selecciona una sección</option>
                    <option v-for="seccion in otrasSecciones" :key="seccion.nombre" :value="seccion.nombre">
                      {{ seccion.nombre }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="col-md-2" v-if="nuevoCampo.tipo === 'relacional'">
                <div class="form-group">
                  <label>Campo a mostrar</label>
                  <select class="form-control" v-model="nuevoCampo.campoMostrar" :disabled="!nuevoCampo.seccionRelacionada">
                    <option value="">Selecciona campo</option>
                    <option v-for="campo in camposSeccionRelacionada" :key="campo" :value="campo">
                      {{ campo }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
            <div class="row mt-3">
              <div class="col-12">
                <button class="btn-add text-center" style="width: 100%; justify-content: center;" @click="agregarCampo" :disabled="!puedeAgregarCampo">
                  <i class="ti-plus"></i> Agregar Campo
                </button>
                <button class="btn-secondary ml-2 mt-3" @click="limpiarFormularioCampo">
                  <i class="ti-refresh"></i> Limpiar
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Lista de campos existentes -->
        <div class="existing-fields-section" v-if="seccionActual && seccionActual.columnas.length > 0">
          <h5 class="section-title">
            <i class="ti-list"></i> Campos Existentes ({{ seccionActual.columnas.length }})
          </h5>
          <div v-if="mensajeExitoCampo" class="alert alert-success" style="margin-bottom: 16px;">
            {{ mensajeExitoCampo }}
          </div>
          <div class="fields-accordion">
            <div v-for="(columna, index) in seccionActual.columnas" :key="index" class="accordion-item">
              <button class="accordion-header" @click="campoAcordeonAbierto = campoAcordeonAbierto === index ? null : index">
                <span>
                  {{ (columna.nombre || columna).charAt(0).toUpperCase() + (columna.nombre || columna).slice(1) }}
                </span>
                <span class="field-type-badge" :class="getTipoClase(columna)">
                  {{ getTipoTexto(columna) }}
                </span>
                <span class="accordion-arrow" :class="{ open: campoAcordeonAbierto === index }">&#9660;</span>
              </button>
              <div v-if="campoAcordeonAbierto === index" class="accordion-body">
                <div class="field-details">
                  <div class="field-info-grid">
                    <div class="field-info-item">
                      <label>Nombre:</label>
                      <input type="text" class="form-control" v-model="seccionActual.columnas[index].nombre" placeholder="Nombre del campo">
                    </div>
                    <div class="field-info-item">
                      <label>Tipo:</label>
                      <select class="form-control" v-model="seccionActual.columnas[index].tipo">
                        <option value="texto">Texto</option>
                        <option value="numero">Número</option>
                        <option value="fecha">Fecha</option>
                        <option value="relacional">Relacional</option>
                      </select>
                    </div>
                    <div class="field-info-item" v-if="seccionActual.columnas[index].tipo === 'relacional'">
                      <label>Sección relacionada:</label>
                      <select class="form-control" v-model="seccionActual.columnas[index].seccionRelacionada">
                        <option value="">Selecciona una sección</option>
                        <option v-for="seccion in otrasSecciones" :key="seccion.nombre" :value="seccion.nombre">
                          {{ seccion.nombre }}
                        </option>
                      </select>
                    </div>
                    <div class="field-info-item" v-if="seccionActual.columnas[index].tipo === 'relacional'">
                      <label>Campo a mostrar:</label>
                      <select class="form-control" v-model="seccionActual.columnas[index].campoMostrar" :disabled="!seccionActual.columnas[index].seccionRelacionada">
                        <option value="">Selecciona campo</option>
                        <option v-for="campo in camposSeccionRelacionada" :key="campo" :value="campo">
                          {{ campo }}
                        </option>
                      </select>
                    </div>
                  </div>
                  <div class="field-actions">
                    <button class="btn-add" @click="guardarCambiosCampo(index)">
                      <i class="ti-save"></i> Guardar Cambios
                    </button>
                    <button class="btn-delete-sm" @click="eliminarCampo(index)" title="Eliminar campo">
                      <i class="ti-trash"></i> Eliminar Campo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Estado vacío -->
        <div v-else class="empty-fields-state">
          <div class="text-center">
            <i class="ti-folder" style="font-size: 3rem; color: #ccc; margin-bottom: 15px;"></i>
            <h6>No hay campos definidos</h6>
            <p>Agrega campos para comenzar a gestionar datos en esta sección.</p>
          </div>
        </div>
      </div>
    </b-modal>

    <!-- Modal para agregar nuevo registro -->
    <b-modal 
      v-model="showAddModal" 
      title="Agregar Nuevo Registro" 
      size="lg"
      hide-footer
    >
      <div class="add-record-modal">
        <div class="form-group" v-for="columna in seccionActual.columnas" :key="columna.nombre">
          <label :for="`modal-${columna.nombre}`" class="form-label">
            {{ columna.nombre.charAt(0).toUpperCase() + columna.nombre.slice(1) }}
          </label>
          
          <!-- Input de texto -->
          <input
            v-if="columna.tipo === 'texto' || columna.tipo === 'email'"
            :id="`modal-${columna.nombre}`"
            type="text"
            class="form-control"
            v-model="nuevaFila.valores[columna.nombre]"
            :placeholder="`Ingrese ${columna.nombre}`"
          >
          
          <!-- Select para campos relacionales -->
          <div v-else-if="columna.tipo === 'relacional'" class="search-select-container">
            <input
              :id="`modal-${columna.nombre}`"
              type="text"
              class="form-control"
              v-model="nuevaFila.valores[columna.nombre]"
              :placeholder="`Buscar en ${columna.seccionRelacionada}`"
              @input="filtrarOpcionesNuevaFila($event, columna)"
              @focus="mostrarOpcionesNueva(columna)"
              @blur="ocultarOpcionesNueva(columna)"
              autocomplete="off"
            >
            <div v-if="opcionesVisibles[columna.nombre + '_nueva']" class="opciones-dropdown">
              <div
                v-for="opcion in opcionesFiltradas[columna.nombre + '_nueva']"
                :key="opcion"
                class="opcion-item"
                @mousedown.prevent="seleccionarOpcionNuevaFila(opcion, columna.nombre)"
              >
                {{ opcion }}
              </div>
              <div v-if="opcionesFiltradas[columna.nombre + '_nueva'].length === 0" class="no-opciones">
                No se encontraron resultados
              </div>
            </div>
          </div>
          
          <!-- Input de fecha -->
          <input
            v-else-if="columna.tipo === 'fecha'"
            :id="`modal-${columna.nombre}`"
            type="date"
            class="form-control"
            v-model="nuevaFila.valores[columna.nombre]"
          >
          
          <!-- Input numérico -->
          <input
            v-else-if="columna.tipo === 'numero'"
            :id="`modal-${columna.nombre}`"
            type="number"
            class="form-control"
            v-model="nuevaFila.valores[columna.nombre]"
            :placeholder="`Ingrese ${columna.nombre}`"
          >
        </div>
        
        <div class="modal-actions">
          <button class="btn-modal-primary" @click="agregarFilaDesdeModal">
            <i class="ti-plus"></i> Agregar Registro
          </button>
          <button class="btn-modal-secondary" @click="showAddModal = false">
            <i class="ti-close"></i> Cancelar
          </button>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { seccionesDinamicasService } from '@/services/api/queries'
import CalendarView from '@/components/CalendarView.vue'
import { useRegistrosPaginados } from '@/composables/useRegistrosPaginados'
import FiltrosDinamicos from '@/components/FiltrosDinamicos.vue'

export default {
  name: 'CrmSeccion',
  components: {
    CalendarView,
    FiltrosDinamicos
  },
  props: {
    sectionName: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const secciones = ref([])
    const nuevoCampo = reactive({
      nombre: '',
      tipo: 'texto',
      seccionRelacionada: '',
      campoMostrar: ''
    })
    const nuevaFila = reactive({
      valores: {} // Cambiado para que sea un objeto con valores
    })
    const showClearModal = ref(false)
    const showFieldsModal = ref(false)
    const showAddModal = ref(false)
    const campoAcordeonAbierto = ref(null)
    const mensajeExitoCampo = ref('')
    const cargando = ref(true)
    const refreshKey = ref(0)
    
    // Variables para el calendario
    const currentView = ref('table')
    const dateFieldName = ref('')
    const titleFieldName = ref('')
    const calendarTitle = ref('')
    const calendarEnabled = ref(false)
    const showCalendarSettings = ref(false)
    const calendarLoading = ref(false)
    const defaultEventColor = ref('#007bff')
    const currentCalendarMonth = ref(new Date())
    const selectedDisplayFields = ref([])
    const calendarConfigs = ref([])
    const currentCalendarId = ref(null)
    const selectedCalendar = ref(null)
    const calendarData = ref([])
    
    // Variables para el buscador de campos relacionales
    const opcionesVisibles = reactive({})
    const opcionesFiltradas = reactive({})
    const busquedasActuales = reactive({})

    // Estado de edición por fila
    const filaEditando = ref(null)

    // Composable de registros paginados
    const { registros, pagination, filters, loading, cargarRegistros } = useRegistrosPaginados()
    
    // Estado para vista de registros paginados (siempre activa ahora)
    const usarRegistrosPaginados = ref(true)
    
    // Estado para filtros colapsables
    const filtrosAbiertos = ref(false)
    const filtrosActivos = ref({})

    // Computed para obtener la sección actual
    const seccionActual = computed(() => {
      console.log('Secciones:', secciones.value.map(s => s.nombre));
      console.log('SectionName:', props.sectionName);
      // Reemplazar guiones por espacios para la búsqueda
      const nombreBuscado = (props.sectionName || '').replace(/-/g, ' ').trim().toLowerCase();
      const found = secciones.value.find(
        s => (s.nombre || '').trim().toLowerCase() === nombreBuscado
      );
      console.log('Sección encontrada:', found);
      return found;
    })

    // Computed para otras secciones
    const otrasSecciones = computed(() => {
      if (!seccionActual.value) return []
      return secciones.value.filter(s => s.nombre !== seccionActual.value.nombre)
    })

    // Computed para campos de la sección relacionada
    const camposSeccionRelacionada = computed(() => {
      if (!nuevoCampo.seccionRelacionada) return []
      const sec = secciones.value.find(s => s.nombre === nuevoCampo.seccionRelacionada)
      if (!sec || !sec.columnas) return []
      return sec.columnas.map(col => {
        if (typeof col === 'string') return col
        return col.nombre
      })
    })

    // Computed para verificar si se puede agregar un campo
    const puedeAgregarCampo = computed(() => {
      if (!nuevoCampo.nombre || !nuevoCampo.nombre.trim()) return false
      if (nuevoCampo.tipo === 'relacional') {
        return nuevoCampo.seccionRelacionada && nuevoCampo.campoMostrar
      }
      return true
    })

    // Computed para el calendario
    const hasDateField = computed(() => {
      if (!seccionActual.value || !seccionActual.value.columnas) return false
      return seccionActual.value.columnas.some(col => {
        const columna = typeof col === 'string' ? { nombre: col, tipo: 'texto' } : col
        return columna.tipo === 'fecha'
      })
    })

    // Computed para verificar si hay calendarios configurados
    const hasCalendarConfigs = computed(() => {
      return calendarConfigs.value && calendarConfigs.value.length > 0
    })

    // Función para obtener el valor de un campo según el tipo de vista
    const getValorCampo = (fila, nombreCampo) => {
      if (usarRegistrosPaginados.value) {
        // En vista paginada, los datos vienen con estructura .valores
        return fila.valores && fila.valores[nombreCampo] !== undefined 
          ? fila.valores[nombreCampo] 
          : fila[nombreCampo] || ''
      } else {
        // En vista normal, los datos están directamente en la fila
        return fila.valores && fila.valores[nombreCampo] !== undefined 
          ? fila.valores[nombreCampo] 
          : fila[nombreCampo] || ''
      }
    }

    // Función para establecer el valor de un campo según el tipo de vista
    const setValorCampo = (fila, nombreCampo, valor) => {
      if (usarRegistrosPaginados.value) {
        // En vista paginada, asegurar que existe .valores
        if (!fila.valores) fila.valores = {}
        fila.valores[nombreCampo] = valor
      } else {
        // En vista normal, usar .valores si existe, sino directamente
        if (fila.valores) {
          fila.valores[nombreCampo] = valor
        } else {
          fila[nombreCampo] = valor
        }
      }
    }

    const dateFields = computed(() => {
      if (!seccionActual.value || !seccionActual.value.columnas) return []
      return seccionActual.value.columnas.filter(col => {
        const columna = typeof col === 'string' ? { nombre: col, tipo: 'texto' } : col
        return columna.tipo === 'fecha'
      }).map(col => typeof col === 'string' ? { nombre: col } : col)
    })

    const textFields = computed(() => {
      if (!seccionActual.value || !seccionActual.value.columnas) return []
      return seccionActual.value.columnas.filter(col => {
        const columna = typeof col === 'string' ? { nombre: col, tipo: 'texto' } : col
        return columna.tipo === 'texto'
      }).map(col => typeof col === 'string' ? { nombre: col } : col)
    })

    const calendarEvents = computed(() => {
      console.log('=== DEBUG CALENDAR ===')
      console.log('Calendario habilitado:', calendarEnabled.value)
      console.log('Campo fecha:', dateFieldName.value)
      console.log('Campo título:', titleFieldName.value)
      console.log('Datos del calendario:', calendarData.value.length)
      
      if (!calendarEnabled.value || !calendarData.value || calendarData.value.length === 0) {
        console.log('❌ No se pueden generar eventos')
        return []
      }
      
              const events = calendarData.value.map(registro => {
          console.log('Procesando registro:', registro)
          console.log('Campos disponibles:', Object.keys(registro))
          console.log('Campos seleccionados para mostrar:', selectedDisplayFields.value)
          
          // Los datos del endpoint de citas vienen con estructura directa
          // Verificar si tiene la estructura esperada
          const hasValores = registro.valores && typeof registro.valores === 'object'
          const hasDirectProps = registro.title && registro.date && registro.id
          
          let displayTitle, eventDate, eventColor, eventData
          
          if (hasValores) {
            // Estructura con .valores
            displayTitle = registro.valores[titleFieldName.value] || 'Sin título'
            eventDate = registro.valores[dateFieldName.value]
            eventColor = registro.valores.color || defaultEventColor.value
            eventData = registro.valores
            
            // Agregar campos adicionales al título
            if (selectedDisplayFields.value.length > 0) {
              const additionalFields = selectedDisplayFields.value
                .map(field => registro.valores[field])
                .filter(value => value && value.trim() !== '')
                .join(' - ')
              
              if (additionalFields) {
                displayTitle = `${displayTitle} (${additionalFields})`
              }
            }
          } else if (hasDirectProps) {
            // Estructura directa (como viene del endpoint de citas)
            displayTitle = registro[titleFieldName.value] || registro.title || 'Sin título'
            eventDate = registro[dateFieldName.value] || registro.date
            eventColor = registro.color || defaultEventColor.value
            eventData = registro
            
            // Agregar campos adicionales al título
            if (selectedDisplayFields.value.length > 0) {
              const additionalFields = selectedDisplayFields.value
                .map(field => {
                  // Buscar el campo en el registro
                  const value = registro[field]
                  console.log(`Campo ${field}:`, value)
                  return value
                })
                .filter(value => value && value.toString().trim() !== '')
                .join(' - ')
              
              if (additionalFields) {
                displayTitle = `${displayTitle} (${additionalFields})`
              }
            }
          } else {
            console.warn('Estructura de registro no reconocida:', registro)
            return null
          }
          
          const event = {
            id: registro._id || registro.id,
            title: displayTitle,
            date: eventDate,
            color: eventColor,
            data: eventData
          }
          
          console.log('Evento generado:', event)
          return event
        }).filter(event => event && event.date) // Solo eventos válidos con fecha
      
      console.log('✅ Eventos generados:', events.length)
      return events
    })

    const availableFieldsForCalendar = computed(() => {
      if (!seccionActual.value || !seccionActual.value.columnas) return []
      
      return seccionActual.value.columnas.map(col => {
        const columna = typeof col === 'string' ? { nombre: col, tipo: 'texto' } : col
        return columna.nombre
      }).filter(fieldName => 
        fieldName !== dateFieldName.value && fieldName !== titleFieldName.value
      )
    })

    // Cargar secciones desde backend
    const cargarSecciones = async () => {
      cargando.value = true;
      try {
        const res = await seccionesDinamicasService.getAll()
        secciones.value = Array.isArray(res) ? res : (res.data || [])
        
        // Cargar datos básicos de todas las secciones para filtros relacionales
        for (const seccion of secciones.value) {
          try {
            const registros = await seccionesDinamicasService.getRegistros(seccion._id || seccion.id)
            seccion.datos = Array.isArray(registros) ? registros : []
            console.log(`📊 Datos cargados para ${seccion.nombre}:`, seccion.datos.length, 'registros')
          } catch (error) {
            console.warn(`⚠️ Error cargando datos para ${seccion.nombre}:`, error)
            seccion.datos = []
          }
        }
        
        inicializarNuevaFila()
        
        // Siempre cargar registros paginados para la vista avanzada
        if (seccionActual.value) {
          await cargarRegistrosPaginados()
        }
      } catch (e) {
        alert('Error al cargar secciones')
        secciones.value = []
      }
      cargando.value = false;
    }

    // Cargar registros paginados
    const cargarRegistrosPaginados = async () => {
      if (!seccionActual.value) return
      
      try {
        // Para carga inicial, siempre empezar desde la página 1
        const paginaActual = pagination.value && pagination.value.currentPage ? pagination.value.currentPage : 1
        const filtrosActuales = filters.value && filters.value.applied ? filters.value.applied : {}
        
        console.log('🔄 Cargando registros paginados:', {
          seccionId: seccionActual.value._id || seccionActual.value.id,
          page: paginaActual,
          filters: filtrosActuales
        })
        
        await cargarRegistros(seccionActual.value._id || seccionActual.value.id, { 
          page: paginaActual, 
          limit: 10,
          filters: filtrosActuales
        })
      } catch (error) {
        console.error('Error cargando registros paginados:', error)
      }
    }

    // Aplicar filtros
    const aplicarFiltros = async (filtros) => {
      if (!seccionActual.value) return
      
      // Actualizar filtros activos
      actualizarFiltrosActivos(filtros)
      
      try {
        await cargarRegistros(seccionActual.value._id || seccionActual.value.id, { 
          page: 1, 
          limit: 10,
          filters: filtros 
        })
      } catch (error) {
        console.error('Error aplicando filtros:', error)
      }
    }

    // Cambiar página
    const cambiarPagina = async (pagina) => {
      if (!seccionActual.value) return
      
      try {
        await cargarRegistros(seccionActual.value._id || seccionActual.value.id, { 
          page: pagina, 
          limit: 10,
          filters: filters.value.applied || {}
        })
      } catch (error) {
        console.error('Error cambiando página:', error)
      }
    }

    // Toggle de filtros colapsables
    const toggleFiltros = () => {
      console.log('Toggle filtros ejecutado')
      filtrosAbiertos.value = !filtrosAbiertos.value
      console.log('Nuevo estado:', filtrosAbiertos.value)
    }

    // Función para manejar filtros activos
    const actualizarFiltrosActivos = (filtros) => {
      filtrosActivos.value = filtros
    }

    // Limpiar filtros
    const limpiarFiltros = async () => {
      filtrosActivos.value = {}
      await aplicarFiltros({})
    }

    // Inicializar nueva fila
    const inicializarNuevaFila = () => {
      if (seccionActual.value && seccionActual.value.columnas) {
        // Limpiar nuevaFila
        nuevaFila.valores = {} // Limpiar el objeto valores
        
        seccionActual.value.columnas.forEach(col => {
          const nombreCampo = typeof col === 'string' ? col : col.nombre
          nuevaFila.valores[nombreCampo] = ''
        })
      }
    }

    // Limpiar el formulario de nuevo campo
    const limpiarFormularioCampo = () => {
      nuevoCampo.nombre = ''
      nuevoCampo.tipo = 'texto'
      nuevoCampo.seccionRelacionada = ''
      nuevoCampo.campoMostrar = ''
    }

    // Agregar campo
    const agregarCampo = async () => {
      if (!seccionActual.value) {
        alert('No se encontró la sección actual')
        return
      }
      
      const nombreCampo = nuevoCampo.nombre.trim().toLowerCase()
      if (!nombreCampo) {
        alert('El nombre del campo no puede estar vacío')
        return
      }
      
      // Verificar que el campo no exista
      const campoExiste = seccionActual.value.columnas.some(col => {
        const nombreCol = typeof col === 'string' ? col : col.nombre
        return nombreCol === nombreCampo
      })
      
      if (campoExiste) {
        alert('El campo ya existe')
        return
      }
      
      // Crear el objeto del campo
      const campoNuevo = {
        nombre: nombreCampo,
        tipo: nuevoCampo.tipo
      }
      
      // Si es relacional, agregar las propiedades adicionales
      if (nuevoCampo.tipo === 'relacional') {
        if (!nuevoCampo.seccionRelacionada || !nuevoCampo.campoMostrar) {
          alert('Para campos relacionales debes seleccionar una sección y un campo a mostrar')
          return
        }
        campoNuevo.seccionRelacionada = nuevoCampo.seccionRelacionada
        campoNuevo.campoMostrar = nuevoCampo.campoMostrar
      }

      // Agregar el campo
      seccionActual.value.columnas.push(campoNuevo)
      
      // Actualizar todos los registros existentes con el nuevo campo vacío
      seccionActual.value.datos.forEach(fila => {
        fila[nombreCampo] = ''
      })
      
      limpiarFormularioCampo()
      inicializarNuevaFila()
      try {
        await seccionesDinamicasService.update(seccionActual.value._id || seccionActual.value.id, seccionActual.value)
        await cargarSecciones()
      } catch (e) {
        alert('Error al agregar campo')
      }
    }

    // Agregar fila
    const agregarFila = async () => {
      if (!seccionActual.value) return
      
      const filaNueva = {}
      seccionActual.value.columnas.forEach(col => {
        const nombreCampo = typeof col === 'string' ? col : col.nombre
        filaNueva[nombreCampo] = nuevaFila.valores[nombreCampo] || ''
      })
      
      try {
        const res = await seccionesDinamicasService.createRegistro(
          seccionActual.value._id || seccionActual.value.id,
          { valores: filaNueva }
        )
        
        // Actualizar vista simple
        if (seccionActual.value.datos && Array.isArray(seccionActual.value.datos)) {
          seccionActual.value.datos.push(res)
        } else {
          seccionActual.value.datos = [res]
        }
        
        // Siempre recargar los registros paginados
        await cargarRegistrosPaginados()
        
        inicializarNuevaFila()
      } catch (e) {
        alert('Error al agregar fila')
      }
    }

    // Agregar fila desde modal
    const agregarFilaDesdeModal = async () => {
      if (!seccionActual.value) return
      
      const filaNueva = {}
      seccionActual.value.columnas.forEach(col => {
        const nombreCampo = typeof col === 'string' ? col : col.nombre
        filaNueva[nombreCampo] = nuevaFila.valores[nombreCampo] || ''
      })
      
      try {
        const res = await seccionesDinamicasService.createRegistro(
          seccionActual.value._id || seccionActual.value.id,
          { valores: filaNueva }
        )
        
        // Siempre recargar los registros paginados
        await cargarRegistrosPaginados()
        
        // Cerrar modal y limpiar formulario
        showAddModal.value = false
        inicializarNuevaFila()
      } catch (e) {
        alert('Error al agregar registro')
      }
    }

    // Eliminar fila
    const eliminarFila = async (filaIndex) => {
      if (!seccionActual.value) return
      
      // Obtener registro de la lista paginada
      const registro = registros.value[filaIndex]
      
      if (!registro) return
      
      try {
        await seccionesDinamicasService.deleteRegistro(seccionActual.value._id || seccionActual.value.id, registro._id || registro.id)
        
        // Siempre recargar los registros paginados
        await cargarRegistrosPaginados()
      } catch (e) {
        alert('Error al eliminar fila')
      }
    }

    // Eliminar campo
    const eliminarCampo = async (index) => {
      if (!seccionActual.value) return
      
      const campoEliminado = seccionActual.value.columnas.splice(index, 1)[0]
      const nombreCampo = typeof campoEliminado === 'string' ? campoEliminado : campoEliminado.nombre
      
      // Actualizar todos los registros existentes eliminando el campo
      seccionActual.value.datos.forEach(fila => {
        delete fila[nombreCampo]
      })
      
      inicializarNuevaFila()
      try {
        await seccionesDinamicasService.update(seccionActual.value._id || seccionActual.value.id, seccionActual.value)
        await cargarSecciones()
      } catch (e) {
        alert('Error al eliminar campo')
      }
    }

    // Guardar cambios en un campo existente
    const guardarCambiosCampo = async (index) => {
      if (!seccionActual.value) return
      
      const campoActualizado = seccionActual.value.columnas[index]
      const nombreCampo = typeof campoActualizado === 'string' ? campoActualizado : campoActualizado.nombre
      
      // Verificar que el nombre no esté vacío
      if (!campoActualizado.nombre || !campoActualizado.nombre.trim()) {
        alert('El nombre del campo no puede estar vacío')
        return
      }

      // Verificar que el nombre no sea duplicado
      const nombreDuplicado = seccionActual.value.columnas.some((col, i) => {
        if (i === index) return false;
        const nombreCol = typeof col === 'string' ? col : col.nombre
        return nombreCol === campoActualizado.nombre
      })

      if (nombreDuplicado) {
        alert('El nombre del campo ya existe')
        return
      }

      // Si es relacional, verificar que la sección y el campo a mostrar sean válidos
      if (campoActualizado.tipo === 'relacional') {
        if (!campoActualizado.seccionRelacionada || !campoActualizado.campoMostrar) {
          alert('Para campos relacionales debes seleccionar una sección y un campo a mostrar')
          return
        }
      }

      try {
        await seccionesDinamicasService.update(seccionActual.value._id || seccionActual.value.id, seccionActual.value)
        mensajeExitoCampo.value = '¡Campo actualizado correctamente!'
        setTimeout(() => { mensajeExitoCampo.value = '' }, 2000)
        await cargarSecciones()
      } catch (e) {
        alert('Error al guardar cambios de campo')
      }
    }

    // Exportar sección
    const exportarSeccion = () => {
      if (!seccionActual.value) return
      
      const dataStr = JSON.stringify(seccionActual.value, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${seccionActual.value.nombre.toLowerCase().replace(/\s+/g, '-')}.json`
      link.click()
      URL.revokeObjectURL(url)
    }

    // Limpiar sección
    const limpiarSeccion = () => {
      showClearModal.value = true
    }

    // Confirmar limpiar sección
    const confirmarLimpiarSeccion = async () => {
      if (seccionActual.value) {
        try {
          // Borra todos los registros de la sección
          for (const registro of seccionActual.value.datos) {
            await seccionesDinamicasService.deleteRegistro(seccionActual.value._id || seccionActual.value.id, registro._id || registro.id)
          }
          showClearModal.value = false
          await cargarSecciones()
        } catch (e) {
          alert('Error al limpiar sección')
        }
      }
    }

    // Guardar sección
    const guardarSeccion = async () => {
      try {
        await seccionesDinamicasService.update(seccionActual.value._id || seccionActual.value.id, seccionActual.value)
        alert('Cambios guardados correctamente')
        await cargarSecciones()
      } catch (e) {
        alert('Error al guardar sección')
      }
    }

    // Migrar columnas a objetos si es necesario
    const inicializarCamposNuevos = () => {
      secciones.value.forEach(seccion => {
        if (seccion.columnas && Array.isArray(seccion.columnas)) {
          seccion.columnas = seccion.columnas.map(col => {
            if (typeof col === 'string') {
              return { nombre: col, tipo: 'texto' }
            }
            return col
          })
        }
      })
    }

    // Obtener opciones de campos relacionales
    const getOpcionesRelacionadas = (seccionRelacionada, campoMostrar) => {
      if (!seccionRelacionada || !campoMostrar) return []
      
      const sec = secciones.value.find(s => s.nombre === seccionRelacionada)
      if (!sec || !sec.columnas || !sec.datos) return []
      
      const valores = sec.datos.map(fila => fila[campoMostrar]).filter(valor => valor && valor !== '')
      return [...new Set(valores)]
    }

    // Obtener el texto del tipo de campo
    const getTipoTexto = (columna) => {
      if (typeof columna === 'string') return 'Texto'
      
      switch (columna.tipo) {
        case 'texto': return 'Texto'
        case 'numero': return 'Número'
        case 'fecha': return 'Fecha'
        case 'relacional': return `Relacional (${columna.seccionRelacionada})`
        default: return 'Texto'
      }
    }

    // Obtener la clase del tipo de campo
    const getTipoClase = (columna) => {
      if (typeof columna === 'string') return 'text-primary'
      
      switch (columna.tipo) {
        case 'texto': return 'text-primary'
        case 'numero': return 'text-success'
        case 'fecha': return 'text-info'
        case 'relacional': return 'text-warning'
        default: return 'text-primary'
      }
    }

    // Funciones para el buscador de campos relacionales
    const mostrarOpciones = (columna, fila, filaIndex) => {
      const key = columna.nombre + '_' + filaIndex;
      opcionesVisibles[key] = true;
      const opciones = getOpcionesRelacionadas(columna.seccionRelacionada, columna.campoMostrar);
      opcionesFiltradas[key] = opciones;
    };

    const ocultarOpciones = (columna, filaIndex) => {
      const key = columna.nombre + '_' + filaIndex;
      setTimeout(() => {
        opcionesVisibles[key] = false;
      }, 150);
    };

    const filtrarOpciones = (event, columna, fila, filaIndex) => {
      const key = columna.nombre + '_' + filaIndex;
      const busqueda = event.target.value.toLowerCase();
      fila.valores[columna.nombre] = event.target.value;
      const opciones = getOpcionesRelacionadas(columna.seccionRelacionada, columna.campoMostrar);
      opcionesFiltradas[key] = opciones.filter(opcion =>
        opcion.toLowerCase().includes(busqueda)
      );
      opcionesVisibles[key] = true;
    };

    const filtrarOpcionesNuevaFila = (event, columna) => {
      const key = columna.nombre + '_nueva';
      const busqueda = event.target.value.toLowerCase();
      nuevaFila.valores[columna.nombre] = event.target.value;
      const opciones = getOpcionesRelacionadas(columna.seccionRelacionada, columna.campoMostrar);
      opcionesFiltradas[key] = opciones.filter(opcion =>
        opcion.toLowerCase().includes(busqueda)
      );
      opcionesVisibles[key] = true;
    };

    const seleccionarOpcion = (opcion, nombreCampo, fila, filaIndex) => {
      const key = nombreCampo + '_' + filaIndex;
      fila.valores[nombreCampo] = opcion;
      opcionesVisibles[key] = false;
    };

    const seleccionarOpcionNuevaFila = (opcion, nombreCampo) => {
      const key = nombreCampo + '_nueva';
      nuevaFila.valores[nombreCampo] = opcion;
      opcionesVisibles[key] = false;
    };

    // Actualizar registro dinámico
    const actualizarRegistro = async (fila) => {
      if (!seccionActual.value || !fila._id) return
      try {
        await seccionesDinamicasService.updateRegistro(
          seccionActual.value._id || seccionActual.value.id,
          fila._id,
          { valores: fila.valores }
        )
        // Opcional: feedback visual
      } catch (e) {
        alert('Error al actualizar el registro')
      }
    }

    // Guardar fila editada
    const guardarFilaEditada = async (fila, filaIndex) => {
      if (!seccionActual.value || !fila._id) return
      try {
        const res = await seccionesDinamicasService.updateRegistro(
          seccionActual.value._id || seccionActual.value.id,
          fila._id,
          { valores: fila.valores }
        )
        // Refrescar solo la fila editada en el array local y actualizar _original
        if (res && res.valores) {
          Object.assign(fila.valores, res.valores)
          fila._original = { ...res.valores }
        } else {
          fila._original = { ...fila.valores }
        }
        
        // Siempre recargar los registros paginados
        await cargarRegistrosPaginados()
      } catch (e) {
        alert('Error al guardar los cambios de la fila')
      }
    }

    // Revertir cambios de una fila
    const revertirFila = (fila, filaIndex) => {
      fila.valores = { ...fila._original }
      refreshKey.value++
    }

    // Forzar reactividad al hacer focus out
    const onFocusOut = (fila) => {
      fila.valores = { ...fila.valores }
      fila._editando = true
      refreshKey.value++
    }

    // Watchers
    watch(() => props.sectionName, () => {
      inicializarNuevaFila()
    })

    // Watcher para actualizar registros paginados cuando cambia la sección
    watch(seccionActual, async (newSeccion) => {
      if (newSeccion) {
        console.log('📋 Sección cambiada, cargando registros paginados...')
        await cargarRegistrosPaginados()
      }
    })

    watch(() => nuevoCampo.tipo, (nuevoTipo) => {
      if (nuevoTipo !== 'relacional') {
        nuevoCampo.seccionRelacionada = ''
        nuevoCampo.campoMostrar = ''
      }
    })

    watch(() => nuevoCampo.seccionRelacionada, () => {
      nuevoCampo.campoMostrar = ''
    })

    watch(() => seccionActual.value, () => {
      if (seccionActual.value) {
        initializeCalendarFields()
      }
    })

    // Funciones para el calendario
    const addCalendarEvent = async (eventData) => {
      if (!seccionActual.value) return
      
      try {
        const res = await seccionesDinamicasService.createRegistro(
          seccionActual.value._id || seccionActual.value.id,
          { valores: eventData }
        )
        
        if (seccionActual.value.datos && Array.isArray(seccionActual.value.datos)) {
          seccionActual.value.datos.push(res)
        } else {
          seccionActual.value.datos = [res]
        }
      } catch (e) {
        alert('Error al agregar evento')
      }
    }

    const updateCalendarEvent = async (eventData) => {
      if (!seccionActual.value) return
      
      try {
        await seccionesDinamicasService.updateRegistro(
          seccionActual.value._id || seccionActual.value.id,
          eventData.id,
          { valores: eventData.data }
        )
        
        // Actualizar el registro en el array local
        const index = seccionActual.value.datos.findIndex(r => r._id === eventData.id)
        if (index !== -1) {
          seccionActual.value.datos[index].valores = eventData.data
        }
      } catch (e) {
        alert('Error al actualizar evento')
      }
    }

    const deleteCalendarEvent = async (eventData) => {
      if (!seccionActual.value) return
      
      try {
        await seccionesDinamicasService.deleteRegistro(
          seccionActual.value._id || seccionActual.value.id,
          eventData.id
        )
        
        // Eliminar el registro del array local
        const index = seccionActual.value.datos.findIndex(r => r._id === eventData.id)
        if (index !== -1) {
          seccionActual.value.datos.splice(index, 1)
        }
      } catch (e) {
        alert('Error al eliminar evento')
      }
    }

    const onTitleChange = () => {
      console.log('🔄 Título cambiado:', calendarTitle.value)
      console.log('🔄 Tipo:', typeof calendarTitle.value)
      console.log('🔄 Longitud:', calendarTitle.value ? calendarTitle.value.length : 0)
    }

    const selectCalendar = (calendar) => {
      console.log('🎯 Seleccionando calendario:', calendar.title)
      
      selectedCalendar.value = calendar
      calendarEnabled.value = calendar.enabled
      calendarTitle.value = calendar.title
      dateFieldName.value = calendar.dateField
      titleFieldName.value = calendar.titleField
      defaultEventColor.value = calendar.defaultColor
      selectedDisplayFields.value = calendar.displayFields || []
      
      // Cargar datos del calendario seleccionado
      const now = new Date()
      loadCalendarData(now.getFullYear(), now.getMonth() + 1)
    }

    const selectCalendarFromModal = (calendar) => {
      console.log('🎯 Seleccionando calendario desde modal:', calendar.title)
      
      selectedCalendar.value = calendar
      calendarEnabled.value = calendar.enabled
      calendarTitle.value = calendar.title
      dateFieldName.value = calendar.dateField
      titleFieldName.value = calendar.titleField
      defaultEventColor.value = calendar.defaultColor
      selectedDisplayFields.value = calendar.displayFields || []
    }

    const createNewCalendar = () => {
      console.log('➕ Creando nuevo calendario')
      
      selectedCalendar.value = null
      calendarEnabled.value = true
      calendarTitle.value = ''
      dateFieldName.value = ''
      titleFieldName.value = ''
      defaultEventColor.value = '#007bff'
      selectedDisplayFields.value = []
    }

    const initializeCalendarFields = () => {
      if (!seccionActual.value || !seccionActual.value.columnas) {
        console.log('No se puede inicializar calendario: sección no encontrada o sin columnas')
        return
      }
      
      console.log('Inicializando campos del calendario...')
      console.log('Columnas disponibles:', seccionActual.value.columnas)
      
      // Cargar configuración guardada
      const savedConfig = seccionActual.value.calendarConfig
      if (savedConfig) {
        console.log('📋 Configuración guardada encontrada:', savedConfig)
        calendarEnabled.value = savedConfig.enabled || false
        calendarTitle.value = savedConfig.title || ''
        dateFieldName.value = savedConfig.dateField || ''
        titleFieldName.value = savedConfig.titleField || ''
        defaultEventColor.value = savedConfig.defaultColor || '#007bff'
        selectedDisplayFields.value = savedConfig.displayFields || []
        console.log('✅ Configuración cargada:', {
          enabled: calendarEnabled.value,
          title: calendarTitle.value,
          dateField: dateFieldName.value,
          titleField: titleFieldName.value,
          displayFields: selectedDisplayFields.value
        })
        
        // Cargar datos del calendario si está habilitado
        if (calendarEnabled.value) {
          const now = new Date()
          loadCalendarData(now.getFullYear(), now.getMonth() + 1)
        }
      } else {
        console.log('No hay configuración guardada, usando configuración por defecto')
        // Configuración por defecto
        const dateField = seccionActual.value.columnas.find(col => {
          const columna = typeof col === 'string' ? { nombre: col, tipo: 'texto' } : col
          return columna.tipo === 'fecha'
        })
        
        if (dateField) {
          dateFieldName.value = typeof dateField === 'string' ? dateField : dateField.nombre
          console.log('Campo de fecha encontrado:', dateFieldName.value)
        } else {
          console.log('No se encontró campo de fecha')
        }
        
        const titleField = seccionActual.value.columnas.find(col => {
          const columna = typeof col === 'string' ? { nombre: col, tipo: 'texto' } : col
          return columna.tipo === 'texto'
        })
        
        if (titleField) {
          titleFieldName.value = typeof titleField === 'string' ? titleField : titleField.nombre
          console.log('Campo de título encontrado:', titleFieldName.value)
        } else {
          console.log('No se encontró campo de título')
        }
      }
      
      console.log('Estado final del calendario:')
      console.log('- Habilitado:', calendarEnabled.value)
      console.log('- Campo fecha:', dateFieldName.value)
      console.log('- Campo título:', titleFieldName.value)
    }

    const toggleCalendar = () => {
      if (!calendarEnabled.value) {
        dateFieldName.value = ''
        titleFieldName.value = ''
        calendarTitle.value = ''
        selectedDisplayFields.value = []
        defaultEventColor.value = '#007bff'
      } else {
        // Cargar datos del mes actual cuando se habilita el calendario
        const now = new Date()
        loadCalendarData(now.getFullYear(), now.getMonth() + 1)
      }
    }



    const saveCalendarSettings = async () => {
      if (!seccionActual.value) {
        alert('No se encontró la sección actual')
        return
      }
      
              if (calendarEnabled.value) {
          console.log('🔍 Validando configuración del calendario:')
          console.log('- Título (tipo):', typeof calendarTitle.value)
          console.log('- Título (valor):', calendarTitle.value)
          console.log('- Título (longitud):', calendarTitle.value ? calendarTitle.value.length : 0)
          console.log('- Campo fecha:', dateFieldName.value)
          console.log('- Campo título:', titleFieldName.value)
          
          const titleEmpty = !calendarTitle.value || calendarTitle.value.trim() === ''
          const dateEmpty = !dateFieldName.value
          const titleFieldEmpty = !titleFieldName.value
          
          console.log('- Título vacío:', titleEmpty)
          console.log('- Fecha vacía:', dateEmpty)
          console.log('- Campo título vacío:', titleFieldEmpty)
          
          if (titleEmpty || dateEmpty || titleFieldEmpty) {
            let missingFields = []
            if (titleEmpty) missingFields.push('título del calendario')
            if (dateEmpty) missingFields.push('campo de fecha')
            if (titleFieldEmpty) missingFields.push('campo de título')
            
            alert(`Por favor completa: ${missingFields.join(', ')}`)
            return
          }
        }
      
      try {
        console.log('💾 Guardando configuración del calendario...')
        console.log('Configuración:', {
          seccionId: seccionActual.value._id || seccionActual.value.id,
          seccionNombre: seccionActual.value.nombre,
          title: calendarTitle.value,
          enabled: calendarEnabled.value,
          dateField: dateFieldName.value,
          titleField: titleFieldName.value,
          defaultColor: defaultEventColor.value,
          displayFields: selectedDisplayFields.value
        })
        
        // Guardar configuración en la sección
        seccionActual.value.calendarConfig = {
          seccionId: seccionActual.value._id || seccionActual.value.id,
          seccionNombre: seccionActual.value.nombre,
          title: calendarTitle.value,
          enabled: calendarEnabled.value,
          dateField: dateFieldName.value,
          titleField: titleFieldName.value,
          defaultColor: defaultEventColor.value,
          displayFields: selectedDisplayFields.value
        }
        
        // Enviar al servidor
              const response = await seccionesDinamicasService.saveCalendarConfig(
        seccionActual.value._id || seccionActual.value.id,
        {
          seccionId: seccionActual.value._id || seccionActual.value.id,
          seccionNombre: seccionActual.value.nombre,
          title: calendarTitle.value,
          enabled: calendarEnabled.value,
          dateField: dateFieldName.value,
          titleField: titleFieldName.value,
          defaultColor: defaultEventColor.value,
          displayFields: selectedDisplayFields.value
        }
      )
        
        console.log('✅ Configuración guardada en el servidor:', response)
        
        showCalendarSettings.value = false
        
        // Mostrar mensaje de éxito
        const successMessage = calendarEnabled.value 
          ? 'Calendario habilitado y configurado correctamente'
          : 'Calendario deshabilitado correctamente'
        
        alert(successMessage)
        
        // Recargar la sección para asegurar sincronización
        await cargarSecciones()
        
        // Verificar que la configuración se guardó correctamente
        setTimeout(() => {
          const currentConfig = seccionActual.value && seccionActual.value.calendarConfig
          if (currentConfig) {
            console.log('🔍 Verificación: Configuración actual en la sección:', currentConfig)
          } else {
            console.warn('⚠️ Advertencia: No se encontró configuración después de guardar')
          }
        }, 1000)
        
      } catch (error) {
        console.error('❌ Error al guardar configuración del calendario:', error)
        alert(`Error al guardar la configuración: ${error.message || 'Error desconocido'}`)
      }
    }

    const loadCalendarData = async (year, month) => {
      if (!calendarEnabled.value || !seccionActual.value) return
      
      calendarLoading.value = true
      try {
        console.log('📅 Cargando datos del calendario...')
        console.log('Sección:', seccionActual.value._id || seccionActual.value.id)
        console.log('Mes:', month)
        console.log('Año:', year)
        console.log('Título del calendario:', calendarTitle.value)
        
        const params = {
          month: month,
          year: year
        }
        
        // Agregar nombre del calendario si está configurado
        if (calendarTitle.value && calendarTitle.value.trim()) {
          params.name = calendarTitle.value
        }
        
        console.log('Parámetros de búsqueda:', params)
        
        const response = await seccionesDinamicasService.getCalendarData(
          seccionActual.value._id || seccionActual.value.id,
          params
        )
        
        console.log('✅ Respuesta del servidor:', response)
        
        // Extraer los datos de la respuesta
        const calendarDataArray = response && response.data ? response.data : []
        calendarData.value = calendarDataArray
        
        console.log('📅 Datos del calendario procesados:', calendarDataArray)
        
        currentCalendarMonth.value = new Date(year, month - 1, 1)
        
      } catch (e) {
        console.error('❌ Error cargando datos del calendario:', e)
      } finally {
        calendarLoading.value = false
      }
    }

    const clearCalendarState = () => {
      console.log('🧹 Limpiando estado del calendario...')
      calendarData.value = []
      calendarEvents.value = []
      calendarEnabled.value = false
      dateFieldName.value = ''
      titleFieldName.value = ''
      calendarTitle.value = ''
      selectedDisplayFields.value = []
      selectedCalendar.value = null
      calendarConfigs.value = []
      currentView.value = 'table' // Volver a la vista de tabla por defecto
    }

    const loadCalendarConfigs = async () => {
      if (!seccionActual.value) return
      
      try {
        console.log('📅 Cargando configuraciones de calendario...')
        console.log('Sección:', seccionActual.value._id || seccionActual.value.id)
        
        const response = await seccionesDinamicasService.getCalendarConfigs(
          seccionActual.value._id || seccionActual.value.id
        )
        
        // Extraer los datos de la respuesta
        const configs = response && response.data ? response.data : response || []
        calendarConfigs.value = configs
        
        console.log('✅ Configuraciones de calendario cargadas:', calendarConfigs.value)
        console.log('📊 Total de calendarios:', calendarConfigs.value.length)
        
        // Si hay calendarios habilitados, cargar el primero por defecto
        const enabledCalendars = calendarConfigs.value.filter(config => config.enabled)
        if (enabledCalendars.length > 0) {
          const firstEnabled = enabledCalendars[0]
          console.log('🎯 Cargando primer calendario habilitado:', firstEnabled.title)
          
          // Cargar la configuración del primer calendario habilitado
          calendarEnabled.value = firstEnabled.enabled
          calendarTitle.value = firstEnabled.title
          dateFieldName.value = firstEnabled.dateField
          titleFieldName.value = firstEnabled.titleField
          defaultEventColor.value = firstEnabled.defaultColor
          selectedDisplayFields.value = firstEnabled.displayFields || []
          
          // Cargar datos del calendario
          const now = new Date()
          loadCalendarData(now.getFullYear(), now.getMonth() + 1)
        }
        
      } catch (error) {
        console.error('❌ Error cargando configuraciones de calendario:', error)
        calendarConfigs.value = []
      }
    }

    // Inicializar al montar
    onMounted(async () => {
      console.log('🚀 Inicializando componente...')
      await cargarSecciones()
      inicializarCamposNuevos()
      limpiarFormularioCampo()
      console.log('✅ Componente inicializado')
    })

    // Cargar configuraciones de calendario cuando cambie la sección
    watch(seccionActual, async (newSeccion) => {
      if (newSeccion) {
        // Limpiar estado del calendario anterior
        clearCalendarState()
        
        // Cargar configuraciones de la nueva sección
        await loadCalendarConfigs()
      }
    })

    // Inicializar campos del calendario cuando se abra el modal
    watch(showCalendarSettings, (isOpen) => {
      if (isOpen) {
        initializeCalendarFields()
      }
    })

    return {
      secciones,
      seccionActual,
      nuevoCampo,
      nuevaFila,
      showClearModal,
      showFieldsModal,
      otrasSecciones,
      calendarTitle,
      agregarCampo,
      agregarFila,
      eliminarFila,
      eliminarCampo,
      guardarCambiosCampo,
      exportarSeccion,
      limpiarSeccion,
      confirmarLimpiarSeccion,
      guardarSeccion,
      getOpcionesRelacionadas,
      limpiarFormularioCampo,
      puedeAgregarCampo,
      camposSeccionRelacionada,
      getTipoTexto,
      getTipoClase,
      // Funciones del buscador
      mostrarOpciones,
      ocultarOpciones,
      filtrarOpciones,
      filtrarOpcionesNuevaFila,
      seleccionarOpcion,
      seleccionarOpcionNuevaFila,
      opcionesVisibles,
      opcionesFiltradas,
      campoAcordeonAbierto,
      mensajeExitoCampo,
      cargando,
      actualizarRegistro,
      guardarFilaEditada,
      revertirFila,
      onFocusOut,
      refreshKey,
      filaEditando,
      // Variables y funciones del calendario
      currentView,
      hasDateField,
      hasCalendarConfigs,
      calendarEvents,
      dateFieldName,
      titleFieldName,
      availableFieldsForCalendar,
      calendarEnabled,
      showCalendarSettings,
      calendarLoading,
      defaultEventColor,
      selectedDisplayFields,
      dateFields,
      textFields,
      addCalendarEvent,
      updateCalendarEvent,
      deleteCalendarEvent,
      toggleCalendar,
      saveCalendarSettings,
      loadCalendarData,
      loadCalendarConfigs,
      clearCalendarState,
      initializeCalendarFields,
      onTitleChange,
      selectCalendar,
      selectCalendarFromModal,
      createNewCalendar,
      calendarData,
      calendarConfigs,
      selectedCalendar,
      currentView,
      hasDateField,
      calendarEvents,
      dateFieldName,
      titleFieldName,
      availableFieldsForCalendar,
      calendarEnabled,
      showCalendarSettings,
      calendarLoading,
      defaultEventColor,
      selectedDisplayFields,
      dateFields,
      textFields,
      addCalendarEvent,
      updateCalendarEvent,
      deleteCalendarEvent,
      toggleCalendar,
      saveCalendarSettings,
      loadCalendarData,
      // Funciones para registros paginados
      registros,
      pagination,
      filters,
      loading,
      cargarRegistrosPaginados,
      aplicarFiltros,
      cambiarPagina,
      getValorCampo,
      setValorCampo,
      // Funciones para filtros colapsables
      filtrosAbiertos,
      filtrosActivos,
      toggleFiltros,
      limpiarFiltros,
      // Funciones para modal de agregar
      showAddModal,
      agregarFilaDesdeModal,
    }
  }
}
</script>

<style scoped>
.listado-clientes-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1b6659 0%, #2d8a7a 100%);
  padding: 0;
}

.crm-seccion-container {
  padding: 20px;
}

.page-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  padding: 40px 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  margin-bottom: 30px;
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
  padding: 15px 20px;
  background: linear-gradient(135deg, #1b6659 0%, #2d8a7a 100%);
  border-radius: 10px;
  color: white;
  box-shadow: 0 4px 15px rgba(27, 102, 89, 0.3);
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.header-right {
  display: flex;
  align-items: center;
}

.btn-add-header {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-add-header:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.table-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
  margin: 0;
}

.record-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  color: white;
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

.btn-secondary {
  background: #6c757d;
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
  width: 100%;
  justify-content: center;
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-2px);
}

.btn-delete, .btn-edit, .btn-view {
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

.text-capitalize {
  text-transform: capitalize;
}

/* Inputs y tablas */
.form-control, .form-control-sm {
  padding: 10px;
  border: 2px solid rgba(27, 102, 89, 0.2);
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-control:focus, .form-control-sm:focus {
  outline: none;
  border-color: #1b6659;
  box-shadow: 0 0 0 3px rgba(27, 102, 89, 0.1);
}

.table {
  margin-bottom: 0;
}

.table th {
  background: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
  font-weight: 600;
  color: #1b6659;
  padding: 12px 8px;
}

.table td {
  padding: 8px;
  vertical-align: middle;
}

.table tbody tr:hover {
  background-color: #f8f9fa;
}

.new-row {
  background-color: #f8f9fa;
  border-top: 2px solid #dee2e6;
}

.new-row td {
  padding: 12px 8px;
}

/* Responsive */
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

/* Estilos para el buscador de campos relacionales */
.search-select-container {
  position: relative;
  width: 100%;
}

.opciones-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.opcion-item {
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
}

.opcion-item:hover {
  background-color: #f8f9fa;
}

.opcion-item:last-child {
  border-bottom: none;
}

.no-opciones {
  padding: 8px 12px;
  color: #6c757d;
  font-style: italic;
  text-align: center;
}

/* Mejorar la apariencia del input de búsqueda */
.search-select-container .form-control {
  border-radius: 4px;
  border: 1px solid #ced4da;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.search-select-container .form-control:focus {
  border-color: #1b6659;
  box-shadow: 0 0 0 0.2rem rgba(27, 102, 89, 0.25);
}

/* Scrollbar personalizado para los resultados */
.opciones-dropdown::-webkit-scrollbar {
  width: 6px;
}

.opciones-dropdown::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.opciones-dropdown::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.opciones-dropdown::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Estilos para los botones de configuración */
.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.btn-config {
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-config:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(23, 162, 184, 0.4);
}

.btn-calendar {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-calendar:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);
}

.btn-calendar-config {
  background: linear-gradient(135deg, #1b6659 0%, #2d8a7a 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-calendar-config:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(27, 102, 89, 0.4);
}

/* Estilos para el resumen de campos */
.fields-summary {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.summary-stats {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #1b6659;
  line-height: 1;
}

.stat-label {
  font-size: 0.9rem;
  color: #6c757d;
  margin-top: 5px;
}

.fields-preview h5 {
  color: #495057;
  margin-bottom: 15px;
  font-weight: 600;
}

.fields-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.field-tag {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  background: #e9ecef;
  color: #495057;
  border: 1px solid #dee2e6;
}

.field-tag.text-primary {
  background: #e3f2fd;
  color: #1976d2;
  border-color: #bbdefb;
}

.field-tag.text-success {
  background: #e8f5e8;
  color: #2e7d32;
  border-color: #c8e6c9;
}

.field-tag.text-info {
  background: #e0f7fa;
  color: #0277bd;
  border-color: #b2ebf2;
}

.field-tag.text-warning {
  background: #fff8e1;
  color: #f57c00;
  border-color: #ffecb3;
}

.field-tag-more {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  background: #6c757d;
  color: white;
  border: 1px solid #6c757d;
}

/* Estilos para el modal de campos */
.fields-modal-content {
  max-height: 70vh;
  overflow-y: auto;
}

.section-title {
  color: #495057;
  font-weight: 600;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f8f9fa;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title i {
  color: #1b6659;
}

.new-field-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 25px;
  border: 1px solid #e9ecef;
}

.field-form-modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.field-form-modal .row {
  align-items: flex-end;
  gap: 15px;
}

.field-form-modal .form-group {
  margin-bottom: 0;
}

.field-form-modal .form-group label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 8px;
  display: block;
}

.field-form-modal .form-control {
  border: 2px solid #dee2e6;
  border-radius: 8px;
  padding: 10px 15px;
  transition: all 0.3s ease;
  width: 100%;
}

.field-form-modal .form-control:focus {
  border-color: #1b6659;
  box-shadow: 0 0 0 0.2rem rgba(27, 102, 89, 0.25);
}

.existing-fields-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.fields-accordion {
  background: white;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  overflow: hidden;
}

.fields-accordion .card {
  border: none;
  border-bottom: 1px solid #e9ecef;
}

.fields-accordion .card:last-child {
  border-bottom: none;
}

.fields-accordion .card-header {
  background: #f8f9fa;
  border: none;
  padding: 15px 20px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.fields-accordion .card-header:hover {
  background: #e9ecef;
}

.fields-accordion .card-header h5 {
  margin: 0;
  font-weight: 600;
  color: #495057;
}

.fields-accordion .card-body {
  padding: 20px;
  background: white;
}

.field-details {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.field-info-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.field-info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.field-info-item label {
  font-weight: 600;
  color: #6c757d;
  font-size: 0.9rem;
  margin: 0;
}

.field-info-item span {
  color: #495057;
  font-weight: 500;
}

.field-type-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.field-type-badge.text-primary {
  background: #e3f2fd;
  color: #1976d2;
}

.field-type-badge.text-success {
  background: #e8f5e8;
  color: #2e7d32;
}

.field-type-badge.text-info {
  background: #e0f7fa;
  color: #0277bd;
}

.field-type-badge.text-warning {
  background: #fff8e1;
  color: #f57c00;
}

.field-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 120px;
}

.empty-fields-state {
  padding: 40px 20px;
  text-align: center;
  color: #6c757d;
}

.empty-fields-state h6 {
  margin-bottom: 10px;
  color: #495057;
}

/* Estilos para el selector de vista */
.view-selector-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.view-tabs {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 15px;
}

.view-tab {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  color: #6c757d;
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

.view-tab:hover {
  background: #e9ecef;
  color: #495057;
}

.view-tab.active {
  background: linear-gradient(135deg, #1b6659 0%, #2d8a7a 100%);
  color: white;
  border-color: #1b6659;
}

.view-tab.active:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(27, 102, 89, 0.4);
}



/* Sección de filtros colapsables */
.filtros-section {
  margin-bottom: 20px;
}

.filtros-header-collapsible {
  background: linear-gradient(135deg, #1b6659 0%, #2d8a7a 100%);
  color: white;
  padding: 15px 20px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(27, 102, 89, 0.3);
}

.filtros-header-collapsible:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(27, 102, 89, 0.4);
}

.filtros-header-collapsible:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(27, 102, 89, 0.4);
}

.filtros-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}

.filtros-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.filtros-toggle {
  transition: transform 0.3s ease;
}

.filtros-toggle i {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.filtros-toggle i.rotated {
  transform: rotate(180deg);
}

.filtros-content-collapsible {
  background: white;
  border-radius: 0 0 10px 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-top: 5px;
}



/* Información de vista avanzada */
.advanced-view-info {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.info-badge {
  background: linear-gradient(135deg, #1b6659 0%, #2d8a7a 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(27, 102, 89, 0.3);
}

.btn-clear-filters {
  background: linear-gradient(135deg, #1b6659 0%, #2d8a7a 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  margin-top: 10px;
  box-shadow: 0 2px 8px rgba(27, 102, 89, 0.3);
}

.btn-clear-filters:hover {
  background: linear-gradient(135deg, #2d8a7a 0%, #1b6659 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(27, 102, 89, 0.4);
}

.calendar-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  padding: 30px;
  margin-bottom: 40px;
}

.calendar-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.debug-info {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.debug-info p {
  margin: 5px 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.no-events {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
}

.no-events h6 {
  margin-bottom: 10px;
  color: #495057;
}

.btn-test {
  background: #ffc107;
  color: #212529;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 10px;
  font-weight: 600;
}

.btn-test:hover {
  background: #e0a800;
}

/* Estilos para el modal de configuración del calendario */
.calendar-settings {
  padding: 20px 0;
}

.setting-section {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e9ecef;
}

.setting-section:last-child {
  border-bottom: none;
}

.setting-section h5 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-weight: 600;
}

.setting-section h6 {
  color: #495057;
  margin-bottom: 15px;
  font-weight: 600;
}

.setting-section p {
  color: #6c757d;
  margin-bottom: 15px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: 500;
  color: #495057;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #1b6659;
}

.fields-checkboxes {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 10px;
  background: #f8f9fa;
}

.field-checkbox {
  margin-bottom: 8px;
}

.field-checkbox:last-child {
  margin-bottom: 0;
}

.field-checkbox .checkbox-label {
  font-size: 0.9rem;
  color: #495057;
}

.no-fields {
  text-align: center;
  padding: 20px;
  color: #6c757d;
}

.no-fields p {
  margin: 0;
  font-style: italic;
}

.setting-actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.config-status {
  display: flex;
  justify-content: center;
  padding: 10px;
  border-radius: 6px;
  font-weight: 500;
}

.status-ok {
  color: #28a745;
  background: #d4edda;
  border: 1px solid #c3e6cb;
}

.status-warning {
  color: #856404;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
}

.status-disabled {
  color: #721c24;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
}

.action-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-save, .btn-cancel {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
}

.btn-save {
  background: #28a745;
  color: white;
}

.btn-cancel {
  background: #6c757d;
  color: white;
}

.btn-save:hover, .btn-cancel:hover {
  opacity: 0.8;
  transform: translateY(-1px);
}

/* Animación para el spinner de carga */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive para el modal */
@media (max-width: 768px) {
  .field-details {
    flex-direction: column;
    gap: 15px;
  }
  
  .field-info-grid {
    grid-template-columns: 1fr;
  }
  
  .field-actions {
    width: 100%;
  }
  
  .summary-stats {
    flex-direction: column;
    gap: 15px;
  }
  
  .field-form-modal .row {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  
  .view-tabs {
    flex-direction: column;
    gap: 10px;
  }
  
  .view-tab {
    width: 100%;
    justify-content: center;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .btn-config, .btn-calendar, .btn-calendar-config {
    width: 100%;
    justify-content: center;
  }
}

/* Selector de calendarios */
.calendar-selector {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
}

.calendar-selector h6 {
  margin-bottom: 15px;
  color: #495057;
  font-weight: 600;
}

.calendar-tabs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.calendar-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
  position: relative;
}

.calendar-tab:hover {
  border-color: #007bff;
  transform: translateY(-1px);
}

.calendar-tab.active {
  border-color: #007bff;
  background: #f8f9ff;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.2);
}

.calendar-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.disabled-badge {
  background: #dc3545;
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: auto;
}

/* Estilos para selección de calendarios en el modal */
.calendar-selection {
  margin-bottom: 20px;
}

.calendar-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.calendar-option {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 12px 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.calendar-option:hover {
  border-color: #007bff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
}

.calendar-option.active {
  border-color: #007bff;
  background: #f8f9ff;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.2);
}

.calendar-option.new-option {
  border-style: dashed;
  border-color: #28a745;
  background: #f8fff9;
}

.calendar-option.new-option:hover {
  border-color: #28a745;
  background: #e8f5e8;
}

.option-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.option-color {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
}

.option-icon {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #28a745;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
}

.option-title {
  font-weight: 600;
  color: #495057;
  flex: 1;
}

.option-status {
  background: #dc3545;
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
}

.option-details {
  color: #6c757d;
  font-size: 0.8rem;
  margin-left: 24px;
}

/* Estilos para el acordeón manual de campos existentes */
.accordion-item {
  border-bottom: 1px solid #e9ecef;
}
.accordion-header {
  width: 100%;
  background: #f8f9fa;
  border: none;
  outline: none;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  color: #495057;
  transition: background 0.2s;
}
.accordion-header:hover {
  background: #e9ecef;
}
.accordion-arrow {
  margin-left: 12px;
  font-size: 1.2rem;
  transition: transform 0.2s;
}
.accordion-arrow.open {
  transform: rotate(180deg);
}
.accordion-body {
  background: #fff;
  padding: 20px 24px 20px 24px;
  border-top: 1px solid #e9ecef;
  animation: fadeInAccordion 0.2s;
}
@keyframes fadeInAccordion {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Estilos para controles de paginación */
.paginacion-controls {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid rgba(27, 102, 89, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.pagination-info {
  color: #7f8c8d;
  font-size: 14px;
}

.pagination-buttons {
  display: flex;
  align-items: center;
  gap: 15px;
}

.btn-pagination {
  background: #1b6659;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-pagination:hover:not(:disabled) {
  background: #2d8a7a;
  transform: translateY(-1px);
}

.btn-pagination:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
}

.page-info {
  color: #2c3e50;
  font-weight: 600;
  font-size: 14px;
}

@media (max-width: 768px) {
  .paginacion-controls {
    flex-direction: column;
    text-align: center;
  }
  
  .pagination-buttons {
    justify-content: center;
  }
}

/* Estilos para el modal de agregar registros */
.add-record-modal {
  padding: 20px 0;
}

.add-record-modal .form-group {
  margin-bottom: 20px;
}

.add-record-modal .form-label {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
  display: block;
}

.add-record-modal .form-control {
  padding: 12px;
  border: 2px solid rgba(27, 102, 89, 0.2);
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  width: 100%;
}

.add-record-modal .form-control:focus {
  outline: none;
  border-color: #1b6659;
  box-shadow: 0 0 0 3px rgba(27, 102, 89, 0.1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.btn-modal-primary {
  background: linear-gradient(135deg, #1b6659 0%, #2d8a7a 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(27, 102, 89, 0.3);
}

.btn-modal-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(27, 102, 89, 0.4);
  background: linear-gradient(135deg, #2d8a7a 0%, #1b6659 100%);
}

.btn-modal-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}

.btn-modal-secondary:hover {
  background: #5a6268;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(108, 117, 125, 0.4);
}
</style> 