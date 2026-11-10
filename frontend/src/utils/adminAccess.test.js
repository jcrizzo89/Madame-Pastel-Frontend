const { canAccessAdminPath, getDefaultAdminPath } = require('./adminAccess');

describe('admin screen permissions', () => {
  it('allows staff to work with orders and dashboard only', () => {
    expect(canAccessAdminPath('staff', '/admin/orders')).toBe(true);
    expect(canAccessAdminPath('staff', '/admin/dashboard')).toBe(false);
    expect(canAccessAdminPath('staff', '/admin/products')).toBe(false);
    expect(getDefaultAdminPath('staff')).toBe('/admin/orders');
  });

  it('reserves team and store settings for superadmins', () => {
    expect(canAccessAdminPath('admin', '/admin/users')).toBe(false);
    expect(canAccessAdminPath('admin', '/admin/settings')).toBe(false);
    expect(canAccessAdminPath('superadmin', '/admin/users')).toBe(true);
    expect(canAccessAdminPath('superadmin', '/admin/settings')).toBe(true);
  });
});
