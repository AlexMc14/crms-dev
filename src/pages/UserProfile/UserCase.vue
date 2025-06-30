<template>
  <card class="card-user">
    <b-alert v-if="showSuccessEspe" variant="success" style="position: fixed; width: 100%; top: 0px; z-index: 9999;" show>Especialista modificado correctamente</b-alert>
    <div>
        <span style="color:#007bff; cursor:pointer;" @click="$emit('back')">Volver listado casos cliente</span>
    </div>
    <div>
      <p-button v-if="showAsAdmin && caseDetail.status !== '4'" class="mt-3" type="info" round @click.native.prevent="modalCloseCase = true">
       Caso finalizado
      </p-button>
      <p-button v-if="showAsSuperAdmin && caseDetail.status === '3'" class="mt-3 ml-3" type="info" round @click.native.prevent="modalFactura = true">
       Crear factura
      </p-button>
      <p-button v-if="isClient && showAsAdmin" class="mt-3 ml-3" type="info" round @click.native.prevent="editEspe = true">
        Editar especialista
      </p-button>
      <p-button v-if="isClient && showAsAdmin" class="mt-3 ml-3" type="info" round @click.native.prevent="editEspecialidad = true">
        Editar especialidad
      </p-button>
    </div>

     <div class="row mb-4">
        <div class="col-md-6 col-sm-12">
            <h4 class="title">
                {{ caseDetail.factura }}
            </h4>
        </div>
        <div class="col-md-6 col-sm-12">
            <h4 class="title">
                {{ isClient ? 'Datos Especialista ' : 'Datos Cliente '}}
            </h4>
        </div>
        <div class="col-md-6 col-sm-12">
            <div v-if="showAsAdmin">
                <span for="">Estado: {{ caseDetail.estadoCaso }}</span>
            </div>
            <div v-if="showAsAdmin" class="mt-2">
                <span for="">Fecha alta caso: {{ caseDetail.fechaAlta }}</span>
            </div>
            <div v-if="showAsAdmin" class="mt-2">
                <span for="">Tipo de cliente: {{ caseDetail.tipoCliente === '1' ? 'Despacho' : 'Particular' }}</span>
            </div>
            <div v-if="showAsAdmin && caseDetail.tipoCliente === '1'" class="mt-2">
                <span for="">Nombre del despacho: {{ caseDetail.nombreDespacho }}</span>
            </div>
            <div class="mt-2">
                <span for="">Especialidad: {{ caseDetail.especialidadNombre }}</span> 
            </div>
            <!-- <div v-if="caseDetail.presupuesto" class="mt-2">
                <span for="">Presupuesto: {{ caseDetail.presupuesto }}€</span>
            </div> -->
        </div>
        <div v-if="userCase" class="col-md-6 col-sm-12">
          {{ userCase.id }}
            <div class="">
                <span v-if="!isClient && !showAsSuperAdmin" for="">{{ userCase.nombre + ' ' + userCase.apellidos }}</span>
                <a v-if="showAsSuperAdmin" @click="$router.push({ name: 'UserProfile', params: { id: userCase.id }, query: { type: isClient ? 'despacho' : 'cliente'} })" :href="`https://alexmc14.github.io/peritomedicotest/#/perfil/${userCase.id}?type=${isClient ? 'especialista' : 'cliente'}`" target="_blank" rel="noopener noreferrer">
                  {{ userCase.nombre + ' ' + userCase.apellidos }}
                </a>
                <!-- <a v-if="isClient" @click="$router.replace({ name: 'UserProfile', params: { id: userCase.id }, query: { type: 'especialista'} })">{{ userCase.nombre + ' ' + userCase.apellidos }}</a> -->
            </div>
            <div class="mt-2">
                <span>{{ userCase.tel }}</span>
            </div>
            <div class="mt-2">
                <span for="">{{ userCase.correo }}</span>
            </div>
            <div class="mt-2">
                <span for="">{{ comunidades[userCase.comunidad] }}</span>
            </div>
            <div class="mt-2">
                <span for="">{{ provincias[userCase.provincia] }}</span>
            </div>
            <div class="mt-2">
                <span for="">{{ userCase.poblacion }}</span>
            </div>
        </div>
        <div class="col-12 text-center">
          <h3>Juicio</h3>
        </div>
    </div>

    <!-- Sección de Citas del Cliente -->
    <div v-if="userCase && userCase.tel" class="row mb-4">
      <div class="col-12">
        <h4 class="title">Citas/juicio del cliente</h4>
        <div v-if="citasCliente.length > 0" class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Tipo</th>
                <th>Lugar</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cita in citasCliente" :key="cita.id">
                <td>{{ formatDate(cita.fecha) }}</td>
                <td>{{ cita.hora }}</td>
                <td>{{ cita.tipo === 'cita' ? 'Cita' : 'Juicio' }}</td>
                <td>{{ cita.lugar }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-center">
          <p>No hay citas registradas para este cliente.</p>
        </div>
      </div>
    </div>

    <div v-if="parseInt(caseDetail.status) > 1" class="accordion" role="tablist">
      <b-card v-if="caseDetail.especialidadNombre.toLowerCase() === 'praxis' || caseDetail.especialidadNombre.toLowerCase() === 'incapacidad' || caseDetail.especialidadNombre.toLowerCase().includes('laboral') || caseDetail.especialidadNombre.toLowerCase().includes('daño')" no-body class="mb-1">
        
        <b-card-header header-tag="header" class="p-1" role="tab">
          <b-button block v-b-toggle.accordion-0 variant="info">Documentación útil</b-button>
        </b-card-header>
        <b-collapse id="accordion-0" accordion="my-accordion" role="tabpanel">
          <b-card-body>
            <div class="row">
              <div v-if="caseDetail.especialidadNombre.toLowerCase() === 'incapacidad'" class="col-3 text-center">
                <div @click="descargarArchivo('documents/plantillainformepericialincapacidad.docx', 'plantillaViabilidad.docx')"> 
                  <img src="../../assets/img/word.png" alt="" class="mb-3" style="max-width:75px; display:block; margin:0 auto;">
                  <span>Plantilla incapacidad</span> <br>
                </div>
                
              </div>
              <div v-if="caseDetail.especialidadNombre.toLowerCase() === 'praxis'" class="col-3 text-center">
                <div @click="descargarArchivo('documents/plantillaViabilidad.docx', 'plantillaViabilidad.docx')"> 
                  <img src="../../assets/img/word.png" alt="" class="mb-3" style="max-width:75px; display:block; margin:0 auto;">
                  <span>Plantilla viabilidad</span> <br>
                </div>
                
              </div>
              <div v-if="caseDetail.especialidadNombre.toLowerCase() === 'praxis'" class="col-3 text-center">
                <div @click="descargarArchivo('documents/plantillaInformePericial.docx', 'plantillaInformePericial.docx')"> 
                  <img src="../../assets/img/word.png" alt="" class="mb-3" style="max-width:75px; display:block; margin:0 auto;">
                  <span>Plantilla informe pericial</span> <br>
                </div>
              </div>
              <div v-if="caseDetail.especialidadNombre.toLowerCase().includes('laboral')" class="col-3 text-center">
                <div @click="descargarArchivo('documents/plantillaViabilidadIncapacidad.docx', 'plantillaInformePericial.docx')"> 
                  <img src="../../assets/img/word.png" alt="" class="mb-3" style="max-width:75px; display:block; margin:0 auto;">
                  <span>Plantilla incapacidad laboral</span> <br>
                </div>
              </div>
              <div v-if="caseDetail.especialidadNombre.toLowerCase().includes('daño')" class="col-3 text-center">
                <div @click="descargarArchivo('documents/plantillaVDC.docx', 'plantillaVDC.docx')"> 
                  <img src="../../assets/img/word.png" alt="" class="mb-3" style="max-width:75px; display:block; margin:0 auto;">
                  <span>Plantilla valoración del daño corporal</span> <br>
                </div>
              </div>
              <div v-if="caseDetail.especialidadNombre.toLowerCase().includes('daño')" class="col-3 text-center">
                <div @click="descargarArchivo('documents/baremoTrafico2016.pdf', 'baremoTrafico2016.pdf')"> 
                  <img src="../../assets/img/word.png" alt="" class="mb-3" style="max-width:75px; display:block; margin:0 auto;">
                  <span>Baremo tráfico 2016</span> <br>
                </div>
              </div>
              
            </div>
          </b-card-body>
        </b-collapse>
      </b-card>

      <b-card v-if="showAsSuperAdmin || caseDetail.telEspecialista === userInfo.tel" no-body class="mb-1">
        <b-card-header header-tag="header" class="p-1" role="tab">
          <b-button block v-b-toggle.accordion-5 variant="info">Factura especialista</b-button>
        </b-card-header>
        <b-collapse id="accordion-5" accordion="my-accordion" role="tabpanel">
          <b-card-body>
            <div class="row">
             <div class="col-12">
                  <h3>Factura del especialista</h3>
                  <label for="file-upload" class="text-white custom-file-upload">
                    <input type="file" id="file-upload" @change="onFileChange" multiple />
                    Seleccionar archivo
                  </label>
                  <p-button
                  class="ml-4"
                    type="info"
                    round
                    @click.native.prevent="uploadFile('facturaEspecialista')"
                    :disabled="!file"
                  >
                    Subir Archivo
                  </p-button>
                </div>
              </div>
              <div v-if="files.facturaEspecialista" class="row">
                <div class="col-12">
                  <h4>Archivos Subidos:</h4>
                  <div class="row">
                    <div class="col-3 text-center;" v-for="file in files.facturaEspecialista" :key="file.name">
                      <a @click="markAsClicked(file.name)" :class="{'clicked-file': clickedFiles.includes(file.name)}" :href="file.url" target="_blank" style="display:block;">
                        <img v-if="file.name.includes('.pdf') || file.name.includes('.doc') || file.name.includes('.docx')" src="../../assets/img/pdf.png" alt="" class="mb-3" style="max-width:75px; display:block; margin:0 auto;">
                        <img v-else-if="file.name.includes('.png') || file.name.includes('.jpg') || file.name.includes('.jpeg')" src="../../assets/img/png.png" alt="" class="mb-3" style="max-width:75px; display:block; margin:0 auto;">
                        <img v-else src="../../assets/img/pdf.png" alt="" class="mb-3" style="max-width:75px; display:block; margin:0 auto;">
                        <span>{{ file.name }}</span> <br>
                        <span>Fecha de archivo subido: {{ file.date ? file.date.split('T')[0] : 'Hoy' }}</span>
                      </a>
                      <div v-if="showAsSuperAdmin" @click="deleteFile(file, 'facturaEspecialista')">
                        <p-button
                        class="mt-2"
                            type="danger"
                            round
                            
                        >
                            Eliminar
                        </p-button>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
          </b-card-body>
        </b-collapse>
      </b-card>

      <b-card no-body class="mb-1">
        <b-card-header header-tag="header" class="p-1" role="tab">
          <b-button block v-b-toggle.accordion-1 variant="info">Estudio de viabilidad</b-button>
        </b-card-header>
        <b-collapse id="accordion-1" accordion="my-accordion" role="tabpanel">
          <b-card-body>
            <div class="row">
              <div class="col-4">
                <label class="d-block" for="plazoEstudio">Plazo</label>
                <input v-model="estudio.plazo" name="plazoEstudio" type="date">
              </div>
              <div class="col-4">
                <label class="d-block" for="fechaEncargo">Fecha de encargo</label>
                <input v-model="estudio.fechaEncargo" name="fechaEncargo" type="date">
              </div>
              <!-- <div class="col-4">
                <label class="d-block" for="plazoEstudio">Realizado: </label>
              </div> -->
              <div class="col-4">
                <label class="d-block" for="estudioEnviado">Enviado al cliente: </label>
                <label class="mr-1" for="estudioEnviado">Si</label>
                <input v-model="estudio.enviadoCliente" class="hAuto" type="radio" id="estudioEnviado" name="estudioCliente" value="true" />

                <label class="ml-3 mr-1" for="estudioEnviado">No</label>
                <input v-model="estudio.enviadoCliente" class="hAuto" type="radio" id="estudioEnviado" name="estudioCliente" value="false" />
              </div>
              <div v-if="showAsAdmin" class="col-4 mt-4">
                <label class="d-block">Pagado por el cliente: </label>
                <label class="mr-1" for="estudioPagadoCliente">Si</label>
                <input v-model="estudio.pagadoCliente" class="hAuto" type="radio" id="estudioPagadoCliente" name="estudioPagoCliente" value="true" />

                <label class="ml-3 mr-1" for="estudioPagadoCliente">No</label>
                <input v-model="estudio.pagadoCliente" class="hAuto" type="radio" id="estudioPagadoCliente" name="estudioPagoCliente" value="false" />
              </div>
              <div v-if="showAsAdmin" class="col-4 mt-4">
                <label class="d-block">Pagado al especialista: </label>
                <label class="mr-1" for="estudioPagadoEspecialista">Si</label>
                <input v-model="estudio.pagadoEspecialista" class="hAuto" type="radio" id="estudioPagadoEspecialista" name="estudioPagoEspecialista" value="true" />

                <label class="ml-4 mr-1" for="estudioPagadoEspecialista">No</label>
                <input v-model="estudio.pagadoEspecialista" class="hAuto" type="radio" id="estudioPagadoEspecialista" name="estudioNoPagoEspecialista" value="false" />
              </div>
              <div class="col-12">
                  <h3>Archivos de estudio viabilidad</h3>
                  <label for="file-upload" class="text-white custom-file-upload">
                    <input type="file" id="file-upload" @change="onFileChange" multiple />
                    Seleccionar archivo
                  </label>
                  <p-button
                  class="ml-4"
                    type="info"
                    round
                    @click.native.prevent="uploadFile('viabilidad')"
                    :disabled="!file"
                  >
                    Subir Archivo
                  </p-button>
                </div>
              </div>
              <div v-if="files.viabilidad" class="row">
                <div class="col-12">
                  <h4>Archivos Subidos:</h4>
                  <div class="row">
                    <div class="col-3 text-center;" v-for="file in files.viabilidad" :key="file.name">
                      <a  @click="markAsClicked(file.name)" :class="{'clicked-file': clickedFiles.includes(file.name)}" :href="file.url" target="_blank" style="display:block;">
                        <img v-if="file.name.includes('.pdf') || file.name.includes('.doc') || file.name.includes('.docx')" src="../../assets/img/pdf.png" alt="" class="mb-3" style="max-width:75px; display:block; margin:0 auto;">
                        <img v-else-if="file.name.includes('.png') || file.name.includes('.jpg') || file.name.includes('.jpeg')" src="../../assets/img/png.png" alt="" class="mb-3" style="max-width:75px; display:block; margin:0 auto;">
                        <img v-else src="../../assets/img/pdf.png" alt="" class="mb-3" style="max-width:75px; display:block; margin:0 auto;">
                        <span>{{ file.name }}</span>
                        <span>Fecha de archivo subido: {{ file.date ? file.date.split('T')[0] : 'Hoy' }}</span>
                      </a>
                      <div v-if="showAsSuperAdmin" @click="deleteFile(file, 'viabilidad')">
                        <p-button
                        class="mt-2"
                            type="danger"
                            round
                            
                            :disabled="!file"
                        >
                            Eliminar
                        </p-button>
                      </div>
                    </div>
                  </div>
                  <!-- <ul>
                    <li v-for="file in files.viabilidad" :key="file.name" class="mt-3">
                      <a :href="file.url" target="_blank">{{ file.name }}</a>
                      <p-button
                        class="ml-4"
                          type="danger"
                          round
                          @click="deleteFile(file, 'viabilidad')"
                          :disabled="!file"
                      >
                          Eliminar
                      </p-button>
                    </li>
                  </ul> -->
                </div>
              </div>
              <div class="col-12 pl-0">
                  <h3>Informe pericial</h3>
                  <label for="file-upload" class="text-white custom-file-upload">
                    <input type="file" id="file-upload" @change="onFileChange" multiple />
                    Seleccionar archivo
                  </label>
                  <p-button
                  class="ml-4"
                    type="info"
                    round
                    @click.native.prevent="uploadFile('informeViabilidad')"
                    :disabled="!file"
                  >
                    Subir Archivo
                  </p-button>
              </div>
              <div v-if="files.informeViabilidad" class="row">
                <div class="col-12">
                  <h4>Archivos Subidos:</h4>
                  <div class="row">
                    <div class="col-3 text-center;" v-for="file in files.informeViabilidad" :key="file.name">
                      <a  @click="markAsClicked(file.name)" :class="{'clicked-file': clickedFiles.includes(file.name)}" :href="file.url" target="_blank" style="display:block;">
                        <img v-if="file.name.includes('.pdf') || file.name.includes('.doc') || file.name.includes('.docx')" src="../../assets/img/pdf.png" alt="" class="mb-3" style="max-width:75px; display:block; margin:0 auto;">
                        <img v-else-if="file.name.includes('.png') || file.name.includes('.jpg') || file.name.includes('.jpeg')" src="../../assets/img/png.png" alt="" class="mb-3" style="max-width:75px; display:block; margin:0 auto;">
                        <img v-else src="../../assets/img/pdf.png" alt="" class="mb-3" style="max-width:75px; display:block; margin:0 auto;">
                        <span>{{ file.name }}</span> <br>
                        <span>Fecha de archivo subido: {{ file.date ? file.date.split('T')[0] : 'Hoy' }}</span>
                      </a>
                      <div v-if="showAsSuperAdmin" @click="deleteFile(file, 'informeViabilidad')">
                        <p-button
                        class="mt-2"
                            type="danger"
                            round
                            :disabled="!file"
                        >
                            Eliminar
                        </p-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="showAsSuperAdmin" class="col-12 pl-0">
                  <h3>Archivos Pagos de estudio de viabilidad</h3>
                  <label for="file-upload" class="text-white custom-file-upload">
                    <input type="file" id="file-upload" @change="onFileChange" multiple />
                    Seleccionar archivo
                  </label>
                  <p-button
                  class="ml-4"
                    type="info"
                    round
                    @click.native.prevent="uploadFile('viabilidadPago')"
                    :disabled="!file"
                  >
                    Subir Archivo
                  </p-button>
              </div>
              <div v-if="files.viabilidadPago && showAsSuperAdmin" class="row">
                <div class="col-12">
                  <h4>Archivos Subidos:</h4>
                   <div class="row">
                    <div class="col-3 text-center;" v-for="file in files.viabilidadPago" :key="file.name">
                      <a  @click="markAsClicked(file.name)" :class="{'clicked-file': clickedFiles.includes(file.name)}" :href="file.url" target="_blank" style="display:block;">
                        <img v-if="file.name.includes('.pdf') || file.name.includes('.doc') || file.name.includes('.docx')" src="../../assets/img/pdf.png" alt="" class="mb-3" style="max-width:75px; display:block; margin:0 auto;">
                        <img v-else-if="file.name.includes('.png') || file.name.includes('.jpg') || file.name.includes('.jpeg')" src="../../assets/img/png.png" alt="" class="mb-3" style="max-width:75px; display:block; margin:0 auto;">
                        <img v-else src="../../assets/img/pdf.png" alt="" class="mb-3" style="max-width:75px; display:block; margin:0 auto;">
                        <span>{{ file.name }}</span> <br>
                        <span>Fecha de archivo subido: {{ file.date ? file.date.split('T')[0] : 'Hoy' }}</span>
                      </a>
                      <div v-if="showAsSuperAdmin" @click="deleteFile(file, 'viabilidadPago')">
                        <p-button
                        class="mt-2"
                            type="danger"
                            round
                            :disabled="!file"
                        >
                            Eliminar
                        </p-button>
                      </div>
                    </div>
                  </div>
                  <!-- <ul>
                    <li v-for="file in files.viabilidadPago" :key="file.name">
                      <a :href="file.url" target="_blank">{{ file.name }}</a>
                      <p-button
                        class="ml-4"
                          type="danger"
                          round
                          @click="deleteFile(file, 'viabilidadPago')"
                          :disabled="!file"
                      >
                          Eliminar
                      </p-button>
                    </li>
                  </ul> -->
              </div>
              <!-- <div class="col-6 mt-4">
                <input type="file" name="" id="">
              </div>
              <div class="col-6 mt-4">
                <input type="file" name="" id="">
              </div> -->
            </div>
          </b-card-body>
        </b-collapse>
      </b-card>

      <b-card no-body class="mb-1">
        <b-card-header header-tag="header" class="p-1" role="tab">
          <b-button block v-b-toggle.accordion-2 variant="info">Informe pericial médico</b-button>
        </b-card-header>
        <b-collapse id="accordion-2" accordion="my-accordion" role="tabpanel">
          <b-card-body>
            <div class="row">
              <div class="col-4">
                <label class="d-block" for="plazoInforme">Plazo</label>
                <input v-model="informe.plazo" name="plazoInforme" type="date">
              </div>
               <div class="col-4">
                <label class="d-block" for="fechaEncargo">Fecha de encargo</label>
                <input v-model="informe.fechaEncargo" name="fechaEncargo" type="date">
              </div>
              <!-- <div class="col-4">
                <label class="d-block" for="plazoInforme">Realizado: </label>
              </div> -->
              <div class="col-4">
                <label class="d-block" for="informeEnviado">Enviado al cliente: </label>
                <label class="mr-1" for="informeEnviado">Si</label>
                <input v-model="informe.enviadoCliente" class="hAuto" type="radio" id="informeEnviado" name="informeCliente" value="true" />

                <label class="ml-3 mr-1" for="informeEnviado">No</label>
                <input v-model="informe.enviadoCliente" class="hAuto" type="radio" id="informeEnviado" name="informeCliente" value="false" />
              </div>
              <div v-if="showAsAdmin" class="col-4 mt-4">
                <label class="d-block">Pagado por el cliente: </label>
                <label class="mr-1" for="informePagadoCliente">Si</label>
                <input v-model="informe.pagadoCliente" class="hAuto" type="radio" id="informePagadoCliente" name="informePagoCliente" value="true" />

                <label class="ml-3 mr-1" for="informePagadoCliente">No</label>
                <input v-model="informe.pagadoCliente" class="hAuto" type="radio" id="informePagadoCliente" name="informePagoCliente" value="false" />
              </div>
              <div v-if="showAsAdmin" class="col-4 mt-4">
                <label class="d-block">Pagado al especialista: </label>
                <label class="mr-1" for="informePagadoEspecialista">Si</label>
                <input v-model="informe.pagadoEspecialista" class="hAuto" type="radio" id="informePagadoEspecialista" name="informePagoEspecialista" value="true" />

                <label class="ml-4 mr-1" for="informePagadoEspecialista">No</label>
                <input v-model="informe.pagadoEspecialista" class="hAuto" type="radio" id="informePagadoEspecialista" name="informePagoEspecialista" value="false" />
              </div>
              <div class="col-12">
                  <h3>Archivos de estudio informe pericial</h3>
                  <label for="file-upload" class="text-white custom-file-upload">
                    <input type="file" id="file-upload" @change="onFileChange" multiple />
                    Seleccionar archivo
                  </label>
                  <p-button
                  class="ml-4"
                    type="info"
                    round
                    @click.native.prevent="uploadFile('informe')"
                    :disabled="!file"
                  >
                    Subir Archivo
                  </p-button>
                </div>
              </div>
              <div v-if="files.informe" class="row">
                <div class="col-12">
                  <h4>Archivos Subidos:</h4>
                  <div class="row">
                    <div class="col-3 text-center;" v-for="file in files.informe" :key="file.name">
                      <a @click="markAsClicked(file.name)" :class="{'clicked-file': clickedFiles.includes(file.name)}" :href="file.url" target="_blank" style="display:block;">
                        <img v-if="file.name.includes('.pdf') || file.name.includes('.doc') || file.name.includes('.docx')" src="../../assets/img/pdf.png" alt="" class="mb-3" style="max-width:75px; display:block; margin:0 auto;">
                        <img v-else-if="file.name.includes('.png') || file.name.includes('.jpg') || file.name.includes('.jpeg')" src="../../assets/img/png.png" alt="" class="mb-3" style="max-width:75px; display:block; margin:0 auto;">
                        <img v-else src="../../assets/img/pdf.png" alt="" class="mb-3" style="max-width:75px; display:block; margin:0 auto;">
                        <span>{{ file.name }}</span> <br>
                        <span>Fecha de archivo subido: {{ file.date ? file.date.split('T')[0] : 'Hoy' }}</span>
                      </a>
                      <div v-if="showAsSuperAdmin" @click="deleteFile(file, 'informe')">
                        <p-button
                        class="mt-2"
                            type="danger"
                            round
                            
                        >
                            Eliminar
                        </p-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-12 pl-0">
                  <h3>Informe pericial</h3>
                  <label for="file-upload" class="text-white custom-file-upload">
                    <input type="file" id="file-upload" @change="onFileChange" multiple />
                    Seleccionar archivo
                  </label>
                  <p-button
                  class="ml-4"
                    type="info"
                    round
                    @click.native.prevent="uploadFile('informePericial')"
                    :disabled="!file"
                  >
                    Subir Archivo
                  </p-button>
              </div>
              <div v-if="files.informePericial" class="row">
                <div class="col-12">
                  <h4>Archivos Subidos:</h4>
                  <div class="row">
                    <div class="col-3 text-center;" v-for="file in files.informePericial" :key="file.name">
                      <a  @click="markAsClicked(file.name)" :class="{'clicked-file': clickedFiles.includes(file.name)}" :href="file.url" target="_blank" style="display:block;">
                        <img v-if="file.name.includes('.pdf') || file.name.includes('.doc') || file.name.includes('.docx')" src="../../assets/img/pdf.png" alt="" class="mb-3" style="max-width:75px; display:block; margin:0 auto;">
                        <img v-else-if="file.name.includes('.png') || file.name.includes('.jpg') || file.name.includes('.jpeg')" src="../../assets/img/png.png" alt="" class="mb-3" style="max-width:75px; display:block; margin:0 auto;">
                        <img v-else src="../../assets/img/pdf.png" alt="" class="mb-3" style="max-width:75px; display:block; margin:0 auto;">
                        <span>{{ file.name }}</span> <br>
                        <span>Fecha de archivo subido: {{ file.date ? file.date.split('T')[0] : 'Hoy' }}</span>
                      </a>
                      <div v-if="showAsSuperAdmin" @click="deleteFile(file, 'informePericial')">
                        <p-button
                        class="mt-2"
                            type="danger"
                            round
                            :disabled="!file"
                        >
                            Eliminar
                        </p-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="showAsSuperAdmin" class="col-12 pl-0">
                  <h3>Archivos Pagos de estudio informe pericial</h3>
                  <label for="file-upload" class="text-white custom-file-upload">
                    <input type="file" id="file-upload" @change="onFileChange" multiple />
                    Seleccionar archivo
                  </label>
                  <p-button
                  class="ml-4"
                    type="info"
                    round
                    @click.native.prevent="uploadFile('informePago')"
                    :disabled="!file"
                  >
                    Subir Archivo
                  </p-button>
              </div>
              <div v-if="files.informePago && showAsSuperAdmin" class="row">
                <div class="col-12">
                  <h4>Archivos Subidos:</h4>
                  <div class="row">
                    <!-- <div class="col-12 text-center mb-3">
                      <button class="btn btn-primary" @click="openAllFiles(files.informePago)">
                        Abrir Todos
                      </button>
                    </div> -->
                    <div class="col-3 text-center;" v-for="file in files.informePago" :key="file.name">
                      <a  @click="markAsClicked(file.name)" :class="{'clicked-file': clickedFiles.includes(file.name)}" :href="file.url" target="_blank" style="display:block;">
                        <img v-if="file.name.includes('.pdf') || file.name.includes('.doc') || file.name.includes('.docx')" src="../../assets/img/pdf.png" alt="" class="mb-3" style="max-width:75px; display:block; margin:0 auto;">
                        <img v-else-if="file.name.includes('.png') || file.name.includes('.jpg') || file.name.includes('.jpeg')" src="../../assets/img/png.png" alt="" class="mb-3" style="max-width:75px; display:block; margin:0 auto;">
                        <img v-else src="../../assets/img/pdf.png" alt="" class="mb-3" style="max-width:75px; display:block; margin:0 auto;">
                        <span>{{ file.name }}</span> <br>
                        <span>Fecha de archivo subido: {{ file.date ? file.date.split('T')[0] : 'Hoy' }}</span>
                      </a>
                      <div v-if="showAsSuperAdmin" @click="deleteFile(file, 'informePago')">
                        <p-button
                        class="mt-2"
                            type="danger"
                            round
                            :disabled="!file"
                        >
                            Eliminar
                        </p-button>
                      </div>
                    </div>
                  </div>
                  <!-- <ul>
                    <li v-for="file in files.informePago" :key="file.name" class="mt-3">
                      <a :href="file.url" target="_blank">{{ file.name }}</a>
                      <p-button
                        class="ml-4"
                          type="danger"
                          round
                          @click="deleteFile(file, 'informePago')"
                          :disabled="!file"
                      >
                          Eliminar
                      </p-button>
                    </li>
                  </ul> -->
              </div>
              <!-- <div class="col-6 mt-4">
                <input type="file" name="" id="">
              </div>
              <div class="col-6 mt-4">
                <input type="file" name="" id="">
              </div> -->
            </div>
          </b-card-body>
        </b-collapse>
      </b-card>

      <b-card no-body class="mb-1">
        <b-card-header header-tag="header" class="p-1" role="tab">
          <b-button block v-b-toggle.accordion-3 variant="info">Ratificación en juicio</b-button>
        </b-card-header>
        <b-collapse id="accordion-3" accordion="my-accordion" role="tabpanel">
          <b-card-body>
             <div class="row">
              <!-- <div class="col-4">
                <label class="d-block" for="plazoRatificacion">Plazo</label>
                <input v-model="ratificacion.plazo" name="plazoRatificacion" type="date">
              </div> -->
              <!-- <div class="col-4">
                <label class="d-block" for="plazoRatificacion">Lugar</label>
                <input v-model="ratificacion.lugar" name="fechaRatificacion" type="text">
              </div> -->
              <!-- <div class="col-4">
                <label for="plazoRatificacion">Videollamada</label>
                <input v-model="ratificacion.videollamada" name="fechaRatificacion" type="checkbox">
              </div> -->
              <!-- <div class="col-4 mt-4">
                <label class="d-block" for="plazoRatificacion">Fecha juicio</label>
                <input v-model="ratificacion.fechaJuicio" name="fechaRatificacion" type="date">
              </div> -->
              <!-- <div class="col-4 mt-4">
                <label class="d-block" for="plazoRatificacion">Realizado: </label>
              </div> -->
              <div class="col-4 mt-4">
                <label class="d-block" for="ratificacionEnviado">Enviado al cliente: </label>
                <label class="mr-1" for="ratificacionEnviado">Si</label>
                <input v-model="ratificacion.enviadoCliente" class="hAuto" type="radio" id="ratificacionEnviado" name="ratificacionEnviado" value="true" />

                <label class="ml-3 mr-1" for="ratificacionEnviado">No</label>
                <input v-model="ratificacion.enviadoCliente" class="hAuto" type="radio" id="ratificacionEnviado" name="ratificacionEnviado" value="false" />
              </div>
              <div v-if="showAsAdmin" class="col-4 mt-4">
                <label class="d-block">Pagado por el cliente: </label>
                <label class="mr-1" for="ratificacionPagadoCliente">Si</label>
                <input v-model="ratificacion.pagadoCliente" class="hAuto" type="radio" id="ratificacionPagadoCliente" name="ratificacionPagoCliente" value="true" />

                <label class="ml-3 mr-1" for="ratificacionPagadoCliente">No</label>
                <input v-model="ratificacion.pagadoCliente" class="hAuto" type="radio" id="ratificacionPagadoCliente" name="ratificacionPagoCliente" value="false" />
              </div>
              <div v-if="showAsAdmin" class="col-4 mt-4">
                <label class="d-block">Pagado al especialista: </label>
                <label class="mr-1" for="ratificacionPagadoEspecialista">Si</label>
                <input v-model="ratificacion.pagadoEspecialista" class="hAuto" type="radio" id="ratificacionPagadoEspecialista" name="ratificacionPagoEspecialista" value="true" />

                <label class="ml-4 mr-1" for="ratificacionPagadoEspecialista">No</label>
                <input v-model="ratificacion.pagadoEspecialista" class="hAuto" type="radio" id="ratificacionPagadoEspecialista" name="ratificacionPagoEspecialista" value="false" />
              </div>
              <div class="col-12">
                  <h3>Archivos de ratificación de juicio</h3>
                  <label for="file-upload" class="text-white custom-file-upload">
                    <input type="file" id="file-upload" @change="onFileChange" multiple />
                    Seleccionar archivo
                  </label>
                  <p-button
                  class="ml-4"
                    type="info"
                    round
                    @click.native.prevent="uploadFile('ratificacion')"
                    :disabled="!file"
                  >
                    Subir Archivo
                  </p-button>
                </div>
              </div>
              <div v-if="files.informe" class="row">
                <div class="col-12">
                  <h4>Archivos Subidos:</h4>
                  <div class="row">
                    <div class="col-3 text-center;" v-for="file in files.ratificacion" :key="file.name">
                      <a  @click="markAsClicked(file.name)" :class="{'clicked-file': clickedFiles.includes(file.name)}" :href="file.url" target="_blank" style="display:block;">
                        <img v-if="file.name.includes('.pdf') || file.name.includes('.doc') || file.name.includes('.docx')" src="../../assets/img/pdf.png" alt="" class="mb-3" style="max-width:75px; display:block; margin:0 auto;">
                        <img v-else-if="file.name.includes('.png') || file.name.includes('.jpg') || file.name.includes('.jpeg')" src="../../assets/img/png.png" alt="" class="mb-3" style="max-width:75px; display:block; margin:0 auto;">
                        <img v-else src="../../assets/img/pdf.png" alt="" class="mb-3" style="max-width:75px; display:block; margin:0 auto;">
                        <span>{{ file.name }}</span> <br>
                        <span>Fecha de archivo subido: {{ file.date ? file.date.split('T')[0] : 'Hoy' }}</span>
                      </a>
                      <div v-if="showAsSuperAdmin" @click="deleteFile(file, 'ratificacion')">
                        <p-button
                        class="mt-2"
                            type="danger"
                            round
                            :disabled="!file"
                        >
                            Eliminar
                        </p-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="superAdmin" class="col-12 pl-0">
                  <h3>Informe de ratificación de juicio</h3>
                  <label for="file-upload" class="text-white custom-file-upload">
                    <input type="file" id="file-upload" @change="onFileChange" multiple />
                    Seleccionar archivo
                  </label>
                  <p-button
                  class="ml-4"
                    type="info"
                    round
                    @click.native.prevent="uploadFile('informeRatificacion')"
                    :disabled="!file"
                  >
                    Subir Archivo
                  </p-button>
              </div>
              <div v-if="files.informeRatificacion" class="row">
                <div class="col-12">
                  <h4>Archivos Subidos:</h4>
                  <div class="row">
                    <div class="col-3 text-center;" v-for="file in files.informeRatificacion" :key="file.name">
                      <a  @click="markAsClicked(file.name)" :class="{'clicked-file': clickedFiles.includes(file.name)}" :href="file.url" target="_blank" style="display:block;">
                        <img v-if="file.name.includes('.pdf') || file.name.includes('.doc') || file.name.includes('.docx')" src="../../assets/img/pdf.png" alt="" class="mb-3" style="max-width:75px; display:block; margin:0 auto;">
                        <img v-else-if="file.name.includes('.png') || file.name.includes('.jpg') || file.name.includes('.jpeg')" src="../../assets/img/png.png" alt="" class="mb-3" style="max-width:75px; display:block; margin:0 auto;">
                        <img v-else src="../../assets/img/pdf.png" alt="" class="mb-3" style="max-width:75px; display:block; margin:0 auto;">
                        <span>{{ file.name }}</span> <br>
                        <span>Fecha de archivo subido: {{ file.date ? file.date.split('T')[0] : 'Hoy' }}</span>
                      </a>
                      <div v-if="showAsSuperAdmin" @click="deleteFile(file, 'informeRatificacion')">
                        <p-button
                        class="mt-2"
                            type="danger"
                            round
                            :disabled="!file"
                        >
                            Eliminar
                        </p-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="showAsSuperAdmin" class="col-12 pl-0">
                  <h3>Archivos Pagos de ratificación de juicio</h3>
                  <label for="file-upload" class="text-white custom-file-upload">
                    <input type="file" id="file-upload" @change="onFileChange" multiple />
                    Seleccionar archivo
                  </label>
                  <p-button
                  class="ml-4"
                    type="info"
                    round
                    @click.native.prevent="uploadFile('ratificacionPago')"
                    :disabled="!file"
                  >
                    Subir Archivo
                  </p-button>
              </div>
              <div v-if="files.ratificacionPago && showAsSuperAdmin" class="row">
                <div class="col-12">
                  <h4>Archivos Subidos:</h4>
                  <div class="row">
                    <div class="col-3 text-center;" v-for="file in files.ratificacionPago" :key="file.name">
                      <a  @click="markAsClicked(file.name)" :class="{'clicked-file': clickedFiles.includes(file.name)}" :href="file.url" target="_blank" style="display:block;">
                        <img v-if="file.name.includes('.pdf') || file.name.includes('.doc') || file.name.includes('.docx')" src="../../assets/img/pdf.png" alt="" class="mb-3" style="max-width:75px; display:block; margin:0 auto;">
                        <img v-else-if="file.name.includes('.png') || file.name.includes('.jpg') || file.name.includes('.jpeg')" src="../../assets/img/png.png" alt="" class="mb-3" style="max-width:75px; display:block; margin:0 auto;">
                        <img v-else src="../../assets/img/pdf.png" alt="" class="mb-3" style="max-width:75px; display:block; margin:0 auto;">
                        <span>{{ file.name }}</span> <br>
                        <span>Fecha de archivo subido: {{ file.date ? file.date.split('T')[0] : 'Hoy' }}</span>
                      </a>
                      <div v-if="showAsSuperAdmin" @click="deleteFile(file, 'ratificacionPago')">
                        <p-button
                        class="mt-2"
                            type="danger"
                            round
                            :disabled="!file"
                        >
                            Eliminar
                        </p-button>
                      </div>
                    </div>
                  </div>
              </div>
            </div>
          </b-card-body>
        </b-collapse>
        <b-alert v-if="successMessage" variant="success" show>{{ successMessage }}</b-alert>
        <b-alert v-if="errorMessage" variant="danger" show>{{ errorMessage }}</b-alert>
        <b-alert v-if="showSuccess" variant="success" show>Caso actualizado correctamente</b-alert>
        <p-button class="mt-4" type="info" round   @click.native.prevent="saveCase">
            Guardar caso
          </p-button>
      </b-card>
    </div>
    
    <b-modal v-model="editEspe" id="bv-modal-example" hide-footer>
      <template #modal-title>
        Editar especialista
      </template>

      <select v-model="espeChange" class="custom-select">
        <option v-for="(espe, index) in especialistas" :key="index" :value="espe.tel">{{ `${espe.nombre} ${espe.apellidos}` }}</option>
      </select>
      <i class="mt-3" style="white-space-collapse: preserve-breaks;">
        *Para poder ver reflejado el cambio de especialista tienes que volver al listado principal del cual viniste.
      </i>
      <p-button class="mt-4" type="info" round @click.native.prevent="updateEspe">
        Aceptar
      </p-button>
      <!-- <formulario-especialista @sendForm="recivedInfo" :client="espeToEdit" /> -->
    </b-modal>
    <b-modal v-model="editEspecialidad" id="bv-modal-example" hide-footer>
      <template #modal-title>
        Editar especialidad
      </template>

      <select v-model="especialidadChange" class="custom-select">
        <option v-for="(espe, index) in especialidades" :key="index" :value="espe.id">{{ espe.nombre }}</option>
      </select>
      <i class="mt-3" style="white-space-collapse: preserve-breaks;">
        *Para poder ver reflejado el cambio de especialista tienes que volver al listado principal del cual viniste.
      </i>
      <p-button class="mt-4" type="info" round @click.native.prevent="updateEspecialidad">
        Aceptar
      </p-button>
      <!-- <formulario-especialista @sendForm="recivedInfo" :client="espeToEdit" /> -->
    </b-modal>
    <b-modal v-model="modalCloseCase" id="bv-modal-example" hide-footer>
      <template #modal-title>
        Finalizar caso
      </template>

      <p>Deseas finalizar el caso</p>
      <p-button class="mt-4" type="info" round @click.native.prevent="closeCase">
        Aceptar
      </p-button>
    </b-modal>
    <b-modal v-model="modalFactura" id="budget-modal" hide-footer>
      <template #modal-title>
        Realizar Factura
      </template>
    </b-modal>
  </card>
</template>
<script>
import { computed, ref, watch } from "vue";
import { comunidades } from '../../data/comunidades';
import { provincias } from '../../data/provincias';
import { db, storage } from '../../firebase'; // Asegúrate de ajustar la ruta según tu estructura de archivos
import { collection, addDoc, getDocs, where, query, doc, updateDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytesResumable, getDownloadURL, listAll, deleteObject, getMetadata, getStorage } from 'firebase/storage';

export default {
  props: {
    caseDetail: {
      type: Object,
    },
    userCase: {
      type: Object,
    },
    user: {
      type: Object,
    },
    isClient: {
      type: Boolean
    }
  },
  setup(props, { emit }) {
    const showSuccess = ref(false);
    const estudio = ref(props.caseDetail.estudio ? props.caseDetail.estudio : {});
    const informe = ref(props.caseDetail.informe ? props.caseDetail.informe : {});
    const ratificacion = ref(props.caseDetail.ratificacion ? props.caseDetail.ratificacion : {});
    // const ratificacionInitial = ref(props.caseDetail.ratificacion ? { ...props.caseDetail.ratificacion } : {});
    const file = ref(null); // Variable para almacenar el archivo seleccionado
    const uploadProgress = ref(null); // Progreso de la subida
    const successMessage = ref(''); // Mensaje de éxito
    const errorMessage = ref(''); // Mensaje de error
    const files = ref([]); // Lista de archivos subidos
    const editEspe = ref(false);
    const editEspecialidad = ref(false);
    const especialistas = ref([])
    const especialidades = ref([])
    const clickedFiles = ref([])
    const espeChange = ref('')
    const especialidadChange = ref('')
    const showSuccessEspe = ref(false)
    const modalCloseCase = ref(false);
    const modalFactura = ref(false);
    const citasCliente = ref([]);

    const userInfo = ref(JSON.parse(localStorage.getItem('userInform')));
    const formatDate = (date) => {
      if (!date) return 'NA';

      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0'); // getMonth() es cero-indexado
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };
    const userData = JSON.parse(localStorage.getItem('userInform'));
    const showAsAdmin = computed(() => {
      return userData.admin && userData.admin === true ? true : false;
      // return userData.routes.some((rout) => rout.visibility === false)
    })

    const showAsSuperAdmin = computed(() => {
      return userData.superAdmin && userData.superAdmin === true ? true : false;
      // return userData.routes.some((rout) => rout.visibility === false)
    })

    const updateCase = (async () => {
      const clienteDocRef = doc(db, 'casos', props.caseDetail.id);
      // console.log(props.caseDetail.id, 'Este es el id')
      // const espeObs = []
      // especialidades.value.forEach((item) => {
      //       if (verEspe.value.includes(item.id)) {
      //     espeObs.push((item));
      //   }
      // })
      await updateDoc(clienteDocRef, {
      // await addDoc(clienteDocRef, {
        // userCreated: true,
        estudioPlazo: estudio.value.plazo ? new Date(estudio.value.plazo).getTime() : null,
        informePlazo: informe.value.plazo ? new Date(informe.value.plazo).getTime() : null,
        ratificacionPlazo: ratificacion.value.plazo ? new Date(ratificacion.value.plazo).getTime() : null,
        ratificacionJuicio: ratificacion.value.fechaJuicio ? new Date(ratificacion.value.fechaJuicio).getTime() : null,
        // ratificacionFechaEncargo: ratificacion.value.fechaEncargo ? new Date(ratificacion.value.fechaEncargo).getTime() : null,
        // ratificacionJuicio: ratificacion.value.fechaJuicio ? new Date(ratificacion.value.fechaJuicio).getTime() : null,
        estudio: estudio.value,
        informe: informe.value,
        ratificacion: ratificacion.value
      });
    })

    const closeCase = (async () => {
      const clienteDocRef = doc(db, 'casos', props.caseDetail.id);
      // console.log(props.caseDetail.id, 'Este es el id')
      // const espeObs = []
      // especialidades.value.forEach((item) => {
      //       if (verEspe.value.includes(item.id)) {
      //     espeObs.push((item));
      //   }
      // })
      await updateDoc(clienteDocRef, {
        status: '4'
      });
      modalCloseCase.value = false;
    })

    const updateEspe = (async () => {
      const clienteDocRef = doc(db, 'casos', props.caseDetail.id);
      // const espeObs = []
      // especialidades.value.forEach((item) => {
      //       if (verEspe.value.includes(item.id)) {
      //     espeObs.push((item));
      //   }
      // })
      await updateDoc(clienteDocRef, {
        // userCreated: true,
        telEspecialista: espeChange.value,
      });
      showSuccessEspe.value = true;
      editEspe.value = false;
      setTimeout(() => {
        showSuccessEspe.value = false;
      }, 4000);
    })

    const updateEspecialidad = (async () => {
      const clienteDocRef = doc(db, 'casos', props.caseDetail.id);
      // const espeObs = []
      // especialidades.value.forEach((item) => {
      //       if (verEspe.value.includes(item.id)) {
      //     espeObs.push((item));
      //   }
      // })
      await updateDoc(clienteDocRef, {
        // userCreated: true,
        especialidad: especialidadChange.value,
      });
      showSuccessEspe.value = true;
      editEspecialidad.value = false;
      setTimeout(() => {
        showSuccessEspe.value = false;
      }, 4000);
    })

    const onFileChange = (event) => {
      file.value = Array.from(event.target.files); // Convertir a array de archivos
      successMessage.value = '';
      uploadProgress.value = null;
      errorMessage.value = '';
    };

    // const onFileChange = (event) => {
    //   file.value = event.target.files[0];
    //   successMessage.value = ''; // Resetea el mensaje de éxito
    //   uploadProgress.value = null; // Resetea el progreso
    //   errorMessage.value = ''; // Resetea el mensaje de error
    // };

    const sendEmail = async () => {
      try {
        // loading.value = true;
        const formData = new FormData();
        const hashUrl = window.location.hash.split('/')[window.location.hash.split('/').length-1]
        // formData.append('to', 'Presupuesto aceptado');
        formData.append('to', 'coordinacionpraxis@informesmedicospericiales.com');
        // formData.append('to', 'alejandromarcosc@gmail.com');
        formData.append('subject', 'Nuevo documento subido');
        formData.append('text', `Nuevo documento subido de praxis <a href="https://alexmc14.github.io/peritomedicotest/#/perfil/${hashUrl}" target="_blank">link al perfil</a>`);
        // for (const file of filePresu.value) {
        //   formData.append('file', file); // Adjuntar todos los archivos
        // }


        await fetch('https://test-perito.onrender.com/send-email', {
          method: 'POST',
          body: formData
        });

        // updateCase(); // Actualizar estado del caso
      } catch (error) {
        console.error('Error al enviar el presupuesto:', error);
        alert('Hubo un error al enviar el presupuesto');
      }
    };

    const sendEmailLaura = async () => {
      try {
        // loading.value = true;
        const formData = new FormData();
        const hashUrl = window.location.hash.split('/')[window.location.hash.split('/').length-1]
        // formData.append('to', 'Presupuesto aceptado');
        formData.append('to', 'lsanchezamo@yahoo.es');
        // formData.append('to', 'alejandromarcosc@gmail.com');
        formData.append('subject', 'Nuevo informe subido');
        formData.append('text', `Nuevo informe subido por ${userInfo.value.nombre} ${userInfo.value.apellidos} al cliente ${props.userCase.nombre} ${props.userCase.apellidos} <a href="https://alexmc14.github.io/peritomedicotest/#/perfil/${hashUrl}" target="_blank">link al perfil</a>`);
        // for (const file of filePresu.value) {
        //   formData.append('file', file); // Adjuntar todos los archivos
        // }


        await fetch('https://test-perito.onrender.com/send-email', {
          method: 'POST',
          body: formData
        });

        // updateCase(); // Actualizar estado del caso
      } catch (error) {
        console.error('Error al enviar el presupuesto:', error);
        alert('Hubo un error al enviar el presupuesto');
      }
    };

    const uploadFile = (tipo) => {
      if (!file.value || file.value.length === 0) {
        errorMessage.value = "Por favor selecciona un archivo.";
        setTimeout(() => {
          errorMessage.value = '';
        }, 2000);
        return;
      }

      const filesToUpload = Array.isArray(file.value) ? file.value : [file.value];
      
      for (const currentFile of filesToUpload) {
        const storageReference = storageRef(storage, `casos/${props.caseDetail.factura}/${tipo}/${currentFile.name}`);
        const uploadTask = uploadBytesResumable(storageReference, currentFile);

        uploadTask.on('state_changed', 
          (snapshot) => {
            // Progreso de subida
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            uploadProgress.value = progress.toFixed(0);
          }, 
          (error) => {
            // Manejo de errores
            errorMessage.value = "Error al subir el archivo: " + error.message;
            setTimeout(() => {
              errorMessage.value = '';
            }, 2000);
          }, 
          () => {
            // Subida completada
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              successMessage.value = "Archivo subido con éxito! URL: " + downloadURL;
              setTimeout(() => {
                successMessage.value = '';
              }, 2000);
              // Agrega el archivo a la lista de archivos
              if (tipo === 'viabilidad') {
                files.value.viabilidad.push({ name: currentFile.name, url: downloadURL, ref: uploadTask.snapshot.ref });
                // files.value.viabilidad = files.value.viabilidad.filter((f) => f.name !== file.name);
              }
              if (tipo === 'informe') {
                files.value.informe.push({ name: currentFile.name, url: downloadURL, ref: uploadTask.snapshot.ref });
                // files.value.informe = files.value.informe.filter((f) => f.name !== file.name);
              }
              if (tipo === 'ratificacion') {
                files.value.ratificacion.push({ name: currentFile.name, url: downloadURL, ref: uploadTask.snapshot.ref });
                // files.value.ratificacion = files.value.ratificacion.filter((f) => f.name !== file.name);
              }

              if (tipo === 'viabilidadPago') {
                files.value.viabilidadPago.push({ name: currentFile.name, url: downloadURL, ref: uploadTask.snapshot.ref });
                // files.value.viabilidad = files.value.viabilidad.filter((f) => f.name !== file.name);
              }
              if (tipo === 'informePago') {
                files.value.informePago.push({ name: currentFile.name, url: downloadURL, ref: uploadTask.snapshot.ref });
                // files.value.informe = files.value.informe.filter((f) => f.name !== file.name);
              }
              if (tipo === 'ratificacionPago') {
                files.value.ratificacionPago.push({ name: currentFile.name, url: downloadURL, ref: uploadTask.snapshot.ref });
                // files.value.ratificacion = files.value.ratificacion.filter((f) => f.name !== file.name);
              }

              if (tipo === 'informeViabilidad') {
                files.value.informeViabilidad.push({ name: currentFile.name, url: downloadURL, ref: uploadTask.snapshot.ref });
                sendEmailLaura();
                // files.value.viabilidad = files.value.viabilidad.filter((f) => f.name !== file.name);
              }
              if (tipo === 'informePericial') {
                files.value.informePericial.push({ name: currentFile.name, url: downloadURL, ref: uploadTask.snapshot.ref });
                sendEmailLaura();
                // files.value.informe = files.value.informe.filter((f) => f.name !== file.name);
              }
              if (tipo === 'informeRatificacion') {
                files.value.informeRatificacion.push({ name: currentFile.name, url: downloadURL, ref: uploadTask.snapshot.ref });
                sendEmailLaura();
                // files.value.ratificacion = files.value.ratificacion.filter((f) => f.name !== file.name);
              }

              if (tipo === 'facturaEspecialista') {
                files.value.facturaEspecialista.push({ name: currentFile.name, url: downloadURL, ref: uploadTask.snapshot.ref });
                // files.value.ratificacion = files.value.ratificacion.filter((f) => f.name !== file.name);
              }

              // files.value.push({ name: file.value.name, url: downloadURL, ref: uploadTask.snapshot.ref });
              file.value = null; // Resetea el archivo después de subirlo
            });
          }
        );
      }
      if (props.caseDetail.especialidadNombre.toLowerCase() === 'praxis' && !tipo.toLowerCase().includes('pago') && !tipo.toLowerCase().includes('facturaEspecialista')) {
        sendEmail();
      }
    };

    const listFiles = async () => {
      const secciones = ['viabilidad', 'informe', 'ratificacion', 'viabilidadPago', 'informePago', 'ratificacionPago', 'informeViabilidad', 'informePericial', 'informeRatificacion', 'facturaEspecialista'];
      let archivos = {};

      // Usamos Promise.all para esperar a que todas las operaciones asíncronas terminen
      await Promise.all(
        secciones.map(async (it) => {
          const listRef = storageRef(storage, `casos/${props.caseDetail.factura}/${it}`);
          // const listRef = storageRef(storage, `casos/${props.caseDetail.factura}`);
          const res = await listAll(listRef);
          // Cargamos los archivos en una sola operación
          archivos[it] = await Promise.all(
            res.items.map(async (item) => {
              const url = await getDownloadURL(item);
              // getFileDate: async (file) => {
                // try {
                  const storage = getStorage();
                  const filePath = url;
                  const fileRef = storageRef(storage, filePath);

                  // Usa await directamente en lugar de then
                  const metadata = await getMetadata(fileRef);
                  // console.log("Fecha de subida:", metadata.timeCreated);
                  // return metadata.timeCreated; // Devuelve la fecha de subida
                // } catch (error) {
                  // console.error("Error obteniendo metadata:", error.code, error.message);
                  // return null; // Manejo del error: Devuelve null o lanza una excepción según lo necesites
                // }
              return { name: item.name, url, ref: item, date: metadata.timeCreated }; // Guardamos la referencia del archivo
            })
          );
        })
      );
      if (archivos.informe.length > 0) archivos.informe = archivos.informe.sort((a, b) => new Date(a.date) - new Date(b.date));
      if (archivos.ratificacion.length > 0) archivos.ratificacion = archivos.ratificacion.sort((a, b) => new Date(a.date) - new Date(b.date));
      if (archivos.viabilidad.length > 0) archivos.viabilidad = archivos.viabilidad.sort((a, b) => new Date(a.date) - new Date(b.date));
      if (archivos.viabilidadPago.length > 0) archivos.viabilidadPago = archivos.viabilidadPago.sort((a, b) => new Date(a.date) - new Date(b.date));
      if (archivos.informePago.length > 0) archivos.informePago = archivos.informePago.sort((a, b) => new Date(a.date) - new Date(b.date));
      if (archivos.ratificacionPago.length > 0) archivos.ratificacionPago = archivos.ratificacionPago.sort((a, b) => new Date(a.date) - new Date(b.date));
      if (archivos.informeViabilidad.length > 0) archivos.informeViabilidad = archivos.informeViabilidad.sort((a, b) => new Date(a.date) - new Date(b.date));
      if (archivos.informePericial.length > 0) archivos.informePericial = archivos.informePericial.sort((a, b) => new Date(a.date) - new Date(b.date));
      if (archivos.informeRatificacion.length > 0) archivos.informeRatificacion = archivos.informeRatificacion.sort((a, b) => new Date(a.date) - new Date(b.date));
      if (archivos.facturaEspecialista.length > 0) archivos.facturaEspecialista = archivos.facturaEspecialista.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // data.informe.sort((a, b) => new Date(a.date) - new Date(b.date));
      files.value = archivos;
      // console.log(files.value)
    };


    // Función para eliminar archivos
    const deleteFile = async (file, type) => {
      const fileRef = file.ref; // Obtiene la referencia del archivo
      try {
        await deleteObject(fileRef);
        // Filtra el archivo eliminado de la lista
        if (type === 'viabilidad') {
          files.value.viabilidad = files.value.viabilidad.filter((f) => f.name !== file.name);
        }
        if (type === 'informe') {
          files.value.informe = files.value.informe.filter((f) => f.name !== file.name);
        }
        if (type === 'ratificacion') {
          files.value.ratificacion = files.value.ratificacion.filter((f) => f.name !== file.name);
        }
        if (type === 'viabilidadPago') {
          files.value.viabilidadPago = files.value.viabilidadPago.filter((f) => f.name !== file.name);
        }
        if (type === 'informePago') {
          files.value.informePago = files.value.informePago.filter((f) => f.name !== file.name);
        }
        if (type === 'ratificacionPago') {
          files.value.ratificacionPago = files.value.ratificacionPago.filter((f) => f.name !== file.name);
        }
        if (type === 'informeViabilidad') {
          files.value.informeViabilidad = files.value.informeViabilidad.filter((f) => f.name !== file.name);
        }
        if (type === 'informePericial') {
          files.value.informePericial = files.value.informePericial.filter((f) => f.name !== file.name);
        }
        if (type === 'informeRatificacion') {
          files.value.informeRatificacion = files.value.informeRatificacion.filter((f) => f.name !== file.name);
        }

        if (type === 'facturaEspecialista') {
          files.value.facturaEspecialista = files.value.facturaEspecialista.filter((f) => f.name !== file.name);
        }

        

        successMessage.value = `Archivo ${file.name} eliminado exitosamente.`;
        setTimeout(() => {
          successMessage.value = '';
        }, 2000);
      } catch (error) {
        console.error("Error al eliminar el archivo:", error);
        errorMessage.value = "Error al eliminar el archivo: " + error.message; // Muestra el error en la interfaz
        setTimeout(() => {
          errorMessage.value = '';
        }, 2000);
      }
    };

    const getEspecialistas = async () => {
      especialistas.value = (await getDocs(collection(db, 'especialistas'))).docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .sort((a, b) => `${a.nombre} ${a.apellidos}`.localeCompare(`${b.nombre} ${b.apellidos}`));
    };

    const getEspecialidades = async () => {
      especialidades.value = (await getDocs(collection(db, 'especialidades'))).docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    };

    const getCitasCliente = async () => {
      if (props.userCase && props.userCase.tel && props.user) {
        console.log('aa', props.userCase)
        console.log('bb', props.user)
        try {
          const q = query(
            collection(db, 'citas'), 
            where('cliente.telCliente', '==', props.isClient ? props.user.tel : props.userCase.tel)
          );
          const querySnapshot = await getDocs(q);
          citasCliente.value = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })).sort((a, b) => new Date(b.fecha) - new Date(a.fecha)); // Ordenar por fecha descendente
        } catch (error) {
          console.error('Error al obtener citas del cliente:', error);
          citasCliente.value = [];
        }
      }
    };

    watch(editEspe, (newValue) => {
      if (editEspe.value === true && especialistas.value.length === 0) {
        getEspecialistas()
      } else if (editEspe.value === true) {
        console.log(especialistas.value)
      }
    });

    watch(editEspecialidad, (newValue) => {

      if (editEspecialidad.value === true && especialidades.value.length === 0) {
        getEspecialidades()
      } else if (editEspecialidad.value === true) {
        console.log(especialidades.value)
      }
    });

    // Llama a la función para listar archivos al cargar el componente
    listFiles();
    getCitasCliente();

    return {
      formatDate,
      comunidades,
      provincias,
      showAsAdmin,
      estudio,
      informe,
      ratificacion,
      showSuccess,
      closeCase,
      modalCloseCase,
      saveCase: (() =>{
        showSuccess.value = true;
        setTimeout(() => {
          showSuccess.value = false;
        }, 2000);
        updateCase();
      }),
      openAllFiles: ((listado) => {
        // listado.forEach(file => {
        //   if (file.url) {
        //     console.log(file);
        //     window.open(file.url, '_blank');
        //   }
        // });
        listado.forEach((file, index) => {
          if (file.url) {
            setTimeout(() => {
              window.open(file.url, '_blank');
            }, index * 500); // Retraso de 500 ms entre cada apertura
          }
        });
      }),
      markAsClicked: (fileName) => {
        console.log(fileName)
        if (!clickedFiles.value.includes(fileName)) {
          clickedFiles.value.push(fileName);
        }
      },
      descargarArchivo: (url, nombreArchivo) => {
        console.log(url)
        const enlace = document.createElement("a");
        enlace.href = url;
        enlace.download = nombreArchivo;
        document.body.appendChild(enlace);
        enlace.click();
        document.body.removeChild(enlace);
      },
      onFileChange,
      uploadFile,
      uploadProgress,
      successMessage,
      errorMessage,
      file,
      files,
      deleteFile,
      editEspe,
      editEspecialidad,
      especialidades,
      especialistas,
      espeChange,
      especialidadChange,
      updateEspe,
      showSuccessEspe,
      updateEspecialidad,
      userInfo,
      showAsSuperAdmin,
      clickedFiles,
      modalFactura,
      citasCliente
    }
  }
};
</script>
<style>
.hAuto{
  height: auto !important;
}
    .custom-file-upload {
            color: #fff;
        background-color: #8bd0db;

    border-color: #17a2b8;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        display: inline-block;
    }

    .custom-file-upload:hover {
        background-color: #8bd0db;
    }

    #file-upload {
        display: none; /* Ocultar el input real */
    }
    .clicked-file {
  color: red !important; /* Cambia el color de los archivos clicados */
  font-weight: bold;
}
</style>

</style>
