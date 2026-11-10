const User = require('../models/User');
const authRoutes = require('../routes/authRoutes');
const userRoutes = require('../routes/userRoutes');
const { protect, isAdmin, isSuperAdmin } = require('../middleware/authMiddleware');
const orderRoutes = require('../routes/orderRoutes');

const handlersFor = (router, path, method) => {
  const route = router.stack.find(layer => layer.route?.path === path && layer.route.methods[method]);
  return route ? route.route.stack.map(layer => layer.handle) : [];
};

describe('superadmin and staff roles', () => {
  it('supports a dedicated superadmin role in user records', () => {
    expect(User.schema.path('role').enumValues).toContain('superadmin');
  });

  it('defaults newly created accounts to the least privileged staff role', () => {
    expect(User.schema.path('role').defaultValue).toBe('staff');
  });

  it('lets superadmins perform administrator operations', () => {
    const req = { user: { role: 'superadmin' } };
    const next = jest.fn();
    isAdmin(req, { status: jest.fn().mockReturnThis(), json: jest.fn() }, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('allows only superadmins to register or manage staff accounts', () => {
    expect(handlersFor(authRoutes, '/register', 'post')).toEqual([protect, isSuperAdmin, expect.any(Function)]);
    expect(handlersFor(userRoutes, '/all', 'get')).toEqual([protect, isSuperAdmin, expect.any(Function)]);
  });

  it.each([['patch', '/:id'], ['delete', '/:id']])('protects staff account %s operations', (method, path) => {
    expect(handlersFor(userRoutes, path, method)).toEqual([protect, isSuperAdmin, expect.any(Function)]);
  });

  it('allows staff to read orders and update their status', () => {
    expect(handlersFor(orderRoutes, '/', 'get').length).toBe(3);
    expect(handlersFor(orderRoutes, '/', 'get')[1].name).toBe('staffOrAdmin');
    expect(handlersFor(orderRoutes, '/:id/status', 'patch')[1].name).toBe('staffOrAdmin');
    expect(handlersFor(orderRoutes, '/:id/payment', 'patch')[1]).toBe(isAdmin);
  });
});
