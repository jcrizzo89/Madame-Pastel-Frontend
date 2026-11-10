import { resolveApiUrl } from './constants';

describe('API base URL', () => {
  it('uses the local API path when no backend origin is configured', () => {
    expect(resolveApiUrl('')).toBe('/api');
  });

  it('adds /api to a backend origin', () => {
    expect(resolveApiUrl('https://api.example.com/')).toBe('https://api.example.com/api');
  });

  it('does not duplicate an existing /api suffix', () => {
    expect(resolveApiUrl('https://api.example.com/api/')).toBe('https://api.example.com/api');
  });
});
