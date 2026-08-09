/**
 * Datos del responsable del tratamiento / proveedor del servicio.
 *
 * Deben coincidir exactamente con la documentación cargada en la verificación
 * del negocio de Meta (razón social, CUIT y domicilio). Si cambia uno de estos
 * valores, hay que actualizarlo también del lado de Meta o la verificación
 * queda inconsistente.
 */
export const PROVEEDOR = {
  razonSocial: 'John Pellegrini Management Group S.R.L.',
  cuit: '30-71590369-1',
  domicilio: 'Blvd. 27 de Febrero 275, Rosario, Santa Fe, Argentina',
  telefono: '+54 9 341 275-7294',
  telefonoHref: 'tel:+5493412757294',
  whatsappHref: 'https://wa.me/5493412757294',
  email: 'mp_seguros@segurosmp.com',
  matricula: 'Matr. SSN 64.231',
} as const

/** Fecha de última actualización de la política de privacidad. */
export const PRIVACIDAD_ACTUALIZADA = '9 de agosto de 2026'
