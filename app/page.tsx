import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { FuecWizard } from "@/components/fuec/fuec-wizard"
import { Button } from "@/components/ui/button"
import { History, FileText } from "lucide-react"

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch all required data in parallel
  const [
    { data: empresa },
    { data: contratos },
    { data: vehiculos },
    { data: conductores },
    { data: empresasConvenio },
    { data: vehiculoConductores },
  ] = await Promise.all([
    supabase.from('empresa').select('*').single(),
    supabase.from('contratos').select('*').order('numero_contrato'),
    supabase.from('vehiculos').select('*, empresa_convenio:empresas_convenio(*)').order('placa'),
    supabase.from('conductores').select('*').order('nombre_completo'),
    supabase.from('empresas_convenio').select('*').order('nombre'),
    supabase.from('vehiculo_conductor').select('*, conductor:conductores(*)'),
  ])

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-semibold text-lg text-foreground">Sistema FUEC</h1>
                <p className="text-xs text-muted-foreground">{empresa?.razon_social}</p>
              </div>
            </div>
            <Link href="/historial">
              <Button variant="outline" size="sm">
                <History className="h-4 w-4 mr-2" />
                Historial
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-foreground">Generar Nuevo FUEC</h2>
          <p className="text-muted-foreground mt-1">
            Formato Único de Extracto del Contrato
          </p>
        </div>

        <FuecWizard
          empresa={empresa}
          contratos={contratos || []}
          vehiculos={vehiculos || []}
          conductores={conductores || []}
          empresasConvenio={empresasConvenio || []}
          vehiculoConductores={vehiculoConductores || []}
        />
      </div>
    </main>
  )
}
