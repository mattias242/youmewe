import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';
import PreferenceForm from './PreferenceForm';

describe('PreferenceForm', () => {
  const user = userEvent.setup();

  const features = [
    { id: 1, name: 'Free plan' },
    { id: 2, name: 'Encryption' },
  ];
  const participant = { id: 1, name: 'Alice' };

  it('shows participant name', () => {
    render(<PreferenceForm features={features} participant={participant} onSave={() => {}} />);
    expect(screen.getByText(/alice/i)).toBeInTheDocument();
  });

  it('renders each feature', () => {
    render(<PreferenceForm features={features} participant={participant} onSave={() => {}} />);
    expect(screen.getByText('Free plan')).toBeInTheDocument();
    expect(screen.getByText('Encryption')).toBeInTheDocument();
  });

  it('renders rating buttons 1-5 for each feature', () => {
    render(<PreferenceForm features={features} participant={participant} onSave={() => {}} />);
    const ratingButtons = screen.getAllByRole('button', { name: /^[1-5]$/ });
    expect(ratingButtons).toHaveLength(features.length * 5);
  });

  it('highlights selected rating', async () => {
    render(<PreferenceForm features={features} participant={participant} onSave={() => {}} />);
    const threeButtons = screen.getAllByRole('button', { name: '3' });
    await user.click(threeButtons[0]);
    expect(threeButtons[0]).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onSave with weights array on save', async () => {
    const onSave = vi.fn();
    render(<PreferenceForm features={features} participant={participant} onSave={onSave} />);

    const threeButtons = screen.getAllByRole('button', { name: '3' });
    await user.click(threeButtons[0]);

    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(onSave).toHaveBeenCalledWith([
      { featureId: 1, weight: 3 },
      { featureId: 2, weight: 0 },
    ]);
  });
});
