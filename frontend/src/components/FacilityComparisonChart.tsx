import React from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { BAR_COLORS, REGION_OPTIONS, useFacilityComparison } from '../hooks/useFacilityComparison';
import { facilityComparisonStyles as styles } from './facilityComparisonStyles';

function FacilityComparisonChart() {
    const {
        selectedRegionCodes,
        selectedRegions,
        chartData,
        loading,
        error,
        handleRegionToggle,
    } = useFacilityComparison();

    return (
        <section style={styles.section}>
            <div style={styles.headerBlock}>
                <h1 style={styles.title}>Educational Institutions by Province/Territory</h1>
                <p style={styles.description}>
                    Compare the number of facilities by type across selected provinces and territories.
                </p>
            </div>

            <div style={styles.selectorCard}>
                <h2 style={styles.selectorTitle}>Select provinces or territories</h2>

                <div style={styles.checkboxGrid}>
                    {REGION_OPTIONS.map((region) => (
                        <label key={region.code} style={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={selectedRegionCodes.includes(region.code)}
                                onChange={() => handleRegionToggle(region.code)}
                            />
                            <span>{region.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {selectedRegionCodes.length === 0 && (
                <div style={styles.messageCard}>
                    No data is available to display. Please select at least one province or territory.
                </div>
            )}

            {loading && (
                <div style={styles.messageCard}>
                    Loading chart data...
                </div>
            )}

            {error && (
                <div style={styles.errorCard}>
                    {error}
                </div>
            )}

            {!loading && !error && selectedRegionCodes.length > 0 && (
                <div style={styles.chartCard}>
                    <ResponsiveContainer width="100%" height={420}>
                        <BarChart data={chartData} margin={{ top: 20, right: 24, left: 0, bottom: 12 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="facilityType" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {selectedRegions.map((region, index) => (
                                <Bar
                                    key={region.code}
                                    dataKey={region.label}
                                    fill={BAR_COLORS[index % BAR_COLORS.length]}
                                    name={region.label}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </section>
    );
}

export default FacilityComparisonChart;