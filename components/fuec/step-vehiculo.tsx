"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ArrowRight, Car, Users, Search, Building, UserPlus } from "lucide-react"
import type { Vehiculo, Conductor, EmpresaConvenio, FuecFormData, VehiculoConductor } from "@/lib/types"

interface StepVehiculoProps {
  vehiculos: Vehiculo[]
  conductores: Conductor[]
  empresasConvenio: EmpresaConvenio[]
  vehiculoConductores: VehiculoConductor[]
  formData: FuecFormData
  onUpdate: (data: Partial<FuecFormData>) => void
  onNext: () => void
  onBack: () => void
}

export function StepVehiculo({ 
  vehiculos, 
  conductores, 
  empresasConvenio, 
  vehiculoConductores,
  formData, 
  onUpdate, 
  onNext, 
  onBack 
}: StepVehiculoProps) {
  const [searchPlaca, setSearchPlaca] = useState("")
  const [showConductorChange, setShowConductorChange] = useState(false)
  
  const filteredVehiculos = useMemo(() => {
    if (!searchPlaca) return vehiculos
    const term = searchPlaca.toLowerCase()
    return vehiculos.filter(v => 
      v.placa.toLowerCase().includes(term) ||
      v.numero_interno?.toLowerCase().includes(term) ||
      v.marca?.toLowerCase().includes(term)
    )
  }, [vehiculos, searchPlaca])

  const selectedVehiculo = vehiculos.find(v => v.id === formData.vehiculo_id)
  
  // Get default conductor for selected vehicle
  const defaultConductor = useMemo(() => {
    if (!formData.vehiculo_id) return null
    const relation = vehiculoConductores.find(
      vc => vc.vehiculo_id === formData.vehiculo_id && vc.es_principal
    )
    return relation ? conductores.find(c => c.id === relation.conductor_id) : null
  }, [formData.vehiculo_id, vehiculoConductores, conductores])

  // Auto-assign conductor when vehicle is selected
  useEffect(() => {
    if (defaultConductor && !showConductorChange) {
      onUpdate({ conductor1_id: defaultConductor.id, conductor1: defaultConductor })
    }
  }, [defaultConductor, showConductorChange])

  const handleVehiculoSelect = (vehiculo: Vehiculo) => {
    onUpdate({ 
      vehiculo_id: vehiculo.id, 
      vehiculo,
      // Reset conductor when changing vehicle
      conductor1_id: '',
      conductor1: undefined
    })
    setShowConductorChange(false)
  }

  const isValid = formData.vehiculo_id && formData.conductor1_id

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Vehículo y Conductor</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Selecciona el vehículo por placa y asigna el conductor
        </p>
      </div>

      {/* Vehicle Search */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Car className="h-4 w-4" />
            Buscar Vehículo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por placa, número interno o marca..."
              value={searchPlaca}
              onChange={(e) => setSearchPlaca(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid gap-2 max-h-[200px] overflow-y-auto">
            {filteredVehiculos.map((vehiculo) => (
              <div
                key={vehiculo.id}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all hover:border-primary/50 ${
                  formData.vehiculo_id === vehiculo.id 
                    ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                    : 'bg-card'
                }`}
                onClick={() => handleVehiculoSelect(vehiculo)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-14 items-center justify-center rounded bg-muted font-mono text-sm font-bold">
                    {vehiculo.placa}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {vehiculo.marca} {vehiculo.modelo}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {vehiculo.tipo_vehiculo} - #{vehiculo.numero_interno}
                    </p>
                  </div>
                </div>
                {vehiculo.empresa_convenio_id && (
                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                    Convenio
                  </span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Vehicle Info */}
      {selectedVehiculo && (
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground text-xs">Placa</Label>
                <p className="font-medium">{selectedVehiculo.placa}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Marca/Modelo</Label>
                <p className="font-medium">{selectedVehiculo.marca} {selectedVehiculo.modelo}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Tipo</Label>
                <p className="font-medium">{selectedVehiculo.tipo_vehiculo}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Tarjeta Op.</Label>
                <p className="font-medium">{selectedVehiculo.tarjeta_operacion || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conductor Section */}
      {selectedVehiculo && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Conductor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {defaultConductor && !showConductorChange ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border bg-primary/5 border-primary">
                  <div>
                    <p className="font-medium">{defaultConductor.nombre_completo}</p>
                    <p className="text-sm text-muted-foreground">
                      C.C. {defaultConductor.cedula} | Lic. vigente hasta {defaultConductor.vigencia_licencia}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowConductorChange(true)}
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Cambiar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Conductor Principal</Label>
                  <Select
                    value={formData.conductor1_id}
                    onValueChange={(value) => {
                      const conductor = conductores.find(c => c.id === value)
                      onUpdate({ conductor1_id: value, conductor1: conductor })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar conductor..." />
                    </SelectTrigger>
                    <SelectContent>
                      {conductores.map((conductor) => (
                        <SelectItem key={conductor.id} value={conductor.id}>
                          {conductor.nombre_completo} - C.C. {conductor.cedula}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Conductor 2 (Opcional)</Label>
                  <Select
                    value={formData.conductor2_id || ""}
                    onValueChange={(value) => {
                      const conductor = value ? conductores.find(c => c.id === value) : undefined
                      onUpdate({ conductor2_id: value || undefined, conductor2: conductor })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar conductor adicional..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Ninguno</SelectItem>
                      {conductores.filter(c => c.id !== formData.conductor1_id).map((conductor) => (
                        <SelectItem key={conductor.id} value={conductor.id}>
                          {conductor.nombre_completo} - C.C. {conductor.cedula}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Convenio Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Building className="h-4 w-4" />
            Tipo de Servicio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="convenio"
                checked={formData.es_convenio}
                onCheckedChange={(checked) => onUpdate({ es_convenio: !!checked })}
              />
              <Label htmlFor="convenio" className="cursor-pointer">Convenio</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="consorcio"
                checked={formData.es_consorcio}
                onCheckedChange={(checked) => onUpdate({ es_consorcio: !!checked })}
              />
              <Label htmlFor="consorcio" className="cursor-pointer">Consorcio</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="union_temporal"
                checked={formData.es_union_temporal}
                onCheckedChange={(checked) => onUpdate({ es_union_temporal: !!checked })}
              />
              <Label htmlFor="union_temporal" className="cursor-pointer">Unión Temporal</Label>
            </div>
          </div>

          {formData.es_convenio && (
            <div className="space-y-2">
              <Label>Empresa en Convenio</Label>
              <Select
                value={formData.empresa_convenio_id || ""}
                onValueChange={(value) => {
                  const empresa = empresasConvenio.find(e => e.id === value)
                  onUpdate({ empresa_convenio_id: value, empresa_convenio: empresa })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar empresa..." />
                </SelectTrigger>
                <SelectContent>
                  {empresasConvenio.map((empresa) => (
                    <SelectItem key={empresa.id} value={empresa.id}>
                      {empresa.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
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
