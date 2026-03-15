import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as api from '../api/api';
import JoinFlow from './JoinFlow';

vi.mock('../api/api');

const mockSession = { id: 1, name: 'Fredagsgänget', share_code: 'ABC123' };
const mockApps = [
  { id: 1, name: 'Signal', description: 'Privacy first', website_url: 'https://signal.org' },
  { id: 2, name: 'Telegram', description: 'Feature rich', website_url: 'https://telegram.org' },
];

describe('JoinFlow', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(api.getSessionByCode).mockResolvedValue(mockSession);
    vi.mocked(api.getApps).mockResolvedValue(mockApps);
    vi.mocked(api.addParticipant).mockResolvedValue({ id: 10, name: 'Alice', session_id: 1 });
    vi.mocked(api.saveParticipantApps).mockResolvedValue({ ok: true });
  });

  it('shows group name after loading', async () => {
    render(<JoinFlow joinCode="ABC123" />);
    await waitFor(() =>
      expect(screen.getByText('Fredagsgänget')).toBeInTheDocument()
    );
  });

  it('shows name input and continue button', async () => {
    render(<JoinFlow joinCode="ABC123" />);
    await waitFor(() => screen.getByPlaceholderText(/ditt namn/i));
    expect(screen.getByRole('button', { name: /fortsätt/i })).toBeInTheDocument();
  });

  it('advances to app selection after entering name', async () => {
    render(<JoinFlow joinCode="ABC123" />);
    await waitFor(() => screen.getByPlaceholderText(/ditt namn/i));
    await user.type(screen.getByPlaceholderText(/ditt namn/i), 'Alice');
    await user.click(screen.getByRole('button', { name: /fortsätt/i }));
    await waitFor(() =>
      expect(screen.getByText('Signal')).toBeInTheDocument()
    );
    expect(screen.getByText('Telegram')).toBeInTheDocument();
  });

  it('toggles app selection', async () => {
    render(<JoinFlow joinCode="ABC123" />);
    await waitFor(() => screen.getByPlaceholderText(/ditt namn/i));
    await user.type(screen.getByPlaceholderText(/ditt namn/i), 'Alice');
    await user.click(screen.getByRole('button', { name: /fortsätt/i }));
    await waitFor(() => screen.getByText('Signal'));
    const signalBtn = screen.getByRole('button', { name: /signal/i });
    expect(signalBtn).toHaveAttribute('aria-pressed', 'false');
    await user.click(signalBtn);
    expect(signalBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls saveParticipantApps on submit', async () => {
    render(<JoinFlow joinCode="ABC123" />);
    await waitFor(() => screen.getByPlaceholderText(/ditt namn/i));
    await user.type(screen.getByPlaceholderText(/ditt namn/i), 'Alice');
    await user.click(screen.getByRole('button', { name: /fortsätt/i }));
    await waitFor(() => screen.getByText('Signal'));
    await user.click(screen.getByRole('button', { name: /signal/i }));
    await user.click(screen.getByRole('button', { name: /skicka in/i }));
    await waitFor(() =>
      expect(api.saveParticipantApps).toHaveBeenCalledWith(1, 10, [1])
    );
  });

  it('shows confirmation after submit', async () => {
    render(<JoinFlow joinCode="ABC123" />);
    await waitFor(() => screen.getByPlaceholderText(/ditt namn/i));
    await user.type(screen.getByPlaceholderText(/ditt namn/i), 'Alice');
    await user.click(screen.getByRole('button', { name: /fortsätt/i }));
    await waitFor(() => screen.getByText('Signal'));
    await user.click(screen.getByRole('button', { name: /skicka in/i }));
    await waitFor(() =>
      expect(screen.getByText(/tack/i)).toBeInTheDocument()
    );
  });
});
