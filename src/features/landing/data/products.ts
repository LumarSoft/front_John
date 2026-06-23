import {
  IconAuto,
  IconMoto,
  IconBici,
  IconBolso,
  IconComercio,
  IconHogar,
  IconPersonas,
  IconPraxis,
} from '../components/icons'
import type { Product } from '../types'

// Layout-only catalog (icon + short labels) for the landing/coberturas UI. The
// canonical coverage descriptions are served by the API (GET /public/products),
// the single source shared with the WhatsApp bot — do not re-add desc/includes
// here or the two will drift.
export const PRODUCTS: Product[] = [
  { id: 'auto', n: '01', label: 'Auto', sub: 'Todo riesgo, terceros completo', Icon: IconAuto },
  { id: 'moto', n: '02', label: 'Moto', sub: 'Cualquier cilindrada', Icon: IconMoto },
  { id: 'bici', n: '03', label: 'Bicicletas', sub: 'Urbanas, MTB y eléctricas', Icon: IconBici },
  { id: 'bolso', n: '04', label: 'Bolso protegido', sub: 'Robo, hurto y contenido', Icon: IconBolso },
  { id: 'comercio', n: '05', label: 'Comercio e Industria', sub: 'Locales, depósitos y plantas', Icon: IconComercio },
  { id: 'hogar', n: '06', label: 'Hogar', sub: 'Edificio y contenido', Icon: IconHogar },
  { id: 'personas', n: '07', label: 'Personas', sub: 'Vida, accidentes y salud', Icon: IconPersonas },
  { id: 'praxis', n: '08', label: 'Praxis profesional', sub: 'Responsabilidad civil profesional', Icon: IconPraxis },
]
