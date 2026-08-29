import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'primary'
  requireText, // If provided, user must type this exact string to confirm
  requireTextLabel,
  loading = false,
}) {
  const [typedText, setTypedText] = useState('');

  const handleClose = () => {
    setTypedText('');
    onClose();
  };

  const handleConfirm = () => {
    setTypedText('');
    if (onConfirm) {
      onConfirm();
    }
  };

  const isConfirmedDisabled = requireText ? typedText.trim() !== requireText.trim() : false;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      maxWidth="460px"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant}
            onClick={handleConfirm}
            disabled={isConfirmedDisabled}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', lineHeight: '1.5' }}>
          {message}
        </p>

        {requireText && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--weight-medium)',
                color: 'var(--color-text-primary)',
              }}
            >
              {requireTextLabel || (
                <>
                  Type <strong style={{ color: 'var(--color-status-error)' }}>{requireText}</strong> to confirm:
                </>
              )}
            </label>
            <input
              type="text"
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              placeholder={`Enter "${requireText}"`}
              autoFocus
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
