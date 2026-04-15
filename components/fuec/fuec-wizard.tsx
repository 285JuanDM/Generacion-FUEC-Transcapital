"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { StepContrato } from "./step-contrato"
import { StepViaje } from "./step-viaje"
import { StepVehiculo } from "./step-vehiculo"
import { StepResumen } from "./step-resumen"
import { Check } from "lucide-react"
import type { Contrato, Vehiculo, Conductor, EmpresaConvenio, VehiculoConductor, Empresa, FuecFormData } from "@/lib/types"

interface FuecWizardProps {
  empresa: Empresa | null
  contratos: Contrato[]
  vehiculos: Vehiculo[]
  conductores: Conductor[]
  empresasConvenio: EmpresaConvenio[]
  vehiculoConductores: VehiculoConductor[]
}

const steps = [
  { id: 1, name: "Contrato", description: "Seleccionar contrato" },
  { id: 2, name: "Viaje", description: "Fechas y trayecto" },
  { id: 3, name: "Vehículo", description: "Vehículo y conductor" },
  { id: 4, name: "Resumen", description: "Confirmar y generar" },
]

const initialFormData: FuecFormData = {
  contrato_id: "",
  fecha_inicio: "",
  fecha_fin: "",
  origen: "",
  destino: "",
  objeto_contrato: "TRANSPORTE ESCOLAR",
  vehiculo_id: "",
  conductor1_id: "",
  es_convenio: false,
  es_consorcio: false,
  es_union_temporal: false,
}

export function FuecWizard({ 
  empresa,
  contratos, 
  vehiculos, 
  conductores, 
  empresasConvenio,
  vehiculoConductores 
}: FuecWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FuecFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateFormData = (data: Partial<FuecFormData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/fuec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al generar el FUEC')
      }

      toast.success('FUEC generado exitosamente', {
        description: `Número: ${result.numero_fuec}`,
      })

      // Redirect to the PDF or history
      if (result.pdf_url) {
        window.open(result.pdf_url, '_blank')
      }
      
      // Reset form or redirect
      router.push(`/historial?nuevo=${result.id}`)
    } catch (error) {
      toast.error('Error al generar el FUEC', {
        description: error instanceof Error ? error.message : 'Intenta de nuevo',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <nav aria-label="Progreso" className="mb-8">
        <ol className="flex items-center justify-between">
          {steps.map((step, index) => (
            <li key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className="flex items-center">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                      currentStep > step.id
                        ? 'bg-primary text-primary-foreground'
                        : currentStep === step.id
                        ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      step.id
                    )}
                  </span>
                </div>
                <div className="mt-2 text-center hidden sm:block">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-0.5 flex-1 mx-2 ${
                  currentStep > step.id ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Step Content */}
      <div className="bg-card rounded-xl border p-6 shadow-sm">
        {currentStep === 1 && (
          <StepContrato
            contratos={contratos}
            formData={formData}
            onUpdate={updateFormData}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 2 && (
          <StepViaje
            formData={formData}
            onUpdate={updateFormData}
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <StepVehiculo
            vehiculos={vehiculos}
            conductores={conductores}
            empresasConvenio={empresasConvenio}
            vehiculoConductores={vehiculoConductores}
            formData={formData}
            onUpdate={updateFormData}
            onNext={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && (
          <StepResumen
            formData={formData}
            empresa={empresa}
            onBack={() => setCurrentStep(3)}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  )
}
