import React from 'react';

export const facilityComparisonStyles: Record<string, React.CSSProperties> = {
    section: {
        padding: '24px',
        backgroundColor: '#f8fafc',
    },
    headerBlock: {
        maxWidth: '1100px',
        margin: '0 auto 20px auto',
    },
    title: {
        margin: '0 0 8px 0',
        fontSize: '2rem',
        color: '#0f172a',
    },
    description: {
        margin: 0,
        color: '#475569',
        fontSize: '1rem',
    },
    selectorCard: {
        maxWidth: '1100px',
        margin: '0 auto 20px auto',
        backgroundColor: '#ffffff',
        border: '1px solid #dbeafe',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
    },
    selectorTitle: {
        margin: '0 0 16px 0',
        fontSize: '1.1rem',
        color: '#0f172a',
    },
    checkboxGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '12px',
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: '#1e293b',
    },
    messageCard: {
        maxWidth: '1100px',
        margin: '0 auto 20px auto',
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '12px',
        padding: '16px',
        color: '#334155',
    },
    errorCard: {
        maxWidth: '1100px',
        margin: '0 auto 20px auto',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '12px',
        padding: '16px',
        color: '#991b1b',
    },
    chartCard: {
        maxWidth: '1100px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        border: '1px solid #dbeafe',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
    },
};
