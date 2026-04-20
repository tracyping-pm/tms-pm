import React from 'react';

export function formatAmount(value: number, showSign = true): React.ReactNode {
  const absValue = Math.abs(value);
  const formatted = absValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (value > 0) return <span className="amount-positive">{showSign ? '+' : ''}{formatted}</span>;
  if (value < 0) return <span className="amount-negative">{formatted}</span>;
  return <span className="amount-zero">{formatted}</span>;
}

export function AmountCell({ value, className = '' }: { value: number; className?: string }) {
  const absValue = Math.abs(value);
  const formatted = absValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  let colorClass = 'amount-zero';
  if (value > 0) colorClass = 'amount-positive';
  else if (value < 0) colorClass = 'amount-negative';
  return (
    <td className={`num amount ${colorClass} ${className}`}>
      {value > 0 ? '+' : value < 0 ? '-' : ''}{formatted}
    </td>
  );
}

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}
export function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <div className="empty-state-title">{title}</div>
      {description && <div className="empty-state-desc">{description}</div>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}

interface LoadingStateProps {
  text?: string;
}
export function LoadingState({ text = 'Loading' }: LoadingStateProps) {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner" />
      <div className="loading-text">{text}<span className="loading-dots" /></div>
    </div>
  );
}

interface SkeletonProps {
  rows?: number;
  cols?: number;
}
export function SkeletonTable({ rows = 5, cols = 4 }: SkeletonProps) {
  return (
    <div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-table-row">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="skeleton-cell" style={{ flex: j === 0 ? 2 : 1 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonText({ width = 'full' }: { width?: 'short' | 'medium' | 'full' }) {
  return <div className={`skeleton skeleton-text ${width}`} />;
}

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}
export function FormField({ label, required = false, error, children, className = '' }: FormFieldProps) {
  return (
    <div className={`form-field ${required ? 'required' : ''} ${error ? 'has-error' : ''} ${className}`}>
      <label className="form-label">{label}</label>
      {children}
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}
export function Tooltip({ content, children }: TooltipProps) {
  return (
    <span className="tooltip-wrapper">
      {children}
      <span className="tooltip-content">{content}</span>
    </span>
  );
}

interface BadgeCountProps {
  count: number;
  variant?: 'default' | 'green' | 'blue';
}
export function BadgeCount({ count, variant = 'default' }: BadgeCountProps) {
  if (count <= 0) return null;
  return <span className={`badge-count ${variant}`}>{count > 99 ? '99+' : count}</span>;
}

interface StatusDotProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'default';
  label?: string;
}
export function StatusDot({ status, label }: StatusDotProps) {
  return (
    <span>
      <span className={`status-dot ${status}`} />
      {label && <span>{label}</span>}
    </span>
  );
}

interface TableContainerProps {
  children: React.ReactNode;
  stickyHeader?: boolean;
  maxHeight?: string;
}
export function TableContainer({ children, stickyHeader = false, maxHeight }: TableContainerProps) {
  return (
    <div className="table-container" style={maxHeight ? { maxHeight } : undefined}>
      <table className={`data-table ${stickyHeader ? 'sticky-header' : ''}`}>
        {children}
      </table>
    </div>
  );
}

interface RowActionsProps {
  actions: Array<{
    label: string;
    onClick: () => void;
    danger?: boolean;
  }>;
}
export function RowActions({ actions }: RowActionsProps) {
  return (
    <div className="row-actions">
      {actions.map((action, i) => (
        <button
          key={i}
          className="row-action-btn"
          style={action.danger ? { color: '#ff4d4f' } : undefined}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}

interface CardProps {
  children: React.ReactNode;
  hoverable?: boolean;
  className?: string;
  onClick?: () => void;
}
export function Card({ children, hoverable = false, className = '', onClick }: CardProps) {
  return (
    <div
      className={`vp-card ${hoverable ? 'hoverable' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
