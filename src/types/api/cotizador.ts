export interface CotizarAutoRequest {
  marca: string
  modelo: string
  anioFabricacion: number
  codigoPostal: number
  cobertura?: string
}

export interface CotizarAutoResponse {
  SDTSrvCotizacionOut?: {
    Presupuesto?: {
      Numero: string
      [key: string]: unknown
    }
    [key: string]: unknown
  }
}
