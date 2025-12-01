// Validación y sanitización de datos de orden
export function validateOrderInput(input) {
  const { 
    buyer, 
    items, 
    metodo_pago, 
    info_envio,
    tracking,
    envio 
  } = input;
  
  // Validar comprador
  if (!buyer || !buyer.nombre || !buyer.email || !buyer.telefono ) {
    throw new Error('Datos de comprador incompletos');
  }
  
  // Validar items
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Debe haber al menos un producto en la orden');
  }
  for (const item of items) {
    if (!item.id || typeof item.cantidad !== 'number' || item.cantidad < 1) {
      throw new Error('Datos de producto inválidos');
    }
  }
  
  // Validar método de pago
  if (!['mercadopago', 'bank', 'cash', 'qr'].includes(metodo_pago)) {
    throw new Error('Método de pago inválido');
  }
  
  // Asegurar dirección
  if (!buyer.direccion) {
    buyer.direccion = '';
  }
  
  // Validar y sanitizar tracking data (opcional)
  const sanitizedTracking = tracking ? {
    utm_source: tracking.utm_source?.trim() || null,
    utm_medium: tracking.utm_medium?.trim() || null,
    utm_campaign: tracking.utm_campaign?.trim() || null,
    utm_content: tracking.utm_content?.trim() || null,
    utm_term: tracking.utm_term?.trim() || null,
    session_id: tracking.session_id?.trim() || null,
    device_type: tracking.device_type?.trim() || null,
    user_agent: tracking.user_agent?.substring(0, 500) || null, // Limitar longitud
    ip_address: tracking.ip_address?.trim() || null,
    tiempo_desde_primer_producto_agregado: typeof tracking.tiempo_desde_primer_producto_agregado === 'number' 
      ? tracking.tiempo_desde_primer_producto_agregado 
      : null,
    cantidad_productos_vistos: typeof tracking.cantidad_productos_vistos === 'number' 
      ? tracking.cantidad_productos_vistos 
      : null,
    abandono_carrito_previo: Boolean(tracking.abandono_carrito_previo),
  } : {};
  
  // Validar datos de envío (opcional)
  const sanitizedEnvio = envio ? {
    provincia: envio.provincia?.trim() || null,
    codigo_postal: envio.codigo_postal?.trim() || null,
    tiempo_estimado_envio: envio.tiempo_estimado_envio?.trim() || null,
    costo_envio: typeof envio.costo_envio === 'number' ? envio.costo_envio : 0,
  } : {};
  
  // Datos de descuento (opcional)
  const descuento = {
    cupon_aplicado: input.cupon_aplicado?.trim() || null,
    descuento_aplicado: typeof input.descuento_aplicado === 'number' ? input.descuento_aplicado : 0,
  };
  
  return { 
    buyer, 
    items, 
    metodo_pago, 
    info_envio,
    tracking: sanitizedTracking,
    envio: sanitizedEnvio,
    descuento
  };
}
