// Servicio Mercado Pago usando el SDK oficial para Node.js
// Servicio Mercado Pago usando el SDK oficial para Node.js
import { MercadoPagoConfig, Preference, MerchantOrder } from 'mercadopago';

/**
 * MercadoPagoService
 * - Usa el SDK oficial de Mercado Pago para Node.js (v2)
 * - Requiere que el accessToken esté en process.env.MERCADOPAGO_ACCESS_TOKEN
 * - Maneja errores y respuestas del SDK
 */
export class MercadoPagoService {
  constructor() {
    this.accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!this.accessToken) {
      throw new Error('Falta la variable MERCADOPAGO_ACCESS_TOKEN en .env');
    }
    // Inicializa el cliente de Mercado Pago con el token de acceso
    this.client = new MercadoPagoConfig({ accessToken: this.accessToken });
  }

  /**
   * Obtiene un pago por ID usando el SDK de Mercado Pago
   * @param {string} paymentId
   * @returns {Promise<object|null>} Detalle del pago o null si no existe
   */
  async getPaymentById(paymentId) {
    try {
      const resp = await mercadopago.payment.findById(paymentId);
      return resp.body;
    } catch (err) {
      if (err.status === 404) return null;
      throw err;
    }
  }

  /**
   * Crea una preferencia de pago en Mercado Pago usando el SDK
   * @param {object} order - Orden creada en la base de datos
   * @param {object[]} productosDB - Array de productos con info actual
   * @param {object} [options] - Opciones extra: payer, back_urls, notification_url
   * @returns {Promise<object>} Preferencia creada
   */
  async createPreference(order, productosDB, options = {}) {
    const items = order.detalles.map(det => {
      const prod = productosDB.find(p => p.id === det.productoId);
      return {
        id: prod.id,
        title: prod.name,
        quantity: det.cantidad,
        unit_price: parseFloat(prod.salePrice),
        currency_id: 'ARS',
        description: prod.description,
        picture_url: prod.images?.[0] || undefined
      };
    });

    // Lógica de URLs centralizada y segura
    // console.log(`[MercadoPagoService] Leyendo process.env.BASE_URL: ${process.env.BASE_URL}`);
    let baseUrl = process.env.BASE_URL;
    // Validación más estricta: si no es un string, está vacío o no parece una URL, usar fallback.
    if (typeof baseUrl !== 'string' || baseUrl.trim() === '' || !baseUrl.startsWith('http')) {
      console.warn(`[MercadoPagoService] BASE_URL inválida ('${baseUrl}'). Usando fallback a http://localhost:3000`);
      baseUrl = 'http://localhost:3000';
    }

    const back_urls = {
      // success: `${baseUrl}/checkout/success`,
      success: `${baseUrl}/order/${order.id}`,
      pending: `${baseUrl}/checkout/pending`,
      failure: `${baseUrl}/checkout/failure`,
    };

    const notification_url = `${baseUrl}/api/order/webhooks/mercadopago`;

    const preference = {
      items,
      external_reference: order.id,
      payer: options.payer || undefined,
      back_urls, // Usar las URLs construidas internamente
      notification_url, // Usar la URL construida internamente
      auto_return: 'approved',
      payment_methods: {
        excluded_payment_types: [{ id: 'ticket' }],
      },
      statement_descriptor: 'MODOTECNO',
    };

    try {
      const preferenceClient = new Preference(this.client);
      const resp = await preferenceClient.create({ body: preference });
      return resp;
    } catch (err) {
      console.error('Error al crear preferencia de MercadoPago:', err);
      if (err.response) {
        throw new Error(`MercadoPago SDK error: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
      }
      throw new Error(`Error comunicando con MercadoPago: ${err.message}`);
    }
  }

  /**
   * Crea un código QR dinámico para pago inmediato
   * @param {object} order - Orden creada en la base de datos
   * @param {object[]} productosDB - Array de productos con info actual
   * @param {object} [options] - Opciones extra: payer
   * @returns {Promise<object>} QR Code creado con la URL del QR
   */
  async createQRCode(order, productosDB, options = {}) {
    // Crear una preferencia de pago normal y usar su ID para generar el QR
    const preference = await this.createPreference(order, productosDB, options);
    
    // Generar URL del QR usando la preferencia
    const qrUrl = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${preference.id}`;
    
    // Generar QR usando una API externa (por simplicidad)
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}`;
    
    try {
      // Obtener la imagen del QR como base64
      const qrResponse = await fetch(qrApiUrl);
      if (!qrResponse.ok) {
        throw new Error('Error al generar código QR');
      }
      
      const qrBuffer = await qrResponse.arrayBuffer();
      const qrBase64 = Buffer.from(qrBuffer).toString('base64');
      
      return {
        qr_data: qrBase64,
        preference_id: preference.id,
        external_reference: order.id,
        qr_url: qrUrl
      };
    } catch (err) {
      console.error('Error al crear QR Code:', err);
      throw new Error(`Error generando QR: ${err.message}`);
    }
  }
}
