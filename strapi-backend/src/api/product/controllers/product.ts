import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::product.product', ({ strapi }) => ({
  async create(ctx) {
    const result = await super.create(ctx);
    strapi.eventHub.emit('product.created', result);
    return result;
  },

  async update(ctx) {
    const result = await super.update(ctx);
    strapi.eventHub.emit('product.updated', result);
    return result;
  },

  async delete(ctx) {
    const result = await super.delete(ctx);
    strapi.eventHub.emit('product.deleted', result);
    return result;
  }
}));
