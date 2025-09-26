// Validación y sanitización de datos de orden
export function validateOrderInput(input) {
  const { buyer, items, metodo_pago, info_envio } = input;
  if (!buyer || !buyer.nombre || !buyer.email || !buyer.telefono ) {
    throw new Error('Datos de comprador incompletos');
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Debe haber al menos un producto en la orden');
  }
  for (const item of items) {
    if (!item.id || typeof item.cantidad !== 'number' || item.cantidad < 1) {
      throw new Error('Datos de producto inválidos');
    }
  }
  if (!['mercadopago', 'bank', 'cash', 'qr'].includes(metodo_pago)) {
    throw new Error('Método de pago inválido');
  }
  if (!buyer.direccion) {
    buyer.direccion = '';
  }
  return { buyer, items, metodo_pago, info_envio };
}
