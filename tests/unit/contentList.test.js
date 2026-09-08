import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ContentList from '../../src/components/ContentList';

const CONTENTS = [
  { id: 'c1', title: '天地人', characters: ['天', '地', '人'] },
  { id: 'c2', title: '口耳目手足', characters: ['口', '耳', '目'] },
];

describe('ContentList', () => {
  it('renders content items', () => {
    render(<ContentList contents={CONTENTS} onSelect={() => {}} />);
    expect(screen.getByText('天地人')).toBeTruthy();
    expect(screen.getByText('口耳目手足')).toBeTruthy();
  });

  it('calls onSelect with content item', () => {
    const onSelect = vi.fn();
    render(<ContentList contents={CONTENTS} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('天地人'));
    expect(onSelect).toHaveBeenCalledWith(CONTENTS[0]);
  });

  it('renders search input when onSearch provided', () => {
    render(<ContentList contents={CONTENTS} onSelect={() => {}} onSearch={() => {}} />);
    expect(screen.getByPlaceholderText(/搜索/)).toBeTruthy();
  });

  it('calls onSearch when typing', () => {
    const onSearch = vi.fn();
    render(<ContentList contents={CONTENTS} onSelect={() => {}} onSearch={onSearch} />);
    fireEvent.change(screen.getByPlaceholderText(/搜索/), { target: { value: '天地' } });
    expect(onSearch).toHaveBeenCalledWith('天地');
  });
});
