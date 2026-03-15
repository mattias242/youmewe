import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as api from '../api/api';
import ResultsPage from './ResultsPage';

vi.mock('../api/api');

describe('ResultsPage', () => {
  const mockRecommendations = [
    {
      app: { id: 1, name: 'Signal', description: 'Encrypted messaging', website_url: 'https://signal.org' },
      score: 95,
    },
    {
      app: { id: 2, name: 'Telegram', description: 'Fast messaging', website_url: 'https://telegram.org' },
      score: 80,
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(api.getRecommendations).mockResolvedValue(mockRecommendations);
  });

  it('shows loading state initially', () => {
    render(<ResultsPage sessionId={1} />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('fetches recommendations with correct sessionId', () => {
    render(<ResultsPage sessionId={42} />);
    expect(api.getRecommendations).toHaveBeenCalledWith(42);
  });

  it('renders app names after loading', async () => {
    render(<ResultsPage sessionId={1} />);
    await waitFor(() => expect(screen.getByText('Signal')).toBeInTheDocument());
    expect(screen.getByText('Telegram')).toBeInTheDocument();
  });

  it('shows score for each recommendation', async () => {
    render(<ResultsPage sessionId={1} />);
    await waitFor(() => expect(screen.getByText('95')).toBeInTheDocument());
    expect(screen.getByText('80')).toBeInTheDocument();
  });

  it('shows app descriptions', async () => {
    render(<ResultsPage sessionId={1} />);
    await waitFor(() =>
      expect(screen.getByText('Encrypted messaging')).toBeInTheDocument()
    );
  });

  it('shows error message on fetch failure', async () => {
    vi.mocked(api.getRecommendations).mockRejectedValue(new Error('Server error'));
    render(<ResultsPage sessionId={1} />);
    await waitFor(() =>
      expect(screen.getByText(/server error/i)).toBeInTheDocument()
    );
  });
});
