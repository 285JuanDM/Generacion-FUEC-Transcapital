export interface Empresa {
  id: string
  razon_social: string
  nit: string
  direccion: string
  telefono: string
  celular: string
  email: string
  email_secundario: string
  codigo_fuec: string
}

export interface Contrato {
  id: string
  numero_contrato: string
  nit_contratante: string | null
  nombre_contratante: string
  responsable: string | null
  cedula_responsable: string | null
  telefono: string | null
  direccion: string | null
  objeto_contrato: string
}

export interface EmpresaConvenio {
  id: string
  nombre: string
  nit: string | null
}

export interface Vehiculo {
  id: string
  placa: string
  numero_interno: string | null
  tipo_vehiculo: string
  marca: string | null
  modelo: string | null
  tarjeta_operacion: string | null
  matricula_municipio: string | null
  empresa_convenio_id: string | null
  empresa_convenio?: EmpresaConvenio | null
}

export interface Conductor {
  id: string
  nombre_completo: string
  cedula: string
  numero_licencia: string | null
  vigencia_licencia: string | null
}

export interface VehiculoConductor {
  id: string
  vehiculo_id: string
  conductor_id: string
  es_principal: boolean
  conductor?: Conductor
}

export interface Fuec {
  id: string
  numero_fuec: string
  contrato_id: string
  fecha_inicio: string
  fecha_fin: string
  origen: string
  destino: string
  objeto_contrato: string | null
  es_convenio: boolean
  es_consorcio: boolean
  es_union_temporal: boolean
  empresa_convenio_id: string | null
  vehiculo_id: string
  conductor1_id: string | null
  conductor2_id: string | null
  conductor3_id: string | null
  numero_consecutivo: number
  pdf_url: string | null
  created_at: string
  contrato?: Contrato
  vehiculo?: Vehiculo
  conductor1?: Conductor
  conductor2?: Conductor
  conductor3?: Conductor
  empresa_convenio?: EmpresaConvenio
}

export interface FuecFormData {
  // Step 1: Contrato
  contrato_id: string
  contrato?: Contrato
  
  // Step 2: Viaje
  fecha_inicio: string
  fecha_fin: string
  origen: string
  destino: string
  objeto_contrato: string
  
  // Step 3: Vehículo y Conductor
  vehiculo_id: string
  vehiculo?: Vehiculo
  conductor1_id: string
  conductor1?: Conductor
  conductor2_id?: string
  conductor2?: Conductor
  conductor3_id?: string
  conductor3?: Conductor
  es_convenio: boolean
  es_consorcio: boolean
  es_union_temporal: boolean
  empresa_convenio_id?: string
  empresa_convenio?: EmpresaConvenio
}
