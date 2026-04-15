"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Building2, Calendar, Car, Users, Loader2 } from "lucide-react"
import type { FuecFormData, Empresa } from "@/lib/types"

interface StepResumenProps {
  formData: FuecFormData
  empresa: Empresa | null
  onBack: () => void
  onSubmit: () => void
  isSubmitting: boolean
}

export function StepResumen({ formData, empresa, onBack, onSubmit, isSubmitting }: StepResumenProps) {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Resumen del FUEC</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Verifica la información antes de generar el documento
        </p>
      </div>

      {/* Empresa */}
      {empresa && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Empresa de Transporte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="font-semibold text-lg">{empresa.razon_social}</p>
              <p className="text-sm text-muted-foreground">NIT: {empresa.nit}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contrato */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Datos del Contrato
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground text-xs">Contrato No.</Label>
              <p className="font-medium">{formData.contrato?.numero_contrato}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Contratante</Label>
              <p className="font-medium">{formData.contrato?.nombre_contratante}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">NIT</Label>
              <p className="font-medium">{formData.contrato?.nit_contratante || '-'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Objeto</Label>
              <p className="font-medium">{formData.objeto_contrato}</p>
            </div>
            {formData.contrato?.responsable && (
              <>
                <div>
                  <Label className="text-muted-foreground text-xs">Responsable</Label>
                  <p className="font-medium">{formData.contrato.responsable}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Cédula Responsable</Label>
                  <p className="font-medium">{formData.contrato.cedula_responsable}</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Viaje */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Vigencia y Trayecto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground text-xs">Fecha Inicial</Label>
              <p className="font-medium">{formatDate(formData.fecha_inicio)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Fecha Vencimiento</Label>
              <p className="font-medium">{formatDate(formData.fecha_fin)}</p>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-muted-foreground text-xs">Origen - Destino</Label>
              <p className="font-medium">{formData.origen} - {formData.destino}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehículo */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
            <Car className="h-4 w-4" />
            Vehículo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground text-xs">Placa</Label>
              <p className="font-medium">{formData.vehiculo?.placa}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Marca</Label>
              <p className="font-medium">{formData.vehiculo?.marca}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Modelo</Label>
              <p className="font-medium">{formData.vehiculo?.modelo}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Clase</Label>
              <p className="font-medium">{formData.vehiculo?.tipo_vehiculo}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">No. Interno</Label>
              <p className="font-medium">{formData.vehiculo?.numero_interno}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Tarjeta Operación</Label>
              <p className="font-medium">{formData.vehiculo?.tarjeta_operacion || '-'}</p>
            </div>
          </div>

          {formData.es_convenio && formData.empresa_convenio && (
            <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-800">
                <strong>Convenio con:</strong> {formData.empresa_convenio.nombre}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conductores */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
            <Users className="h-4 w-4" />
            Conductor(es)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {formData.conductor1 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm p-3 rounded-lg bg-muted/50">
                <div>
                  <Label className="text-muted-foreground text-xs">Conductor 1</Label>
                  <p className="font-medium">{formData.conductor1.nombre_completo}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Cédula</Label>
                  <p className="font-medium">{formData.conductor1.cedula}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">No. Licencia</Label>
                  <p className="font-medium">{formData.conductor1.numero_licencia}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Vigencia</Label>
                  <p className="font-medium">{formatDate(formData.conductor1.vigencia_licencia || '')}</p>
                </div>
              </div>
            )}

            {formData.conductor2 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm p-3 rounded-lg bg-muted/50">
                <div>
                  <Label className="text-muted-foreground text-xs">Conductor 2</Label>
                  <p className="font-medium">{formData.conductor2.nombre_completo}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Cédula</Label>
                  <p className="font-medium">{formData.conductor2.cedula}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">No. Licencia</Label>
                  <p className="font-medium">{formData.conductor2.numero_licencia}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Vigencia</Label>
                  <p className="font-medium">{formatDate(formData.conductor2.vigencia_licencia || '')}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} size="lg" disabled={isSubmitting}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Atrás
        </Button>
        <Button onClick={onSubmit} size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generando...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Generar FUEC
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
