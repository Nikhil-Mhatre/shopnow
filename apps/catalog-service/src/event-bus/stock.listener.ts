import { Channel } from 'amqplib';
import { ProductModel } from '../models/Product.js';
import { logger } from '../utils/logger.js';

export const startStockListener = async (channel: Channel): Promise<void> => {
  const exchangeName = 'inventory-exchange';
  const queueName = 'catalog-inventory-sync-queue';
  
  await channel.assertExchange(exchangeName, 'topic', { durable: true });
  await channel.assertQueue(queueName, { durable: true });
  
  // Bind both depletion and replenishment events to isolation routine
  await channel.bindQueue(queueName, exchangeName, 'inventory.product.*');

  channel.consume(queueName, async (msg) => {
    if (!msg) return;

    try {
      const routingKey = msg.fields.routingKey;
      const payload = JSON.parse(msg.content.toString());
      const { sku } = payload; // Assuming inventory payload yields global identifying stock keeping units

      if (routingKey === 'inventory.product.depleted') {
        await ProductModel.updateOne({ sku }, { isOutOfStock: true });
        logger.info(`[Sync] Product ${sku} marked OUT of stock.`);
      } else if (routingKey === 'inventory.product.replenished') {
        await ProductModel.updateOne({ sku }, { isOutOfStock: false });
        logger.info(`[Sync] Product ${sku} marked IN stock.`);
      }

      channel.ack(msg);
    } catch (error) {
      console.error('Error handling background AMQP stock mutation event:', error);
      // Negative acknowledgement - requeue if transient infrastructure fault
      channel.nack(msg, false, false);
    }
  });
};