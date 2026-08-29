import React from 'react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { Badge } from '../../../shared/components/Badge';

export function InvoiceDetailModal({
  isOpen,
  onClose,
  invoice,
  onDownloadReceipt,
}) {
  if (!isOpen || !invoice) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Invoice Breakdown: ${invoice.id}`}
      subtitle={`Tax invoice issued on ${invoice.date}`}
      maxWidth="480px"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => onDownloadReceipt(invoice)}
            icon={
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" width="14" height="14">
                <path d="M8 2v8m-3-3l3 3 3-3M2 13h12" />
              </svg>
            }
          >
            Download PDF
          </Button>
        </>
      }
    >
      <div className="invoice-tax-modal">
        {/* Top Info Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-3)',
          padding: 'var(--space-3)',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-xs)',
        }}>
          <div>
            <span style={{ color: 'var(--color-text-tertiary)' }}>Billed To:</span>
            <div style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>
              Apex Retail Labs Inc.
            </div>
            <div style={{ color: 'var(--color-text-secondary)' }}>GSTIN: 29ABCDE1234F1Z5</div>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-tertiary)' }}>Payment Status:</span>
            <div style={{ marginTop: '2px' }}>
              <Badge
                variant={
                  invoice.status === 'Paid'
                    ? 'success'
                    : invoice.status === 'Pending'
                    ? 'warning'
                    : 'error'
                }
                size="sm"
                dot
              >
                {invoice.status}
              </Badge>
            </div>
            <div style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Via •••• {invoice.cardLast4 || '4242'}
            </div>
          </div>
        </div>

        {/* Itemized Lines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>
            Line Item Details
          </span>
          <div className="tax-line-item">
            <span>{invoice.description || 'AI-CTO Enterprise Plan (10M Events / 2,500 Actions)'}</span>
            <span>${invoice.subtotal ? invoice.subtotal.toFixed(2) : invoice.amount.toFixed(2)}</span>
          </div>
          <div className="tax-line-item">
            <span>GST / VAT Tax Assessment (18%)</span>
            <span>${invoice.tax ? invoice.tax.toFixed(2) : '0.00'}</span>
          </div>
          {invoice.discount && invoice.discount > 0 && (
            <div className="tax-line-item" style={{ color: 'var(--color-status-success)' }}>
              <span>Promo / Retention Discount</span>
              <span>-${invoice.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="tax-line-item tax-line-item--bold">
            <span>Total Invoiced Amount</span>
            <span>${invoice.total ? invoice.total.toFixed(2) : invoice.amount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
