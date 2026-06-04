import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type ImmersionCount = {
    label: string;
    count: number;
};

type ProvinceOption = {
    label: string;
    code: string;
};

type TooltipProps = {
    active?: boolean;
    payload?: Array<{
        payload: ImmersionCount;
        value: number;
        name: string;
    }>;
};

const PROVINCES: ProvinceOption[] = [
    { label: 'Ontario', code: 'ON' },
    { label: 'Quebec', code: 'QC' },
    { label: 'Nova Scotia', code: 'NS' },
    { label: 'New Brunswick', code: 'NB' },
    { label: 'Manitoba', code: 'MB' },
    { label: 'British Columbia', code: 'BC' },
    { label: 'Prince Edward Island', code: 'PE' },
    { label: 'Saskatchewan', code: 'SK' },
    { label: 'Alberta', code: 'AB' },
    { label: 'Newfoundland and Labrador', code: 'NL' },
    { label: 'Northwest Territories', code: 'NT' },
    { label: 'Nunavut', code: 'NU' },
    { label: 'Yukon', code: 'YT' },
];

const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626'];

function renderPercentageLabel({
    percent,
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
}: {
    percent?: number;
    cx?: number;
    cy?: number;
    midAngle?: number;
    innerRadius?: number;
    outerRadius?: number;
}) {
    if (
        percent === undefined ||
        cx === undefined ||
        cy === undefined ||
        midAngle === undefined ||
        innerRadius === undefined ||
        outerRadius === undefined
    ) {
        return null;
    }

    if (percent === 0) {
        return null;
    }

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text
            x={x}
            y={y}
            fill="#ffffff"
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
            fontWeight={600}
            fontSize={14}
        >
            {`${(percent * 100).toFixed(1)}%`}
        </text>
    );
}

function CustomTooltip({ active, payload }: TooltipProps) {
    if (!active || !payload || payload.length === 0) {
        return null;
    }

    const item = payload[0];
    const total = payload.reduce((sum, entry) => sum + entry.payload.count, 0);
    const percentage = total > 0 ? ((item.payload.count / total) * 100).toFixed(1) : '0.0';

    return (
        <div style={styles.tooltipCard}>
            <div style={styles.tooltipTitle}>{item.payload.label}</div>
            <div>Count: {item.payload.count}</div>
            <div>Percentage: {percentage}%</div>
        </div>
    );
}

function ImmersionPieChart() {
    const [selectedProvince, setSelectedProvince] = useState<string>('ON');
    const [data, setData] = useState<ImmersionCount[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const selectedProvinceLabel =
        PROVINCES.find((province) => province.code === selectedProvince)?.label ?? selectedProvince;

    useEffect(() => {
        const fetchImmersionData = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(
                    `/api/facilities/immersion-summary?province=${encodeURIComponent(selectedProvince)}`,
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch immersion summary');
                }

                const result: ImmersionCount[] = await response.json();
                setData(result);
            } catch (err) {
                setError('Unable to load immersion summary.');
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchImmersionData();
    }, [selectedProvince]);

    return (
        <section style={styles.section}>
            <div style={styles.headerBlock}>
                <h1 style={styles.title}>French Immersion Summary</h1>
                <p style={styles.description}>
                    View immersion-related facility counts for a selected province or territory.
                </p>
            </div>

            <div style={styles.controlCard}>
                <label htmlFor="province-select" style={styles.label}>
                    Select a province or territory
                </label>
                <select
                    id="province-select"
                    value={selectedProvince}
                    onChange={(event) => setSelectedProvince(event.target.value)}
                    style={styles.select}
                >
                    {PROVINCES.map((province) => (
                        <option key={province.code} value={province.code}>
                            {province.label}
                        </option>
                    ))}
                </select>
            </div>

            {loading && <div style={styles.messageCard}>Loading immersion chart...</div>}
            {error && <div style={styles.errorCard}>{error}</div>}

            {!loading && !error && data.length === 0 && (
                <div style={styles.messageCard}>No immersion data available for this province.</div>
            )}

            {!loading && !error && data.length > 0 && (
                <div style={styles.chartCard}>
                    <h2 style={styles.chartTitle}>{selectedProvinceLabel} Immersion Breakdown</h2>

                    <ResponsiveContainer width="100%" height={420}>
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="count"
                                nameKey="label"
                                cx="50%"
                                cy="50%"
                                outerRadius={130}
                                label={renderPercentageLabel}
                                labelLine={false}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={entry.label} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
        </section>
    );
}

const styles: Record<string, React.CSSProperties> = {
    section: {
        padding: '24px',
        backgroundColor: '#f8fafc',
    },
    headerBlock: {
        maxWidth: '1000px',
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
    controlCard: {
        maxWidth: '1000px',
        margin: '0 auto 20px auto',
        backgroundColor: '#ffffff',
        border: '1px solid #dbeafe',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
    },
    label: {
        display: 'block',
        marginBottom: '10px',
        fontWeight: 600,
        color: '#0f172a',
    },
    select: {
        width: '100%',
        maxWidth: '320px',
        padding: '10px 12px',
        borderRadius: '8px',
        border: '1px solid #cbd5e1',
        fontSize: '1rem',
    },
    chartCard: {
        maxWidth: '1000px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        border: '1px solid #dbeafe',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
    },
    chartTitle: {
        margin: '0 0 16px 0',
        color: '#0f172a',
    },
    messageCard: {
        maxWidth: '1000px',
        margin: '0 auto 20px auto',
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '12px',
        padding: '16px',
        color: '#334155',
    },
    errorCard: {
        maxWidth: '1000px',
        margin: '0 auto 20px auto',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '12px',
        padding: '16px',
        color: '#991b1b',
    },
    tooltipCard: {
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        padding: '10px 12px',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
    },
    tooltipTitle: {
        fontWeight: 600,
        marginBottom: '4px',
        color: '#0f172a',
    },
};

export default ImmersionPieChart;