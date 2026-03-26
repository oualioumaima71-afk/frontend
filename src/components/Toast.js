import React from 'react';

function Toast({ message, type = 'success' }) {
  if (!message) return null;
  
  return (
    <div className={`toast ${type}`}>
      <span style={{ fontSize: '18px' }}>
        {type === 'success' ? '✅' : '❌'}
      </span>
      <span>{message}</span>
    </div>
  );
}

export default Toast;
