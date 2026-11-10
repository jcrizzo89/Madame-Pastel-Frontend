// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';

// Polyfill / Mock for react-router-dom v7 with Create React App Jest runner
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => children,
  Routes: ({ children }) => children,
  Route: ({ element }) => element,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/' }),
  useParams: () => ({})
}), { virtual: true });
