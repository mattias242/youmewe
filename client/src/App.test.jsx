import { render, screen, act } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import App from './App';

vi.mock('./api/api');
vi.mock('./components/GroupWizard', () => ({
  default: ({ onComplete }) => <button onClick={() => onComplete({ session: { id: 1 }, participants: [], features: [] })}>MockWizard</button>,
}));
vi.mock('./components/ResultsPage', () => ({
  default: () => <div>MockResults</div>,
}));

describe('App', () => {
  it('renders GroupWizard initially', () => {
    render(<App />);
    expect(screen.getByText('MockWizard')).toBeInTheDocument();
  });

  it('shows ResultsPage after wizard completes with no participants', async () => {
    render(<App />);
    await act(async () => {
      screen.getByText('MockWizard').click();
    });
    expect(screen.getByText('MockResults')).toBeInTheDocument();
  });
});
