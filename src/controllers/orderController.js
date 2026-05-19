import { PrismaClient } from "db";
const prisma = new PrismaClient();
import { validateOrderInput } from '../utils/orderValidation.js';
import { MercadoPagoService } from '../services/mercadoPagoService.js';

// Crea una nueva orden de compra (checkout web)
export const createOrder = async (req, res) => {
  try {
    // Validar y sanitizar entrada
    let productName = '';
    const { buyer, items, metodo_pago, info_envio, tracking, envio, descuento } = validateOrderInput(req.body);

    // Verificar existencia de productos y stock
    const productosDB = await prisma.product.findMany({
      where: { id: { in: items.map(i => i.id) } }
    });
    if (productosDB.length !== items.length) {
      return res.status(400).json({ error: 'Producto inexistente.' });
    }

    // Recalcular subtotal y verificar stock
    let subtotal = 0;
    for (const item of items) {
      const prod = productosDB.find(p => p.id === item.id);
      if (!prod || prod.stock < item.cantidad) {
        return res.status(400).json({ error: `Stock insuficiente para ${prod?.name || item.id}` });
      }
      subtotal += prod.salePrice * item.cantidad;
    }

    // Calcular monto total (subtotal - descuento + envío)
    const costo_envio = envio?.costo_envio || 0;
    const descuento_aplicado = descuento?.descuento_aplicado || 0;
    const monto_total = subtotal - descuento_aplicado + costo_envio;

    // Crear o buscar comprador con datos de marketing si vienen
    let comprador = await prisma.buyer.findUnique({ where: { email: buyer.email } });
    if (!comprador) {
      const buyerData = {
        ...buyer,
        // Agregar UTMs al buyer si es primera vez y vienen en tracking
        utm_source: tracking?.utm_source || undefined,
        utm_medium: tracking?.utm_medium || undefined,
        utm_campaign: tracking?.utm_campaign || undefined,
        utm_content: tracking?.utm_content || undefined,
        utm_term: tracking?.utm_term || undefined,
      };
      comprador = await prisma.buyer.create({ data: buyerData });
    }

    // Preparar datos de la orden con todos los campos de tracking
    const orderData = {
      buyerId: comprador.id,
      monto_total,
      subtotal,
      descuento_aplicado,
      costo_envio,
      estado: 'PENDIENTE_PAGO',
      metodo_pago,
      info_envio,

      // Información de envío
      provincia: envio?.provincia || null,
      codigo_postal: envio?.codigo_postal || null,
      tiempo_estimado_envio: envio?.tiempo_estimado_envio || null,

      // Marketing y canal
      canal_venta: 'ECOMMERCE',
      utm_source: tracking?.utm_source || null,
      utm_medium: tracking?.utm_medium || null,
      utm_campaign: tracking?.utm_campaign || null,
      utm_content: tracking?.utm_content || null,
      utm_term: tracking?.utm_term || null,
      cupon_aplicado: descuento?.cupon_aplicado || null,

      // Tracking técnico
      session_id: tracking?.session_id || null,
      device_type: tracking?.device_type || null,
      user_agent: tracking?.user_agent || null,
      ip_address: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || null,

      // Comportamiento
      tiempo_desde_primer_producto_agregado: tracking?.tiempo_desde_primer_producto_agregado || null,
      cantidad_productos_vistos: tracking?.cantidad_productos_vistos || null,
      abandono_carrito_previo: tracking?.abandono_carrito_previo || false,

      detalles: {
        create: items.map(item => ({
          productoId: item.id,
          cantidad: item.cantidad,
          productoName: productosDB.find(p => p.id === item.id).name,
          precio_unitario_al_momento_de_compra: productosDB.find(p => p.id === item.id).salePrice
        }))
      }
    };

    // Crear orden en estado PENDIENTE_PAGO
    const order = await prisma.order.create({
      data: orderData,
      include: { detalles: true, buyer: true }
    });

    // Reservar stock temporalmente
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.id },
        data: { stock: { decrement: item.cantidad } }
      });
    }

    // Integrar con MercadoPago o Transferencia
    let id_transaccion_pasarela = null;
    if (metodo_pago === 'mercadopago') {
      const mp = new MercadoPagoService();
      // El payer se pasa como opción, las URLs se gestionan en el servicio
      const payer = {
        name: comprador.nombre,
        email: comprador.email,
        phone: { number: comprador.telefono },
        address: comprador.direccion,
        ...(comprador.dni && { identification: { type: 'DNI', number: comprador.dni } }),
      };

      const mpPref = await mp.createPreference(order, productosDB, { payer });
      id_transaccion_pasarela = mpPref.id;
      await prisma.order.update({ where: { id: order.id }, data: { id_transaccion_pasarela } });
      return res.status(201).json({ orderId: order.id, mp_preference_id: id_transaccion_pasarela, init_point: mpPref.init_point });
    } else if (metodo_pago === 'qr') {
      const mp = new MercadoPagoService();
      const payer = {
        name: comprador.nombre,
        email: comprador.email,
        phone: { number: comprador.telefono },
        address: comprador.direccion,
        ...(comprador.dni && { identification: { type: 'DNI', number: comprador.dni } }),
      };

      const qrResult = await mp.createQRCode(order, productosDB, { payer });
      id_transaccion_pasarela = qrResult.preference_id;
      await prisma.order.update({ where: { id: order.id }, data: { id_transaccion_pasarela } });
      return res.status(201).json({
        orderId: order.id,
        qr_data: qrResult.qr_data,
        preference_id: qrResult.preference_id,
        qr_url: qrResult.qr_url,
        payment_method: 'qr'
      });
    } else if (metodo_pago === 'bank') {
      // Solo retornar datos de transferencia y orden creada
      return res.status(201).json({ orderId: order.id, bank: true });
    } else if (metodo_pago === 'cash') {
      // Solo retornar datos de cash y orden creada
      return res.status(201).json({ orderId: order.id, cash: true });
    } else {
      return res.status(400).json({ error: 'Método de pago no soportado.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Error procesando la orden.' });
  }
};

// Webhook MercadoPago
// Consulta el estado de una orden por ID
export const getOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        buyer: true,
        detalles: true,
      },
    });
    if (!order) return res.status(404).json({ error: 'Orden no encontrada.' });
    // Solo exponer campos relevantes y seguros

    res.json({
      id: order.id,
      estado: order.estado,
      metodo_pago: order.metodo_pago,
      monto_total: order.monto_total,
      buyer: { nombre: order.buyer.nombre, email: order.buyer.email },
      detalles: order.detalles.map(d => ({
        productoId: d.productoId,
        cantidad: d.cantidad,
        productoName: d.productoName,
        precio_unitario: d.precio_unitario_al_momento_de_compra,
      })),
      createdAt: order.fecha_creacion,
      info_envio: order.info_envio
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Error consultando la orden.' });
  }
};

// Obtener todas las órdenes con paginación
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, estado, sortBy = 'fecha_creacion', sortOrder = 'desc' } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    const whereClause = {};
    if (estado) {
      whereClause.estado = estado;
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        // buyer: {
        //   select: {
        //     nombre: true,
        //     email: true,
        //   },
        // },
        detalles: {
          select: {
            productoName: true,
            cantidad: true,
            precio_unitario_al_momento_de_compra: true,
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: offset,
      take: limitNum,
    });

    const totalOrders = await prisma.order.count({ where: whereClause });

    res.json({
      data: orders,
      pagination: {
        total: totalOrders,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalOrders / limitNum),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Error obteniendo las órdenes.' });
  }
};

// Actualizar el estado de una orden
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const allowedTransitions = {
      'PENDIENTE_PAGO': ['PAGADO', 'RECHAZADO', 'ENTREGADO'],
      'PAGADO': ['ENTREGADO'],
      'RECHAZADO': ['ENTREGADO'],
      'ENTREGADO': ['ENTREGADO'],
    };

    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada.' });
    }

    const possibleNextStates = allowedTransitions[order.estado] || [];
    if (!possibleNextStates.includes(estado)) {
      return res.status(400).json({
        error: `Transición de estado no permitida. Desde '${order.estado}' solo se puede pasar a: ${possibleNextStates.join(', ')}`
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { estado },
      include: {
        buyer: true,
        detalles: true,
      },
    });

    res.json(updatedOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Error actualizando la orden.' });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { detalles: true },
    });

    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada.' });
    }

    if (order.estado !== 'PENDIENTE_PAGO') {
      return res.status(400).json({ error: 'Solo se pueden cancelar órdenes pendientes de pago.' });
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      for (const item of order.detalles) {
        await tx.product.update({
          where: { id: item.productoId },
          data: { stock: { increment: item.cantidad } },
        });
      }

      return tx.order.update({
        where: { id },
        data: { estado: 'CANCELADO' },
        include: { detalles: true, buyer: true },
      });
    });

    res.json({
      id: updatedOrder.id,
      estado: updatedOrder.estado,
      metodo_pago: updatedOrder.metodo_pago,
      monto_total: updatedOrder.monto_total,
      buyer: { nombre: updatedOrder.buyer.nombre, email: updatedOrder.buyer.email },
      detalles: updatedOrder.detalles.map(d => ({
        productoId: d.productoId,
        cantidad: d.cantidad,
        productoName: d.productoName,
        precio_unitario: d.precio_unitario_al_momento_de_compra,
      })),
      createdAt: updatedOrder.fecha_creacion,
      info_envio: updatedOrder.info_envio,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Error cancelando la orden.' });
  }
};

export const mercadoPagoWebhook = async (req, res) => {
  try {
    // Mercado Pago envía notificaciones por topic y type
    const { id, topic, type } = req.query;
    // Solo procesar notificaciones de payment
    if ((topic || type) !== 'payment') {
      return res.status(200).json({ ok: true, ignored: true });
    }
    // Obtener info de pago usando el SDK
    const mp = new MercadoPagoService();
    const payment = await mp.getPaymentById(id);
    if (!payment) return res.status(404).json({ error: 'Pago no encontrado.' });
    // Buscar la orden asociada por external_reference
    const order = await prisma.order.findFirst({ where: { id: payment.external_reference } });
    if (!order) return res.status(404).json({ error: 'Orden no encontrada.' });
    // Cambiar estado según status de Mercado Pago
    let nuevoEstado = 'PENDIENTE_PAGO';
    if (payment.status === 'approved') nuevoEstado = 'PAGADO';
    if (payment.status === 'rejected') nuevoEstado = 'RECHAZADO';
    await prisma.order.update({ where: { id: order.id }, data: { estado: nuevoEstado } });
    // TODO: Enviar email a cliente y notificación a admin
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Error en webhook.' });
  }
};
