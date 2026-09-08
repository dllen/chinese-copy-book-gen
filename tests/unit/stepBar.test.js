import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StepBar from '../../src/components/StepBar';

const STEPS = ['选内容', '选样式', '生成字帖'];

describe('StepBar', () => {
  it('renders all step labels', () => {
    render(<StepBar steps={STEPS} currentStep={0} />);
    STEPS.forEach((s) => expect(screen.getByText(s)).toBeTruthy());
  });

  it('highlights current step', () => {
    render(<StepBar steps={STEPS} currentStep={1} />);
    const step1 = screen.getByText('选样式').closest('.step-item');
    expect(step1.classList.contains('active')).toBe(true);
  });

  it('calls onStepClick when step is clicked', () => {
    const onStepClick = vi.fn();
    render(<StepBar steps={STEPS} currentStep={2} onStepClick={onStepClick} />);
    fireEvent.click(screen.getByText('选内容'));
    expect(onStepClick).toHaveBeenCalledWith(0);
  });

  it('marks completed steps', () => {
    render(<StepBar steps={STEPS} currentStep={2} />);
    const step0 = screen.getByText('选内容').closest('.step-item');
    expect(step0.classList.contains('completed')).toBe(true);
  });
});
