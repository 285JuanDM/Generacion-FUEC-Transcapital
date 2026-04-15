"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Search, Building2, ArrowRight, FileText } from "lucide-react"
import type { Contrato, FuecFormData } from "@/lib/types"

interface StepContratoProps {
  contratos: Contrato[]
  formData: FuecFormData
  onUpdate: (data: Partial<FuecFormData>) => void
  onNext: () => void
}

export function StepContrato({ contratos, formData, onUpdate, onNext }: StepContratoProps) {
  const [search, setSearch] = useState("")
  
  const filteredContratos = useMemo(() => {
    if (!search) return contratos
    const term = search.toLowerCase()
    return contratos.filter(c => 
      c.nombre_contratante.toLowerCase().includes(term) ||
      c.numero_contrato.toLowerCase().includes(term) ||
      c.nit_contratante?.toLowerCase().includes(term)
    )
  }, [contratos, search])

  const selectedContrato = contratos.find(c => c.id === formData.contrato_id)

  const handleSelect = (contrato: Contrato) => {
    onUpdate({ 
      contrato_id: contrato.id, 
      contrato,
      objeto_contrato: contrato.objeto_contrato || 'TRANSPORTE ESCOLAR'
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Seleccionar Contrato</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Busca y selecciona el contrato para el cual se generará el FUEC
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por contratante, número de contrato o NIT..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2">
        {filteredContratos.map((contrato) => (
          <Card 
            key={contrato.id}
            className={`cursor-pointer transition-all hover:border-primary/50 ${
              formData.contrato_id === contrato.id 
                ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                : ''
            }`}
            onClick={() => handleSelect(contrato)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      #{contrato.numero_contrato}
                    </span>
                  </div>
                  <h3 className="font-medium text-foreground mt-1 truncate">
                    {contrato.nombre_contratante}
                  </h3>
                  {contrato.nit_contratante && (
                    <p className="text-sm text-muted-foreground">
                      NIT: {contrato.nit_contratante}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredContratos.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No se encontraron contratos
          </div>
        )}
      </div>

      {selectedContrato && (
        <Card className="bg-muted/30 border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Contrato Seleccionado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Contratante</Label>
                <p className="font-medium">{selectedContrato.nombre_contratante}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">NIT</Label>
                <p className="font-medium">{selectedContrato.nit_contratante || '-'}</p>
              </div>
              {selectedContrato.responsable && (
                <div>
                  <Label className="text-muted-foreground">Responsable</Label>
                  <p className="font-medium">{selectedContrato.responsable}</p>
                </div>
              )}
              {selectedContrato.direccion && (
                <div>
                  <Label className="text-muted-foreground">Dirección</Label>
                  <p className="font-medium">{selectedContrato.direccion}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end pt-4">
        <Button 
          onClick={onNext} 
          disabled={!formData.contrato_id}
          size="lg"
        >
          Continuar
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
