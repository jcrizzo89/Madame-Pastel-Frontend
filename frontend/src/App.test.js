import React from 'react';
import { render, screen } from '@testing-library/react';

describe('Frontend Sanity and Environment Suite', () => {
  it('validates test runner environment and DOM matchers', () => {
    render(
      <header className="header">
        <h1>Madame Pastel</h1>
        <p>Pastelería Artesanal</p>
      </header>
    );

    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('Madame Pastel');
  });
});
