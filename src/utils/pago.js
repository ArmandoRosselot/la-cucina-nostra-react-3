/* Simulación de la pasarela de pago.
   En un sistema real aquí se llamaría a un servicio externo. */
export const PROBABILIDAD_EXITO = 0.8;

export function simularPago() {
  return Math.random() < PROBABILIDAD_EXITO;
}
