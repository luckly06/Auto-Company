import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { MeetingInput } from '@/components/MeetingInput';

describe('MeetingInput', () => {
  it('keeps submit disabled for empty input', () => {
    render(<MeetingInput isLoading={false} onSubmit={vi.fn()} />);

    expect(screen.getByRole('button', { name: /extract action items/i })).toBeDisabled();
  });

  it('trims meeting notes before submitting', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<MeetingInput isLoading={false} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/meeting notes/i), {
      target: { value: '  Alice will send the recap by Friday.  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: /extract action items/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith('Alice will send the recap by Friday.');
    });
  });
});
