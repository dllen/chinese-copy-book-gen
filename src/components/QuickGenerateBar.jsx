import React from 'react';

const Icon = ({ children }) => (
  <svg
    aria-hidden="true"
    className="builder-btn-icon"
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

const EyeIcon = () => (
  <Icon>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);

const SparklesIcon = () => (
  <Icon>
    <path d="m12 3 1.6 4.2L18 9l-4.4 1.8L12 15l-1.6-4.2L6 9l4.4-1.8L12 3Z" />
    <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
  </Icon>
);

const PrinterIcon = () => (
  <Icon>
    <path d="M6 9V3h12v6" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
    <path d="M6 14h12v7H6z" />
  </Icon>
);

const FileTextIcon = () => (
  <Icon>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
    <path d="M14 2v6h6" />
    <path d="M8 13h8" />
    <path d="M8 17h6" />
  </Icon>
);

function ActionButton({ icon: IconComponent, label, variant, disabled, onClick }) {
  return (
    <button
      type="button"
      className={`builder-btn builder-btn-${variant}`}
      disabled={disabled}
      onClick={onClick}
    >
      <IconComponent />
      {label}
    </button>
  );
}

export default function QuickGenerateBar({
  onGenerate,
  onPrint,
  onExportPDF,
  onPreview,
  hasContent,
}) {
  return (
    <div className="quick-generate-bar no-print" role="region" aria-label="操作栏">
      <span className="quick-generate-info">
        {hasContent ? '已选内容，可生成字帖' : '请先选择内容'}
      </span>
      {onPreview && (
        <ActionButton
          icon={EyeIcon}
          label="预览"
          variant="secondary"
          disabled={!hasContent}
          onClick={onPreview}
        />
      )}
      <ActionButton
        icon={SparklesIcon}
        label="一键生成字帖"
        variant="primary"
        disabled={!hasContent}
        onClick={onGenerate}
      />
      {onPrint && (
        <ActionButton
          icon={PrinterIcon}
          label="打印"
          variant="secondary"
          onClick={onPrint}
        />
      )}
      {onExportPDF && (
        <ActionButton
          icon={FileTextIcon}
          label="PDF"
          variant="secondary"
          onClick={onExportPDF}
        />
      )}
    </div>
  );
}
