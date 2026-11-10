const Configuration = require('../models/Configuration');

describe('editable homepage content', () => {
  it('stores editable title and description for the homepage story section', () => {
    expect(Configuration.schema.path('siteSettings.homepageAboutTitle')).toBeDefined();
    expect(Configuration.schema.path('siteSettings.homepageAboutDescription')).toBeDefined();
  });
});
