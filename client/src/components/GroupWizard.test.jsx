import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as api from '../api/api';
import GroupWizard from './GroupWizard';

vi.mock('../api/api');

describe('GroupWizard', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(api.createSession).mockResolvedValue({ id: 1, name: 'Weekend crew' });
    vi.mocked(api.getFeatures).mockResolvedValue([
      { id: 1, name: 'Free plan' },
      { id: 2, name: 'Encryption' },
    ]);
    vi.mocked(api.addParticipant).mockImplementation((sessionId, name) =>
      Promise.resolve({ id: Date.now(), session_id: sessionId, name })
    );
  });

  it('renders group name input and start button', () => {
    render(<GroupWizard onComplete={() => {}} />);
    expect(screen.getByPlaceholderText(/group name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
  });

  it('does not call createSession when name is empty', async () => {
    render(<GroupWizard onComplete={() => {}} />);
    await user.click(screen.getByRole('button', { name: /start/i }));
    expect(api.createSession).not.toHaveBeenCalled();
  });

  it('calls createSession with entered name', async () => {
    render(<GroupWizard onComplete={() => {}} />);
    await user.type(screen.getByPlaceholderText(/group name/i), 'Weekend crew');
    await user.click(screen.getByRole('button', { name: /start/i }));
    expect(api.createSession).toHaveBeenCalledWith('Weekend crew');
  });

  it('shows participant step after session creation', async () => {
    render(<GroupWizard onComplete={() => {}} />);
    await user.type(screen.getByPlaceholderText(/group name/i), 'Weekend crew');
    await user.click(screen.getByRole('button', { name: /start/i }));
    await waitFor(() =>
      expect(screen.getByPlaceholderText(/participant name/i)).toBeInTheDocument()
    );
  });

  it('adds a participant to the list', async () => {
    render(<GroupWizard onComplete={() => {}} />);
    await user.type(screen.getByPlaceholderText(/group name/i), 'Weekend crew');
    await user.click(screen.getByRole('button', { name: /start/i }));
    await waitFor(() => screen.getByPlaceholderText(/participant name/i));

    await user.type(screen.getByPlaceholderText(/participant name/i), 'Alice');
    await user.click(screen.getByRole('button', { name: /^add$/i }));

    await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument());
  });

  it('calls onComplete with session and participants on continue', async () => {
    const onComplete = vi.fn();
    render(<GroupWizard onComplete={onComplete} />);

    await user.type(screen.getByPlaceholderText(/group name/i), 'Weekend crew');
    await user.click(screen.getByRole('button', { name: /start/i }));
    await waitFor(() => screen.getByPlaceholderText(/participant name/i));

    await user.type(screen.getByPlaceholderText(/participant name/i), 'Alice');
    await user.click(screen.getByRole('button', { name: /^add$/i }));
    await waitFor(() => screen.getByText('Alice'));

    await user.click(screen.getByRole('button', { name: /continue/i }));

    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        session: { id: 1, name: 'Weekend crew' },
        participants: expect.arrayContaining([
          expect.objectContaining({ name: 'Alice' }),
        ]),
        features: expect.arrayContaining([
          expect.objectContaining({ name: 'Free plan' }),
        ]),
      })
    );
  });

  it('calls onComplete with empty participants on skip', async () => {
    const onComplete = vi.fn();
    render(<GroupWizard onComplete={onComplete} />);

    await user.type(screen.getByPlaceholderText(/group name/i), 'Weekend crew');
    await user.click(screen.getByRole('button', { name: /start/i }));
    await waitFor(() => screen.getByRole('button', { name: /skip/i }));

    await user.click(screen.getByRole('button', { name: /skip/i }));

    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        session: { id: 1, name: 'Weekend crew' },
        participants: [],
      })
    );
  });
});
