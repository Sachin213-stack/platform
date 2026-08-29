import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardBody } from '../../../shared/components/Card';
import { Badge } from '../../../shared/components/Badge';
import { Button } from '../../../shared/components/Button';
import { EmptyState } from '../../../shared/components/EmptyState';

export function BillingHistory({
  invoices = [],
  onDownloadInvoice,
  onDownloadAllInvoices,
  onRetryPayment,
  onViewInvoiceDetail,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'paid' | 'pending' | 'failed'
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  // Filter invoices by search and status
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.date.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || inv.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, statusFilter]);

  const handleDownloadAll = async () => {
    setIsDownloadingAll(true);
    await onDownloadAllInvoices(filteredInvoices);
    setIsDownloadingAll(false);
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return <Badge variant="success" size="sm" dot>Paid</Badge>;
      case 'pending':
        return <Badge variant="warning" size="sm" dot>Pending</Badge>;
      case 'failed':
        return <Badge variant="error" size="sm" dot>Failed</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  return (
    <Card padding="normal">
      <CardHeader
        title="Invoices & Payment History"
        subtitle="Download receipts, track billing statuses, and view tax breakdown line items"
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownloadAll}
            loading={isDownloadingAll}
            disabled={filteredInvoices.length === 0}
            icon={
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" width="14" height="14">
                <path d="M8 2v8m-3-3l3 3 3-3M2 13h12" />
              </svg>
            }
          >
            Download All ({filteredInvoices.length})
          </Button>
        }
      />

      <CardBody>
        {/* Controls Bar: Search & Status Filters */}
        <div className="invoice-controls-bar">
          <div className="invoice-search-filter">
            <input
              type="text"
              placeholder="Search by invoice ID (e.g. INV-2026-08) or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="invoice-status-filters">
            {['all', 'paid', 'pending', 'failed'].map((st) => (
              <button
                key={st}
                type="button"
                className={`invoice-filter-pill ${statusFilter === st ? 'invoice-filter-pill--active' : ''}`}
                onClick={() => setStatusFilter(st)}
              >
                {st.charAt(0).toUpperCase() + st.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Invoice Table */}
        {filteredInvoices.length === 0 ? (
          <EmptyState
            title="No Invoices Found"
            description={
              searchQuery || statusFilter !== 'all'
                ? 'No invoices match your current search or status filter criteria.'
                : 'No invoice transactions recorded on this workspace yet.'
            }
            actionLabel={searchQuery || statusFilter !== 'all' ? 'Reset Filters' : undefined}
            onAction={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
          />
        ) : (
          <div className="invoices-table-container">
            <table className="invoices-table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Billing Date</th>
                  <th>Plan & Scope</th>
                  <th>Subtotal</th>
                  <th>Tax (GST/VAT)</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="invoice-id-cell">{inv.id}</td>
                    <td>{inv.date}</td>
                    <td>
                      <div>{inv.description}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                        Via •••• {inv.cardLast4 || '4242'}
                      </div>
                    </td>
                    <td>${inv.subtotal?.toFixed(2) || inv.amount?.toFixed(2)}</td>
                    <td>${inv.tax?.toFixed(2) || '0.00'}</td>
                    <td style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>
                      ${inv.total?.toFixed(2) || inv.amount?.toFixed(2)}
                    </td>
                    <td>{getStatusBadge(inv.status)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewInvoiceDetail(inv)}
                          title="View tax and line item breakdown"
                        >
                          Details
                        </Button>

                        {inv.status.toLowerCase() === 'failed' ? (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => onRetryPayment(inv)}
                          >
                            Retry Payment
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onDownloadInvoice(inv)}
                            title="Download PDF receipt"
                          >
                            PDF ⇣
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
