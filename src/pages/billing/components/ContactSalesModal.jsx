import React, { useState } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';

export function ContactSalesModal({
  isOpen,
  onClose,
  onSubmitInquiry,
}) {
  const [formData, setFormData] = useState({
    name: 'Alex Vance',
    email: 'alex.vance@apexretail.io',
    company: 'Apex Retail Labs Inc.',
    teamSize: '50-200 engineers',
    customMessage: 'We are looking for dedicated FRIDAY AI agent concurrency and custom on-prem / VPC telemetry ingest pipelines.',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    onSubmitInquiry(formData);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Contact Enterprise Sales & Architecture"
      subtitle="Tailored SLAs, custom telemetry ingest clusters, and private VPC deployment models."
      maxWidth="500px"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={isSubmitting}
          >
            Submit Inquiry
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          <div>
            <label className="field-label">Your Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="field-label">Work Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          <div>
            <label className="field-label">Company Name</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="field-label">Engineering Size</label>
            <select
              value={formData.teamSize}
              onChange={(e) => handleChange('teamSize', e.target.value)}
            >
              <option value="1-10 engineers">1 - 10 engineers</option>
              <option value="10-50 engineers">10 - 50 engineers</option>
              <option value="50-200 engineers">50 - 200 engineers</option>
              <option value="200+ engineers">200+ enterprise scale</option>
            </select>
          </div>
        </div>

        <div>
          <label className="field-label">Architecture / Deployment Requirements</label>
          <textarea
            rows={3}
            value={formData.customMessage}
            onChange={(e) => handleChange('customMessage', e.target.value)}
            placeholder="Describe your throughput scale, custom SLAs, or VPC requirements..."
            required
          />
        </div>
      </form>
    </Modal>
  );
}
