import React from 'react';

export function EmptyState({ onTryExample, onOpenLibrary }) {
  return (
    <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📖</div>
      <h3 style={{ color: '#333', marginBottom: 8 }}>还没有内容</h3>
      <p style={{ marginBottom: 20 }}>输入文字或从词库选择模板开始生成字帖</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button className="btn btn-outline-primary" onClick={onTryExample}>试试示例：静夜思</button>
        <button className="btn btn-outline-secondary" onClick={onOpenLibrary}>从词库选择</button>
      </div>
    </div>
  );
}
