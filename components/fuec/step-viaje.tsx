"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { FuecFormData } from "@/lib/types"

interface StepViajeProps {
  formData: FuecFormData
  onUpdate: (data: Partial<FuecFormData>) => void
  onNext: () => void
  onBack: () => void
}

export function StepViaje({ formData, onUpdate, onNext, onBack }: StepViajeProps) {
  const isValid = formData.fecha_inicio && formData.fecha_fin && formData.origen

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Viaje</h3>
        <p className="text-sm text-muted-foreground">
          Define las fechas y descripción del viaje
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fecha_inicio">Fecha inicial</Label>
            <Input
              id="fecha_inicio"
              type="date"
              value={formData.fecha_inicio}
              onChange={(e) => onUpdate({ fecha_inicio: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fecha_fin">Fecha de vencimiento</Label>
            <Input
              id="fecha_fin"
              type="date"
              value={formData.fecha_fin}
              onChange={(e) => onUpdate({ fecha_fin: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="descripcion">Descripción del trayecto (Origen - Destino)</Label>
          <Textarea
            id="descripcion"
            placeholder="Ej: SERVICIO DE TRANSPORTE ESPECIAL DE DOCENTES, ALUMNOS, PERSONAL DE SERVICIOS GENERALES Y PERSONAL AUTORIZADO DEL COLEGIO CON ORIGEN - BOGOTÁ -CAJICA CHÍA- COTA- ZIPAQUIRÁ Y SUS ALREDEDORES AL COLEGIO LICEO DE COLOMBIA Y VICEVERSA (Lunes a sábado)"
            value={formData.origen}
            onChange={(e) => onUpdate({ origen: e.target.value, destino: '' })}
            className="min-h-[100px] resize-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Atrás
        </Button>
        <Button onClick={onNext} disabled={!isValid} className="gap-2">
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
