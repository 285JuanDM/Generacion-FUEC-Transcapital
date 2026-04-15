import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, FileText, Download, Calendar, Car, Building2, ArrowLeft } from "lucide-react"

export default async function HistorialPage() {
  const supabase = await createClient()

  const { data: fuecs } = await supabase
    .from('fuecs')
    .select(`
      *,
      contrato:contratos(numero_contrato, nombre_contratante),
      vehiculo:vehiculos(placa, marca, modelo),
      conductor1:conductores!fuecs_conductor1_id_fkey(nombre_completo)
    `)
    .order('created_at', { ascending: false })

  const { data: empresa } = await supabase
    .from('empresa')
    .select('razon_social')
    .single()

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-semibold text-lg text-foreground">Historial de FUECs</h1>
                <p className="text-xs text-muted-foreground">{empresa?.razon_social}</p>
              </div>
            </div>
            <Link href="/">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo FUEC
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {fuecs && fuecs.length > 0 ? (
          <div className="space-y-4">
            {fuecs.map((fuec) => (
              <Card key={fuec.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-medium text-foreground">
                            {fuec.numero_fuec}
                          </span>
                          <span className="text-xs bg-muted px-2 py-0.5 rounded">
                            #{fuec.contrato?.numero_contrato}
                          </span>
                        </div>
                        <h3 className="font-medium text-foreground truncate">
                          {fuec.contrato?.nombre_contratante}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Car className="h-3.5 w-3.5" />
                            {fuec.vehiculo?.placa}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(fuec.fecha_inicio)} - {formatDate(fuec.fecha_fin)}
                          </span>
                          {fuec.conductor1 && (
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3.5 w-3.5" />
                              {fuec.conductor1.nombre_completo}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`/api/fuec/${fuec.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          PDF
                        </Button>
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-muted mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg text-foreground mb-1">
              No hay FUECs generados
            </h3>
            <p className="text-muted-foreground mb-4">
              Comienza generando tu primer FUEC
            </p>
            <Link href="/">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Generar FUEC
              </Button>
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
