"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ArrowRight, Calendar, MapPin, FileText } from "lucide-react"
import type { FuecFormData } from "@/lib/types"

interface StepViajeProps {
  formData: FuecFormData
  onUpdate: (data: Partial<FuecFormData>) => void
  onNext: () => void
  onBack: () => void
}

export function StepViaje({ formData, onUpdate, onNext, onBack }: StepViajeProps) {
  const isValid = formData.fecha_inicio && formData.fecha_fin && formData.origen && formData.destino

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Información del Viaje</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Define las fechas de vigencia y la descripción del viaje
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Vigencia del Contrato
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha_inicio">Fecha Inicial</Label>
              <Input
                id="fecha_inicio"
                type="date"
                value={formData.fecha_inicio}
                onChange={(e) => onUpdate({ fecha_inicio: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha_fin">Fecha de Vencimiento</Label>
              <Input
                id="fecha_fin"
                type="date"
                value={formData.fecha_fin}
                onChange={(e) => onUpdate({ fecha_fin: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Origen y Destino
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="origen_destino">Descripción del trayecto</Label>
            <Textarea
              id="origen_destino"
              placeholder="Ej: BOGOTÁ - CAJICA - CHÍA - COTA - ZIPAQUIRÁ Y SUS ALREDEDORES AL COLEGIO LICEO DE COLOMBIA Y VICEVERSA (Lunes a sábado)"
              value={formData.origen ? `${formData.origen}${formData.destino ? ` - ${formData.destino}` : ''}` : ''}
              onChange={(e) => {
                const value = e.target.value
                const parts = value.split(' - ')
                onUpdate({ 
                  origen: parts[0] || '',
                  destino: parts.slice(1).join(' - ') || ''
                })
              }}
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              Describe el origen, destino y las características del servicio
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Objeto del Contrato
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="objeto_contrato">Tipo de servicio</Label>
            <Input
              id="objeto_contrato"
              placeholder="TRANSPORTE ESCOLAR"
              value={formData.objeto_contrato}
              onChange={(e) => onUpdate({ objeto_contrato: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} size="lg">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Atrás
        </Button>
        <Button onClick={onNext} disabled={!isValid} size="lg">
          Continuar
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
