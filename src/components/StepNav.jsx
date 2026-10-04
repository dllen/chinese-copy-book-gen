import React from 'react';

/**
 * 步骤底部导航 — 上一步 / 下一步 + 当前步骤提示
 * 让三步流程有明确的推进与回退入口，而不是只能点击顶部步骤条。
 */
export default function StepNav({ currentStep, steps, hint, onPrev, onNext }) {
  const isFirst = currentStep <= 0;
  const isLast = currentStep >= steps.length - 1;

  return (
    <div className="step-nav no-print" role="group" aria-label="步骤操作">
      <p className="step-nav-hint" aria-live="polite">{hint}</p>
      <div className="step-nav-actions">
        <button
          type="button"
          className="builder-btn builder-btn-secondary"
          onClick={onPrev}
          disabled={isFirst}
        >
          ← 上一步
        </button>
        {!isLast && (
          <button
            type="button"
            className="builder-btn builder-btn-primary"
            onClick={onNext}
          >
            下一步：{steps[currentStep + 1]} →
          </button>
        )}
      </div>
    </div>
  );
}
