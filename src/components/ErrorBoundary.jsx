import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: 'center', fontFamily: 'system-ui' }}>
          <h2 style={{ color: '#dc3545' }}>应用出错</h2>
          <p style={{ color: '#666', margin: '16px 0' }}>抱歉，遇到了一些问题，请尝试刷新页面</p>
          <button
            onClick={() => { this.setState({ hasError: false }); location.reload(); }}
            style={{ padding: '8px 24px', background: '#0d6efd', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 15 }}
          >
            刷新页面
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
