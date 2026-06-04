export type FacilityResult = {
    regionCode: string;
    facilityTypeLabel: string;
    count: number;
};

export async function fetchFacilityCount(
    regionCode: string,
    regionLabel: string,
    facilityTypeValue: string,
    facilityTypeLabel: string,
): Promise<FacilityResult> {
    const response = await fetch(
        `/api/facilities/education-level?province=${encodeURIComponent(regionCode)}&level=${encodeURIComponent(facilityTypeValue)}`,
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch data for ${regionLabel}`);
    }

    const text = await response.text();
    const count = Number(text);

    return {
        regionCode,
        facilityTypeLabel,
        count: Number.isNaN(count) ? 0 : count,
    };
}

export function buildCountsByRegionAndType(
    results: FacilityResult[],
): Record<string, Record<string, number>> {
    const data: Record<string, Record<string, number>> = {};

    results.forEach((result) => {
        if (!data[result.regionCode]) {
            data[result.regionCode] = {};
        }
        data[result.regionCode][result.facilityTypeLabel] = result.count;
    });

    return data;
}