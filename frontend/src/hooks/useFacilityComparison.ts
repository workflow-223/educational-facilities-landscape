import { useEffect, useMemo, useState } from 'react';

export type RegionOption = {
    label: string;
    code: string;
};

export type FacilityTypeOption = {
    label: string;
    value: string;
};

export type ChartRow = {
    facilityType: string;
    [regionLabel: string]: string | number;
};

export const REGION_OPTIONS: RegionOption[] = [
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

export const FACILITY_TYPES: FacilityTypeOption[] = [
    { label: 'Universities/Colleges', value: 'university' },
    { label: 'Secondary Schools', value: 'secondary' },
    { label: 'Elementary Schools', value: 'elementary' },
];

export const BAR_COLORS = [
    '#2563eb',
    '#dc2626',
    '#16a34a',
    '#9333ea',
    '#ea580c',
    '#0891b2',
    '#ca8a04',
    '#be123c',
    '#7c3aed',
    '#15803d',
    '#1d4ed8',
    '#c2410c',
    '#0f766e',
];

type UseFacilityComparisonReturn = {
    selectedRegionCodes: string[];
    selectedRegions: RegionOption[];
    chartData: ChartRow[];
    loading: boolean;
    error: string | null;
    handleRegionToggle: (regionCode: string) => void;
};

export function useFacilityComparison(): UseFacilityComparisonReturn {
    const [selectedRegionCodes, setSelectedRegionCodes] = useState<string[]>([]);
    const [countsByRegionAndType, setCountsByRegionAndType] = useState<Record<string, Record<string, number>>>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const selectedRegions = useMemo(
        () => REGION_OPTIONS.filter((region) => selectedRegionCodes.includes(region.code)),
        [selectedRegionCodes],
    );

    useEffect(() => {
        const loadComparisonData = async () => {
            if (selectedRegionCodes.length === 0) {
                setCountsByRegionAndType({});
                setError(null);
                return;
            }

            setLoading(true);
            setError(null);
            setCountsByRegionAndType({});

            try {
                const requests = selectedRegions.flatMap((region) =>
                    FACILITY_TYPES.map(async (facilityType) => {
                        const response = await fetch(
                            `/api/facilities/education-level?province=${encodeURIComponent(region.code)}&level=${encodeURIComponent(facilityType.value)}`,
                        );

                        if (!response.ok) {
                            throw new Error(`Failed to fetch data for ${region.label}`);
                        }

                        const text = await response.text();
                        const count = Number(text);

                        return {
                            regionCode: region.code,
                            facilityTypeLabel: facilityType.label,
                            count: Number.isNaN(count) ? 0 : count,
                        };
                    }),
                );

                const results = await Promise.all(requests);

                const nextData: Record<string, Record<string, number>> = {};

                results.forEach((result) => {
                    if (!nextData[result.regionCode]) {
                        nextData[result.regionCode] = {};
                    }
                    nextData[result.regionCode][result.facilityTypeLabel] = result.count;
                });

                setCountsByRegionAndType(nextData);
            } catch (err) {
                setCountsByRegionAndType({});
                setError('Unable to load facility comparison data.');
            } finally {
                setLoading(false);
            }
        };

        loadComparisonData();
    }, [selectedRegionCodes, selectedRegions]);

    const chartData: ChartRow[] = useMemo(() => {
        return FACILITY_TYPES.map((facilityType) => {
            const row: ChartRow = { facilityType: facilityType.label };

            selectedRegions.forEach((region) => {
                row[region.label] = countsByRegionAndType[region.code]?.[facilityType.label] ?? 0;
            });

            return row;
        });
    }, [countsByRegionAndType, selectedRegions]);

    const handleRegionToggle = (regionCode: string) => {
        setSelectedRegionCodes((previousCodes) => {
            if (previousCodes.includes(regionCode)) {
                return previousCodes.filter((code) => code !== regionCode);
            }
            return [...previousCodes, regionCode];
        });
    };

    return {
        selectedRegionCodes,
        selectedRegions,
        chartData,
        loading,
        error,
        handleRegionToggle,
    };
}
