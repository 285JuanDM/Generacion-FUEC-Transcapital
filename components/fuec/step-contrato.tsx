"use client"

import { useState, useMemo } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
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
import { ChevronLeft, ChevronRight, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Contrato, FuecFormData } from "@/lib/types"

interface StepContratoProps {
  contratos: Contrato[]
  formData: FuecFormData
  onUpdate: (data: Partial<FuecFormData>) => void
  onNext: () => void
  onBack: () => void
}

export function StepContrato({ contratos, formData, onUpdate, onNext, onBack }: StepContratoProps) {
  const [open, setOpen] = useState(false)

  const selectedContrato = contratos.find(c => c.id === formData.contrato_id)

  const handleSelect = (contrato: Contrato) => {
    onUpdate({ 
      contrato_id: contrato.id, 
      contrato,
      objeto_contrato: contrato.objeto_contrato || 'TRANSPORTE ESCOLAR'
    })
    setOpen(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Contrato</h3>
        <p className="text-sm text-muted-foreground">
          Selecciona el contrato asociado al viaje
        </p>
      </div>

      <div className="space-y-2">
        <Label>Contrato</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between font-normal h-10"
            >
              {selectedContrato 
                ? `#${selectedContrato.numero_contrato} - ${selectedContrato.nombre_contratante}`
                : "Buscar por número o razón social..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar contrato..." />
              <CommandList>
                <CommandEmpty>No se encontraron contratos.</CommandEmpty>
                <CommandGroup>
                  {contratos.map((contrato) => (
                    <CommandItem
                      key={contrato.id}
                      value={`${contrato.numero_contrato} ${contrato.nombre_contratante} ${contrato.nit_contratante || ''}`}
                      onSelect={() => handleSelect(contrato)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          formData.contrato_id === contrato.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">#{contrato.numero_contrato} - {contrato.nombre_contratante}</span>
                        {contrato.nit_contratante && (
                          <span className="text-xs text-muted-foreground">NIT: {contrato.nit_contratante}</span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center justify-between pt-6 border-t">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Atrás
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!formData.contrato_id}
          className="gap-2"
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
