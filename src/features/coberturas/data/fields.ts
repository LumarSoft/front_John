export interface Field {
  label: string
  placeholder: string
  span?: 'half' | 'full'
  type?: 'text' | 'select' | 'email' | 'tel'
  options?: string[]
}

export const YEARS = Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i))

export const FIELDS: Record<string, Field[]> = {
  auto: [
    { label: 'Marca', placeholder: 'Toyota, Ford, Volkswagen…', span: 'half' },
    { label: 'Año', placeholder: 'Seleccioná', type: 'select', options: YEARS, span: 'half' },
    { label: 'Modelo', placeholder: 'Corolla, Ranger, Vento…', span: 'half' },
    { label: 'Versión', placeholder: 'XEI CVT, XLT 4x4…', span: 'half' },
  ],
  moto: [
    { label: 'Marca', placeholder: 'Honda, Yamaha, Beta…', span: 'half' },
    { label: 'Año', placeholder: 'Seleccioná', type: 'select', options: YEARS, span: 'half' },
    { label: 'Modelo', placeholder: 'CB500, MT-07, XR 150…', span: 'half' },
    { label: 'Versión', placeholder: '150 cc, 500 cc…', span: 'half' },
  ],
  bici: [
    { label: 'Marca y modelo', placeholder: 'Trek FX3, Specialized Sirrus…', span: 'full' },
    {
      label: 'Tipo',
      placeholder: 'Seleccioná',
      type: 'select',
      options: ['Urbana', 'MTB', 'Ruta', 'Eléctrica', 'Monopatín'],
      span: 'half',
    },
    { label: 'Valor del rodado ($)', placeholder: '350.000', span: 'half' },
  ],
  bolso: [
    { label: 'Bienes a asegurar', placeholder: 'Notebook, celular, billetera…', span: 'full' },
    { label: 'Valor total estimado ($)', placeholder: '500.000', span: 'full' },
  ],
  comercio: [
    { label: 'Actividad comercial', placeholder: 'Ferretería, restaurante, estudio…', span: 'full' },
    { label: 'Dirección del local', placeholder: 'Blvd. 27 de Febrero 275', span: 'full' },
    { label: 'Superficie (m²)', placeholder: '120', span: 'half' },
    { label: 'Valor de mercadería ($)', placeholder: '1.000.000', span: 'half' },
  ],
  hogar: [
    { label: 'Dirección', placeholder: 'Blvd. 27 de Febrero 275', span: 'full' },
    {
      label: 'Tipo de vivienda',
      placeholder: 'Seleccioná',
      type: 'select',
      options: ['Casa', 'Departamento', 'PH', 'Country / barrio privado'],
      span: 'half',
    },
    { label: 'Superficie (m²)', placeholder: '80', span: 'half' },
  ],
  personas: [
    { label: 'Fecha de nacimiento', placeholder: 'DD/MM/AAAA', span: 'half' },
    { label: 'Actividad', placeholder: 'Empleado, autónomo, jubilado…', span: 'half' },
  ],
  praxis: [
    { label: 'Profesión', placeholder: 'Médico, arquitecto, contador…', span: 'half' },
    { label: 'Especialidad / Matrícula', placeholder: 'Cardiología / MP 12345', span: 'half' },
  ],
}

export const CONTACT_FIELDS: Field[] = [
  { label: 'Nombre y apellido', placeholder: 'Juan García', span: 'half' },
  { label: 'Teléfono', placeholder: '+54 9 341 000-0000', type: 'tel', span: 'half' },
  { label: 'Correo electrónico', placeholder: 'juan@ejemplo.com', type: 'email', span: 'full' },
]
