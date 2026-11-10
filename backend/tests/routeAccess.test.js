const authRoutes = require('../routes/authRoutes');
jest.mock('../services/emailService', () => ({}));
const inventoryRoutes = require('../routes/inventoryRoutes');
const orderRoutes = require('../routes/orderRoutes');
const paymentRoutes = require('../routes/paymentRoutes');
const productRoutes = require('../routes/productRoutes');
const notificationRoutes = require('../routes/notificationRoutes');
const { protect, isAdmin, isSuperAdmin, isStaffOrAdmin } = require('../middleware/authMiddleware');

const registeredHandlers = (router, path, method) => {
  const routeLayer = router.stack.find(layer => (
    layer.route?.path === path && layer.route.methods[method]
  ));
  if (!routeLayer || !routeLayer.route.methods[method]) return [];
  return routeLayer.route.stack.map(layer => layer.handle);
};

describe('Administrative route access', () => {
  it('requires a superadmin to register another team account', () => {
    const handlers = registeredHandlers(authRoutes, '/register', 'post');

    expect(handlers).toEqual([protect, isSuperAdmin, expect.any(Function)]);
  });

  it.each([
    ['post', '/'],
    ['put', '/:id'],
    ['delete', '/:id']
  ])('requires an administrator for product %s', (method, path) => {
    const handlers = registeredHandlers(productRoutes, path, method);

    expect(handlers).toHaveLength(3);
    expect(handlers[0]).toBe(protect);
    expect(handlers[1]).toBe(isAdmin);
  });

  it.each([
    ['/update', 'post'],
    ['/restock', 'post'],
    ['/sync-all', 'post']
  ])('requires an administrator for inventory %s', (path, method) => {
    const handlers = registeredHandlers(inventoryRoutes, path, method);

    expect(handlers).toHaveLength(3);
    expect(handlers[0]).toBe(protect);
    expect(handlers[1]).toBe(isAdmin);
  });

  it('requires an administrator to cancel an order', () => {
    const handlers = registeredHandlers(orderRoutes, '/:id/cancel', 'patch');

    expect(handlers).toHaveLength(3);
    expect(handlers[0]).toBe(protect);
    expect(handlers[1]).toBe(isAdmin);
  });

  it('allows staff to view an individual order', () => {
    const handlers = registeredHandlers(orderRoutes, '/:id', 'get');
    expect(handlers).toHaveLength(3);
    expect(handlers[0]).toBe(protect);
    expect(handlers[1]).toBe(isStaffOrAdmin);
  });

  it('requires an administrator to confirm a bank transfer', () => {
    const handlers = registeredHandlers(paymentRoutes, '/transfer/confirm/:orderId', 'patch');

    expect(handlers).toHaveLength(3);
    expect(handlers[0]).toBe(protect);
    expect(handlers[1]).toBe(isAdmin);
  });

  it.each([
    ['/test-email', 'post'],
    ['/send-promotion', 'post'],
    ['/order-notification', 'post']
  ])('requires an administrator for notification %s', (path, method) => {
    const handlers = registeredHandlers(notificationRoutes, path, method);

    expect(handlers[0]).toBe(protect);
    expect(handlers[1]).toBe(isAdmin);
  });
});
