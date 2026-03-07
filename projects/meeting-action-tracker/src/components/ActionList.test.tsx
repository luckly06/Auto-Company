import React from 'react';
import { render, screen } from '@testing-library/react';

import { ActionList } from '@/components/ActionList';
import type { ActionItem } from '@/lib/action-items';

describe('ActionList', () => {
  it('shows an empty state before extraction', () => {
    render(<ActionList actionItems={[]} summary="" />);

    expect(screen.getByText(/paste meeting notes to see structured action items/i)).toBeInTheDocument();
  });

  it('renders action item details when data exists', () => {
    const actionItems: ActionItem[] = [
      {
        id: 'action-1',
        title: 'Share updated rollout checklist',
        owner: 'Morgan',
        dueDate: '2026-03-12',
        priority: 'high',
        status: 'todo',
        context: 'Needed before customer launch review.',
      },
    ];

    render(<ActionList actionItems={actionItems} summary="Launch plan is on track." />);

    expect(screen.getByText('Share updated rollout checklist')).toBeInTheDocument();
    expect(screen.getByText(/morgan/i)).toBeInTheDocument();
    expect(screen.getByText(/launch plan is on track/i)).toBeInTheDocument();
  });
});
