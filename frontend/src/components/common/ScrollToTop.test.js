import React from 'react';
import { render } from '@testing-library/react';
import ScrollToTop from './ScrollToTop';

let mockLocation = { pathname: '/' };

jest.mock('react-router-dom', () => ({
  useLocation: () => mockLocation,
  MemoryRouter: ({ children }) => children,
  useNavigate: () => jest.fn()
}));

describe('ScrollToTop component', () => {
  beforeEach(() => {
    window.scrollTo = jest.fn();
    mockLocation = { pathname: '/' };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('scrolls to top (0, 0) on initial render and on route change', () => {
    const { rerender } = render(<ScrollToTop />);

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: 'instant'
    });

    // Simular cambio de ruta
    mockLocation = { pathname: '/productos' };
    rerender(<ScrollToTop />);

    expect(window.scrollTo).toHaveBeenCalledTimes(2);
  });
});
