import React, { useState } from 'react';
import { Card } from '../../shared/components/Card';
import { Badge } from '../../shared/components/Badge';
import { Button } from '../../shared/components/Button';

export default function FridayAIPage({ initialContext, onNavigate }) {
  const [messages, setMessages] = useState(() => {
    const base = [
      {
        id: 'm1',
        sender: 'friday',
        time: '18:24',
        text: 'Good evening. I am monitoring all microservice telemetry, edge TLS handshakes, and autonomous incident mitigations. How can I assist you with infrastructure operations?',
      },
    ];

    if (initialContext?.initialPrompt) {
      base.push(
        {
          id: 'm-init-user',
          sender: 'user',
          time: 'Just now',
          text: initialContext.initialPrompt,
        },
        {
          id: 'm-init-ai',
          sender: 'friday',
          time: 'Just now',
          text: `Analyzing active incident for ${initialContext.context?.service || 'service'}: \n\n1. Primary root cause: High Redis session lock contention during checkout p99 spikes.\n2. Autonomous recommendation: Scale checkout-v2 deployment from 4 to 8 replicas and apply memory cache tier.\n3. Rollback risk: Negligible (< 0.1%). Zero downtime guaranteed via rolling update.`,
        }
      );
    }
    return base;
  });

  const [inputVal, setInputVal] = useState('');

  const handleSend = () => {
    if (!inputVal.trim()) return;
    const userMsg = {
      id: `m-${Date.now()}`,
      sender: 'user',
      time: 'Just now',
      text: inputVal,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');

    setTimeout(() => {
      const aiReply = {
        id: `m-ai-${Date.now()}`,
        sender: 'friday',
        time: 'Just now',
        text: 'Analyzing cluster state across Kubernetes pods. All ingress nodes are healthy and error budgets are within nominal limits.',
      };
      setMessages((prev) => [...prev, aiReply]);
    }, 600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxWidth: '900px', margin: '0 auto', animation: 'dashboardFadeIn 280ms cubic-bezier(0.16, 1, 0.3, 1)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', color: 'var(--color-text-primary)' }}>
            FRIDAY AI Ops Assistant
          </h2>
          <Badge variant="violet" size="sm" dot>Autonomous Agent Online</Badge>
        </div>
        <Button variant="secondary" size="sm" onClick={() => onNavigate && onNavigate('dashboard')}>
          ← Back to Operations Dashboard
        </Button>
      </div>

      {/* Chat Card */}
      <Card padding="normal" style={{ minHeight: '440px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', overflowY: 'auto', marginBottom: 'var(--space-4)' }}>
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                background: m.sender === 'user' ? 'rgba(139, 92, 246, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${m.sender === 'user' ? 'var(--color-accent-border)' : 'var(--color-border-subtle)'}`,
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--text-sm)',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', fontSize: '10px', color: 'var(--color-text-tertiary)' }}>
                <span style={{ fontWeight: 'bold', color: m.sender === 'user' ? 'var(--color-accent-light)' : '#a855f7' }}>
                  {m.sender === 'user' ? 'You' : 'FRIDAY AI'}
                </span>
                <span>{m.time}</span>
              </div>
              {m.text}
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <input
            type="text"
            placeholder="Ask FRIDAY AI about cluster health, query anomalies, or trigger mitigations..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-2) var(--space-3)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--text-sm)',
            }}
          />
          <Button variant="primary" size="md" onClick={handleSend}>
            Send Message
          </Button>
        </div>
      </Card>
    </div>
  );
}
