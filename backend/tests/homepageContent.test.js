const Configuration = require('../models/Configuration');

describe('editable homepage content', () => {
  it('stores editable title and description for the homepage story section', () => {
    expect(Configuration.schema.path('siteSettings.homepageAboutTitle')).toBeDefined();
    expect(Configuration.schema.path('siteSettings.homepageAboutDescription')).toBeDefined();
  });

  it('stores editable banner settings for the products page', () => {
    expect(Configuration.schema.path('siteSettings.productsBannerImage')).toBeDefined();
    expect(Configuration.schema.path('siteSettings.productsBannerTitle')).toBeDefined();
    expect(Configuration.schema.path('siteSettings.productsBannerSubtitle')).toBeDefined();
    expect(Configuration.schema.path('siteSettings.promotionsBannerImage')).toBeDefined();
    expect(Configuration.schema.path('siteSettings.promotionsBannerTitle')).toBeDefined();
    expect(Configuration.schema.path('siteSettings.promotionsBannerSubtitle')).toBeDefined();
    expect(Configuration.schema.path('siteSettings.contactBannerImage')).toBeDefined();
    expect(Configuration.schema.path('siteSettings.contactBannerTitle')).toBeDefined();
    expect(Configuration.schema.path('siteSettings.contactBannerSubtitle')).toBeDefined();
    expect(Configuration.schema.path('siteSettings.homepageHeroImage')).toBeDefined();
  });
});
