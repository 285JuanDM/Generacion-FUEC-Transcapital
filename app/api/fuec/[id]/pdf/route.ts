import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { jsPDF } from 'jspdf'

interface FuecData {
  id: string
  numero_fuec: string
  fecha_inicio: string
  fecha_fin: string
  origen: string
  destino: string
  objeto_contrato: string
  es_convenio: boolean
  es_consorcio: boolean
  es_union_temporal: boolean
  contrato: {
    numero_contrato: string
    nombre_contratante: string
    nit_contratante: string | null
    responsable: string | null
    cedula_responsable: string | null
    telefono: string | null
    direccion: string | null
  }
  vehiculo: {
    placa: string
    numero_interno: string | null
    tipo_vehiculo: string
    marca: string | null
    modelo: string | null
    tarjeta_operacion: string | null
  }
  conductor1: {
    nombre_completo: string
    cedula: string
    numero_licencia: string | null
    vigencia_licencia: string | null
  } | null
  conductor2: {
    nombre_completo: string
    cedula: string
    numero_licencia: string | null
    vigencia_licencia: string | null
  } | null
  conductor3: {
    nombre_completo: string
    cedula: string
    numero_licencia: string | null
    vigencia_licencia: string | null
  } | null
  empresa_convenio: {
    nombre: string
  } | null
}

interface Empresa {
  razon_social: string
  nit: string
  direccion: string
  telefono: string
  celular: string
  email: string
  email_secundario: string
}

function formatDate(dateStr: string): { day: string; month: string; year: string } {
  const date = new Date(dateStr + 'T00:00:00')
  return {
    day: date.getDate().toString(),
    month: (date.getMonth() + 1).toString(),
    year: date.getFullYear().toString(),
  }
}

function formatDateFull(dateStr: string | null): string {
  if (!dateStr) return ''
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatCedula(cedula: string): string {
  return cedula.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get FUEC with all related data
    const { data: fuec, error: fuecError } = await supabase
      .from('fuecs')
      .select(`
        *,
        contrato:contratos(*),
        vehiculo:vehiculos(*),
        conductor1:conductores!fuecs_conductor1_id_fkey(*),
        conductor2:conductores!fuecs_conductor2_id_fkey(*),
        conductor3:conductores!fuecs_conductor3_id_fkey(*),
        empresa_convenio:empresas_convenio(*)
      `)
      .eq('id', id)
      .single()

    if (fuecError || !fuec) {
      return NextResponse.json({ error: 'FUEC no encontrado' }, { status: 404 })
    }

    // Get company data
    const { data: empresa } = await supabase
      .from('empresa')
      .select('*')
      .single()

    if (!empresa) {
      return NextResponse.json({ error: 'Empresa no configurada' }, { status: 500 })
    }

    // Generate PDF
    const pdf = generateFuecPdf(fuec as FuecData, empresa as Empresa)
    
    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="FUEC-${fuec.numero_fuec}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ error: 'Error al generar el PDF' }, { status: 500 })
  }
}

function generateFuecPdf(fuec: FuecData, empresa: Empresa): Buffer {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 15
  const contentWidth = pageWidth - (margin * 2)
  let y = margin

  // Helper functions
  const drawCell = (x: number, yPos: number, width: number, height: number, text: string, options: {
    align?: 'left' | 'center' | 'right'
    bold?: boolean
    fontSize?: number
    fill?: boolean
    fillColor?: [number, number, number]
  } = {}) => {
    const { align = 'left', bold = false, fontSize = 9, fill = false, fillColor = [240, 240, 240] } = options
    
    if (fill) {
      doc.setFillColor(...fillColor)
      doc.rect(x, yPos, width, height, 'F')
    }
    doc.rect(x, yPos, width, height, 'S')
    
    doc.setFontSize(fontSize)
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    
    let textX = x + 2
    if (align === 'center') textX = x + width / 2
    if (align === 'right') textX = x + width - 2
    
    doc.text(text, textX, yPos + height / 2 + 2, { align })
  }

  const drawLabelValue = (x: number, yPos: number, labelWidth: number, valueWidth: number, height: number, label: string, value: string) => {
    drawCell(x, yPos, labelWidth, height, label, { bold: true, fontSize: 8, fill: true })
    drawCell(x + labelWidth, yPos, valueWidth, height, value, { fontSize: 9 })
  }

  // Title - FUEC Number
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(`No. ${fuec.numero_fuec}`, pageWidth / 2, y, { align: 'center' })
  y += 8

  // Company Info
  const rowHeight = 7
  const labelWidth = 35
  const valueWidth = contentWidth - labelWidth

  drawLabelValue(margin, y, labelWidth, valueWidth, rowHeight, 'RAZÓN SOCIAL', empresa.razon_social)
  y += rowHeight

  drawLabelValue(margin, y, labelWidth, valueWidth, rowHeight, 'NIT:', empresa.nit)
  y += rowHeight

  drawLabelValue(margin, y, labelWidth, valueWidth, rowHeight, 'CONTRATO No:', fuec.contrato.numero_contrato)
  y += rowHeight

  drawLabelValue(margin, y, labelWidth, valueWidth, rowHeight, 'CONTRATANTE:', fuec.contrato.nombre_contratante)
  y += rowHeight

  drawLabelValue(margin, y, labelWidth, valueWidth, rowHeight, 'NIT/CC No:', fuec.contrato.nit_contratante || '-')
  y += rowHeight

  // Objeto del Contrato
  drawCell(margin, y, labelWidth, rowHeight * 2, 'OBJETO DEL CONTRATO:', { bold: true, fontSize: 8, fill: true })
  drawCell(margin + labelWidth, y, valueWidth, rowHeight * 2, fuec.objeto_contrato || 'TRANSPORTE ESCOLAR', { align: 'center', fontSize: 10, bold: true })
  y += rowHeight * 2

  // Origen - Destino
  const origenDestino = `SERVICIO DE TRANSPORTE ESPECIAL DE DOCENTES, ALUMNOS, PERSONAL DE SERVICIOS GENERALES Y PERSONAL AUTORIZADO DEL COLEGIO CON ORIGEN - ${fuec.origen} - ${fuec.destino}`
  drawCell(margin, y, labelWidth, rowHeight * 3, 'ORIGEN - DESTINO:', { bold: true, fontSize: 8, fill: true })
  
  doc.rect(margin + labelWidth, y, valueWidth, rowHeight * 3, 'S')
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  const splitText = doc.splitTextToSize(origenDestino, valueWidth - 4)
  doc.text(splitText, margin + labelWidth + 2, y + 5)
  y += rowHeight * 3

  // Convenio Section
  const convenioWidth = contentWidth / 4
  drawCell(margin, y, convenioWidth, rowHeight, 'CONVENIO: ' + (fuec.es_convenio ? 'X' : ''), { fontSize: 8 })
  drawCell(margin + convenioWidth, y, convenioWidth, rowHeight, 'CONSORCIO: ' + (fuec.es_consorcio ? 'X' : ''), { fontSize: 8 })
  drawCell(margin + convenioWidth * 2, y, convenioWidth, rowHeight, 'UNIÓN TEMPORAL: ' + (fuec.es_union_temporal ? 'X' : ''), { fontSize: 8 })
  drawCell(margin + convenioWidth * 3, y, convenioWidth, rowHeight, 'CON: ' + (fuec.empresa_convenio?.nombre || ''), { fontSize: 8 })
  y += rowHeight

  // Vigencia del Contrato Header
  drawCell(margin, y, contentWidth, rowHeight, 'VIGENCIA DEL CONTRATO', { align: 'center', bold: true, fontSize: 10, fill: true })
  y += rowHeight

  // Fechas
  const fechaInicio = formatDate(fuec.fecha_inicio)
  const fechaFin = formatDate(fuec.fecha_fin)
  const dateColWidth = (contentWidth - 40) / 3

  drawCell(margin, y, 40, rowHeight, 'FECHA INICIAL', { bold: true, fontSize: 8, fill: true })
  drawCell(margin + 40, y, dateColWidth, rowHeight, fechaInicio.day, { align: 'center' })
  drawCell(margin + 40 + dateColWidth, y, dateColWidth, rowHeight, fechaInicio.month, { align: 'center' })
  drawCell(margin + 40 + dateColWidth * 2, y, dateColWidth, rowHeight, fechaInicio.year, { align: 'center' })
  y += rowHeight

  drawCell(margin, y, 40, rowHeight, 'FECHA DE VENCIMIENTO', { bold: true, fontSize: 8, fill: true })
  drawCell(margin + 40, y, dateColWidth, rowHeight, fechaFin.day, { align: 'center' })
  drawCell(margin + 40 + dateColWidth, y, dateColWidth, rowHeight, fechaFin.month, { align: 'center' })
  drawCell(margin + 40 + dateColWidth * 2, y, dateColWidth, rowHeight, fechaFin.year, { align: 'center' })
  y += rowHeight

  // Características del Vehículo Header
  drawCell(margin, y, contentWidth, rowHeight, 'CARACTERÍSTICAS DEL VEHÍCULO', { align: 'center', bold: true, fontSize: 10, fill: true })
  y += rowHeight

  // Vehicle headers
  const vehColWidth = contentWidth / 4
  drawCell(margin, y, vehColWidth, rowHeight, 'PLACA', { align: 'center', bold: true, fontSize: 8, fill: true })
  drawCell(margin + vehColWidth, y, vehColWidth, rowHeight, 'MODELO', { align: 'center', bold: true, fontSize: 8, fill: true })
  drawCell(margin + vehColWidth * 2, y, vehColWidth, rowHeight, 'MARCA', { align: 'center', bold: true, fontSize: 8, fill: true })
  drawCell(margin + vehColWidth * 3, y, vehColWidth, rowHeight, 'CLASE', { align: 'center', bold: true, fontSize: 8, fill: true })
  y += rowHeight

  // Vehicle values
  drawCell(margin, y, vehColWidth, rowHeight, fuec.vehiculo.placa, { align: 'center' })
  drawCell(margin + vehColWidth, y, vehColWidth, rowHeight, fuec.vehiculo.modelo || '', { align: 'center' })
  drawCell(margin + vehColWidth * 2, y, vehColWidth, rowHeight, fuec.vehiculo.marca || '', { align: 'center' })
  drawCell(margin + vehColWidth * 3, y, vehColWidth, rowHeight, fuec.vehiculo.tipo_vehiculo, { align: 'center' })
  y += rowHeight

  // Número interno y tarjeta de operación
  const halfWidth = contentWidth / 2
  drawCell(margin, y, halfWidth, rowHeight, 'NÚMERO INTERNO', { align: 'center', bold: true, fontSize: 8, fill: true })
  drawCell(margin + halfWidth, y, halfWidth, rowHeight, 'NUMERO TARJETA DE OPERACIÓN', { align: 'center', bold: true, fontSize: 8, fill: true })
  y += rowHeight

  drawCell(margin, y, halfWidth, rowHeight, fuec.vehiculo.numero_interno || '', { align: 'center' })
  drawCell(margin + halfWidth, y, halfWidth, rowHeight, fuec.vehiculo.tarjeta_operacion || '', { align: 'center' })
  y += rowHeight

  // Conductores Header
  const condColWidths = [25, 45, 35, 40, 35]
  drawCell(margin, y, condColWidths[0], rowHeight, 'DATOS', { align: 'center', bold: true, fontSize: 8, fill: true })
  drawCell(margin + condColWidths[0], y, condColWidths[1], rowHeight, 'NOMBRES Y APELLIDOS', { align: 'center', bold: true, fontSize: 8, fill: true })
  drawCell(margin + condColWidths[0] + condColWidths[1], y, condColWidths[2], rowHeight, 'CEDULA', { align: 'center', bold: true, fontSize: 8, fill: true })
  drawCell(margin + condColWidths[0] + condColWidths[1] + condColWidths[2], y, condColWidths[3], rowHeight, 'No DE LICENCIA DE CONDUCCIÓN', { align: 'center', bold: true, fontSize: 7, fill: true })
  drawCell(margin + condColWidths[0] + condColWidths[1] + condColWidths[2] + condColWidths[3], y, condColWidths[4], rowHeight, 'VIGENCIA', { align: 'center', bold: true, fontSize: 8, fill: true })
  y += rowHeight

  // Conductor 1
  const c1 = fuec.conductor1
  let xPos = margin
  drawCell(xPos, y, condColWidths[0], rowHeight, 'CONDUCTOR 1', { bold: true, fontSize: 7, fill: true })
  xPos += condColWidths[0]
  drawCell(xPos, y, condColWidths[1], rowHeight, c1?.nombre_completo || '', { fontSize: 8 })
  xPos += condColWidths[1]
  drawCell(xPos, y, condColWidths[2], rowHeight, c1 ? formatCedula(c1.cedula) : '', { align: 'center', fontSize: 8 })
  xPos += condColWidths[2]
  drawCell(xPos, y, condColWidths[3], rowHeight, c1 ? formatCedula(c1.numero_licencia || c1.cedula) : '', { align: 'center', fontSize: 8 })
  xPos += condColWidths[3]
  drawCell(xPos, y, condColWidths[4], rowHeight, formatDateFull(c1?.vigencia_licencia || null), { align: 'center', fontSize: 8 })
  y += rowHeight

  // Conductor 2
  const c2 = fuec.conductor2
  xPos = margin
  drawCell(xPos, y, condColWidths[0], rowHeight, 'CONDUCTOR 2', { bold: true, fontSize: 7, fill: true })
  xPos += condColWidths[0]
  drawCell(xPos, y, condColWidths[1], rowHeight, c2?.nombre_completo || '', { fontSize: 8 })
  xPos += condColWidths[1]
  drawCell(xPos, y, condColWidths[2], rowHeight, c2 ? formatCedula(c2.cedula) : '', { align: 'center', fontSize: 8 })
  xPos += condColWidths[2]
  drawCell(xPos, y, condColWidths[3], rowHeight, c2 ? formatCedula(c2.numero_licencia || c2.cedula) : '', { align: 'center', fontSize: 8 })
  xPos += condColWidths[3]
  drawCell(xPos, y, condColWidths[4], rowHeight, formatDateFull(c2?.vigencia_licencia || null), { align: 'center', fontSize: 8 })
  y += rowHeight

  // Conductor 3
  const c3 = fuec.conductor3
  xPos = margin
  drawCell(xPos, y, condColWidths[0], rowHeight, 'CONDUCTOR 3', { bold: true, fontSize: 7, fill: true })
  xPos += condColWidths[0]
  drawCell(xPos, y, condColWidths[1], rowHeight, c3?.nombre_completo || '', { fontSize: 8 })
  xPos += condColWidths[1]
  drawCell(xPos, y, condColWidths[2], rowHeight, c3 ? formatCedula(c3.cedula) : '', { align: 'center', fontSize: 8 })
  xPos += condColWidths[2]
  drawCell(xPos, y, condColWidths[3], rowHeight, c3 ? formatCedula(c3.numero_licencia || c3.cedula) : '', { align: 'center', fontSize: 8 })
  xPos += condColWidths[3]
  drawCell(xPos, y, condColWidths[4], rowHeight, formatDateFull(c3?.vigencia_licencia || null), { align: 'center', fontSize: 8 })
  y += rowHeight

  // Responsable Contratante
  const respColWidths = [35, 40, 35, 30, 40]
  drawCell(margin, y, respColWidths[0], rowHeight * 2, 'RESPONSABLE CONTRATANTE', { bold: true, fontSize: 7, fill: true })
  drawCell(margin + respColWidths[0], y, respColWidths[1], rowHeight * 2, fuec.contrato.responsable || '', { fontSize: 8 })
  
  // Header row for responsable details
  let respX = margin + respColWidths[0] + respColWidths[1]
  drawCell(respX, y, respColWidths[2], rowHeight, 'NUMERO DE CEDULA', { align: 'center', bold: true, fontSize: 7, fill: true })
  respX += respColWidths[2]
  drawCell(respX, y, respColWidths[3], rowHeight, 'TELÉFONO', { align: 'center', bold: true, fontSize: 7, fill: true })
  respX += respColWidths[3]
  drawCell(respX, y, respColWidths[4], rowHeight, 'DIRECCION', { align: 'center', bold: true, fontSize: 7, fill: true })
  y += rowHeight

  // Values for responsable
  respX = margin + respColWidths[0] + respColWidths[1]
  drawCell(respX, y, respColWidths[2], rowHeight, fuec.contrato.cedula_responsable || '', { align: 'center', fontSize: 8 })
  respX += respColWidths[2]
  drawCell(respX, y, respColWidths[3], rowHeight, fuec.contrato.telefono || '', { align: 'center', fontSize: 8 })
  respX += respColWidths[3]
  
  // Direccion might need wrapping
  doc.rect(respX, y, respColWidths[4], rowHeight, 'S')
  doc.setFontSize(6)
  const dirText = doc.splitTextToSize(fuec.contrato.direccion || '', respColWidths[4] - 2)
  doc.text(dirText, respX + 1, y + 3)
  y += rowHeight + 5

  // Footer with company info
  doc.setFillColor(30, 30, 30)
  doc.rect(margin, y, contentWidth, 25, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text(empresa.direccion, margin + 5, y + 5)
  doc.setFont('helvetica', 'normal')
  doc.text(`Tel: ${empresa.telefono}   Cel: ${empresa.celular}`, margin + 5, y + 10)
  doc.setTextColor(100, 180, 255)
  doc.text(empresa.email, margin + 5, y + 15)
  doc.text(empresa.email_secundario, margin + 5, y + 20)

  // Company name and NIT on the right
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('TRANS CAPITAL S.A.S', pageWidth - margin - 5, y + 10, { align: 'right' })
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('CIUDAD EN MOVIMIENTO', pageWidth - margin - 5, y + 15, { align: 'right' })
  doc.text(`NIT. ${empresa.nit}`, pageWidth - margin - 5, y + 20, { align: 'right' })

  doc.setTextColor(0, 0, 0)

  return Buffer.from(doc.output('arraybuffer'))
}
