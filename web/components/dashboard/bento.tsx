import styles from './bento.module.css';
import Link from 'next/link';
import { ReactNode } from 'react';

export function DashboardHeader({ title, subtitle }: { title: string, subtitle?: string }) {
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  );
}

export function BentoGrid({ children }: { children: ReactNode }) {
  return <div className={styles.bentoGrid}>{children}</div>;
}

export function BentoCard({ 
  title, 
  value, 
  icon, 
  isFull = false, 
  actionHref, 
  actionText,
  children 
}: { 
  title: string, 
  value?: string | number, 
  icon: string, 
  isFull?: boolean, 
  actionHref?: string, 
  actionText?: string,
  children?: ReactNode 
}) {
  return (
    <div className={`${styles.card} ${isFull ? styles.fullWidth : ''}`}>
      <div className={styles.cardTitle}>
        <span>{icon}</span> {title}
      </div>
      {value !== undefined && <div className={styles.cardValue}>{value}</div>}
      {children}
      {actionHref && actionText && (
        <Link href={actionHref} className={styles.actionBtn}>
          {actionText}
        </Link>
      )}
    </div>
  );
}
