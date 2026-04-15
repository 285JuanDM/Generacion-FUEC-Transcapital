import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = await createClient()

    // Get the company data
    const { data: empresa, error: empresaError } = await supabase
      .from('empresa')
      .select('*')
      .single()

    if (empresaError || !empresa) {
      return NextResponse.json({ error: 'No se encontró la empresa' }, { status: 500 })
    }

    // Get the current year
    const currentYear = new Date().getFullYear()

    // Get or create the counter for this year
    let { data: contador, error: contadorError } = await supabase
      .from('fuec_contador')
      .select('*')
      .eq('year', currentYear)
      .single()

    if (contadorError || !contador) {
      // Create counter for this year
      const { data: newContador, error: createError } = await supabase
        .from('fuec_contador')
        .insert({ year: currentYear, ultimo_consecutivo: 0 })
        .select()
        .single()

      if (createError) {
        return NextResponse.json({ error: 'Error al crear contador' }, { status: 500 })
      }
      contador = newContador
    }

    // Increment the counter
    const nuevoConsecutivo = (contador.ultimo_consecutivo || 0) + 1

    // Update the counter
    await supabase
      .from('fuec_contador')
      .update({ ultimo_consecutivo: nuevoConsecutivo })
      .eq('year', currentYear)

    // Get contract number for the FUEC number
    const { data: contrato } = await supabase
      .from('contratos')
      .select('numero_contrato')
      .eq('id', body.contrato_id)
      .single()

    // Generate FUEC number
    // Format: [codigo_fuec (9 digits)][año (4 digits)][numero_contrato (4 digits)][consecutivo (4 digits)]
    const codigoFuec = empresa.codigo_fuec.padStart(9, '0')
    const yearStr = currentYear.toString()
    const contratoNum = (contrato?.numero_contrato || '0001').padStart(4, '0')
    const consecutivoStr = nuevoConsecutivo.toString().padStart(4, '0')
    
    const numeroFuec = `${codigoFuec}${yearStr}${contratoNum}${consecutivoStr}`

    // Create the FUEC record
    const { data: fuec, error: fuecError } = await supabase
      .from('fuecs')
      .insert({
        numero_fuec: numeroFuec,
        contrato_id: body.contrato_id,
        fecha_inicio: body.fecha_inicio,
        fecha_fin: body.fecha_fin,
        origen: body.origen,
        destino: body.destino,
        objeto_contrato: body.objeto_contrato,
        es_convenio: body.es_convenio || false,
        es_consorcio: body.es_consorcio || false,
        es_union_temporal: body.es_union_temporal || false,
        empresa_convenio_id: body.empresa_convenio_id || null,
        vehiculo_id: body.vehiculo_id,
        conductor1_id: body.conductor1_id || null,
        conductor2_id: body.conductor2_id || null,
        conductor3_id: body.conductor3_id || null,
        numero_consecutivo: nuevoConsecutivo,
      })
      .select()
      .single()

    if (fuecError) {
      console.error('Error creating FUEC:', fuecError)
      return NextResponse.json({ error: 'Error al crear el FUEC' }, { status: 500 })
    }

    // Generate PDF URL (we'll create this endpoint next)
    const pdfUrl = `/api/fuec/${fuec.id}/pdf`

    // Update with PDF URL
    await supabase
      .from('fuecs')
      .update({ pdf_url: pdfUrl })
      .eq('id', fuec.id)

    return NextResponse.json({
      id: fuec.id,
      numero_fuec: numeroFuec,
      pdf_url: pdfUrl,
    })
  } catch (error) {
    console.error('Error in FUEC creation:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
