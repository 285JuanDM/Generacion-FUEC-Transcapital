-- Empresa de transporte (datos fijos)
CREATE TABLE IF NOT EXISTS empresa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razon_social TEXT NOT NULL,
  nit TEXT NOT NULL,
  direccion TEXT,
  telefono TEXT,
  celular TEXT,
  email TEXT,
  email_secundario TEXT,
  codigo_fuec TEXT NOT NULL, -- Los primeros 9 dígitos fijos: 425049819
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contratos con clientes
CREATE TABLE IF NOT EXISTS contratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_contrato TEXT NOT NULL UNIQUE, -- 0001, 0002, etc.
  nit_contratante TEXT,
  nombre_contratante TEXT NOT NULL,
  responsable TEXT,
  cedula_responsable TEXT,
  telefono TEXT,
  direccion TEXT,
  objeto_contrato TEXT DEFAULT 'TRANSPORTE ESCOLAR',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Empresas en convenio
CREATE TABLE IF NOT EXISTS empresas_convenio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  nit TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehículos
CREATE TABLE IF NOT EXISTS vehiculos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placa TEXT NOT NULL,
  numero_interno TEXT,
  tipo_vehiculo TEXT NOT NULL, -- BUS, BUSETA, MICROBUS, CAMIONETA, STATION WAGON
  marca TEXT,
  modelo TEXT,
  tarjeta_operacion TEXT,
  matricula_municipio TEXT,
  empresa_convenio_id UUID REFERENCES empresas_convenio(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conductores
CREATE TABLE IF NOT EXISTS conductores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_completo TEXT NOT NULL,
  cedula TEXT NOT NULL,
  numero_licencia TEXT,
  vigencia_licencia DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relación vehículo-conductor (conductor asignado por defecto)
CREATE TABLE IF NOT EXISTS vehiculo_conductor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehiculo_id UUID NOT NULL REFERENCES vehiculos(id) ON DELETE CASCADE,
  conductor_id UUID NOT NULL REFERENCES conductores(id) ON DELETE CASCADE,
  es_principal BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FUECs generados
CREATE TABLE IF NOT EXISTS fuecs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_fuec TEXT NOT NULL UNIQUE, -- Número completo: 425049819202600032131
  
  -- Datos del contrato
  contrato_id UUID NOT NULL REFERENCES contratos(id),
  
  -- Fechas del viaje
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  
  -- Descripción del viaje
  origen TEXT NOT NULL,
  destino TEXT NOT NULL,
  objeto_contrato TEXT,
  
  -- Convenio (si aplica)
  es_convenio BOOLEAN DEFAULT FALSE,
  es_consorcio BOOLEAN DEFAULT FALSE,
  es_union_temporal BOOLEAN DEFAULT FALSE,
  empresa_convenio_id UUID REFERENCES empresas_convenio(id),
  
  -- Vehículo
  vehiculo_id UUID NOT NULL REFERENCES vehiculos(id),
  
  -- Conductores (hasta 3)
  conductor1_id UUID REFERENCES conductores(id),
  conductor2_id UUID REFERENCES conductores(id),
  conductor3_id UUID REFERENCES conductores(id),
  
  -- Metadata
  numero_consecutivo INTEGER NOT NULL, -- Contador interno de FUECs generados
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contador de FUECs por año
CREATE TABLE IF NOT EXISTS fuec_contador (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL UNIQUE,
  ultimo_consecutivo INTEGER DEFAULT 0
);

-- Crear índices para búsquedas
CREATE INDEX IF NOT EXISTS idx_vehiculos_placa ON vehiculos(placa);
CREATE INDEX IF NOT EXISTS idx_conductores_cedula ON conductores(cedula);
CREATE INDEX IF NOT EXISTS idx_contratos_numero ON contratos(numero_contrato);
CREATE INDEX IF NOT EXISTS idx_fuecs_numero ON fuecs(numero_fuec);
CREATE INDEX IF NOT EXISTS idx_fuecs_created ON fuecs(created_at DESC);
