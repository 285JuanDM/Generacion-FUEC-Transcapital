"use client"

import { useState, useMemo, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Check, ChevronsUpDown, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"
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
  const [vehiculoOpen, setVehiculoOpen] = useState(false)
  const [conductorOpen, setConductorOpen] = useState(false)
  const [showConductorChange, setShowConductorChange] = useState(false)

  const selectedVehiculo = vehiculos.find(v => v.id === formData.vehiculo_id)
  const selectedConductor = conductores.find(c => c.id === formData.conductor1_id)
  
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
    if (defaultConductor && !showConductorChange && !formData.conductor1_id) {
      onUpdate({ conductor1_id: defaultConductor.id, conductor1: defaultConductor })
    }
  }, [defaultConductor, showConductorChange, formData.conductor1_id, onUpdate])

  const handleVehiculoSelect = (vehiculo: Vehiculo) => {
    onUpdate({ 
      vehiculo_id: vehiculo.id, 
      vehiculo,
      conductor1_id: '',
      conductor1: undefined
    })
    setShowConductorChange(false)
    setVehiculoOpen(false)
  }

  const handleConductorSelect = (conductor: Conductor) => {
    onUpdate({ conductor1_id: conductor.id, conductor1: conductor })
    setConductorOpen(false)
  }

  const isValid = formData.vehiculo_id && formData.conductor1_id

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Vehículo</h3>
        <p className="text-sm text-muted-foreground">
          Selecciona el vehículo y conductor para el viaje
        </p>
      </div>

      <div className="space-y-4">
        {/* Vehicle Selection */}
        <div className="space-y-2">
          <Label>Vehículo (buscar por placa)</Label>
          <Popover open={vehiculoOpen} onOpenChange={setVehiculoOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={vehiculoOpen}
                className="w-full justify-between font-normal h-10"
              >
                {selectedVehiculo 
                  ? `${selectedVehiculo.placa} - ${selectedVehiculo.marca} ${selectedVehiculo.modelo} (${selectedVehiculo.tipo_vehiculo})`
                  : "Buscar por placa..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command>
                <CommandInput placeholder="Buscar placa..." />
                <CommandList>
                  <CommandEmpty>No se encontraron vehículos.</CommandEmpty>
                  <CommandGroup>
                    {vehiculos.map((vehiculo) => (
                      <CommandItem
                        key={vehiculo.id}
                        value={`${vehiculo.placa} ${vehiculo.marca} ${vehiculo.numero_interno}`}
                        onSelect={() => handleVehiculoSelect(vehiculo)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.vehiculo_id === vehiculo.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex items-center gap-3 flex-1">
                          <span className="font-mono font-bold bg-muted px-2 py-0.5 rounded text-sm">
                            {vehiculo.placa}
                          </span>
                          <span>{vehiculo.marca} {vehiculo.modelo}</span>
                          <span className="text-muted-foreground text-xs">({vehiculo.tipo_vehiculo})</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Conductor Selection */}
        {selectedVehiculo && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Conductor</Label>
              {defaultConductor && !showConductorChange && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConductorChange(true)}
                >
                  <UserPlus className="h-3 w-3 mr-1" />
                  Cambiar conductor
                </Button>
              )}
            </div>
            
            {!showConductorChange && defaultConductor ? (
              <div className="p-3 rounded-lg border bg-muted/30">
                <p className="font-medium">{defaultConductor.nombre_completo}</p>
                <p className="text-sm text-muted-foreground">
                  C.C. {defaultConductor.cedula}
                </p>
              </div>
            ) : (
              <Popover open={conductorOpen} onOpenChange={setConductorOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={conductorOpen}
                    className="w-full justify-between font-normal h-10"
                  >
                    {selectedConductor 
                      ? `${selectedConductor.nombre_completo} - C.C. ${selectedConductor.cedula}`
                      : "Seleccionar conductor..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar conductor..." />
                    <CommandList>
                      <CommandEmpty>No se encontraron conductores.</CommandEmpty>
                      <CommandGroup>
                        {conductores.map((conductor) => (
                          <CommandItem
                            key={conductor.id}
                            value={`${conductor.nombre_completo} ${conductor.cedula}`}
                            onSelect={() => handleConductorSelect(conductor)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.conductor1_id === conductor.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{conductor.nombre_completo}</span>
                              <span className="text-xs text-muted-foreground">C.C. {conductor.cedula}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          </div>
        )}

        {/* Convenio Options */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="convenio"
                checked={formData.es_convenio}
                onCheckedChange={(checked) => onUpdate({ es_convenio: !!checked })}
              />
              <Label htmlFor="convenio" className="cursor-pointer text-sm">Convenio</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="consorcio"
                checked={formData.es_consorcio}
                onCheckedChange={(checked) => onUpdate({ es_consorcio: !!checked })}
              />
              <Label htmlFor="consorcio" className="cursor-pointer text-sm">Consorcio</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="union_temporal"
                checked={formData.es_union_temporal}
                onCheckedChange={(checked) => onUpdate({ es_union_temporal: !!checked })}
              />
              <Label htmlFor="union_temporal" className="cursor-pointer text-sm">Unión Temporal</Label>
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
