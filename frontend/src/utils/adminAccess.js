const permissions = {
  '/admin/dashboard': ['superadmin', 'admin'],
  '/admin/orders': ['superadmin', 'admin', 'staff'],
  '/admin/products': ['superadmin', 'admin'],
  '/admin/categories': ['superadmin', 'admin'],
  '/admin/inventory': ['superadmin', 'admin'],
  '/admin/promotions': ['superadmin', 'admin'],
  '/admin/notifications': ['superadmin', 'admin'],
  '/admin/reports': ['superadmin', 'admin'],
  '/admin/statistics': ['superadmin', 'admin'],
  '/admin/settings': ['superadmin'],
  '/admin/users': ['superadmin']
};

export const canAccessAdminPath = (role, path) => {
  const routePath = path.split('?')[0].replace(/\/$/, '') || '/';
  return Boolean(role && permissions[routePath]?.includes(role));
};

export const getDefaultAdminPath = (role) => role === 'staff' ? '/admin/orders' : '/admin/dashboard';
