import { useState, useEffect } from 'react';
import { Facility } from '../types/Facility';

interface UseFacilitiesResult {
    facilities: Facility[];
    loading: boolean;
    error: string | null;
}

function useFacilities(): UseFacilitiesResult {
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/facilities')
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`);
                }
                return response.json();
            })
            .then((data: Facility[]) => {
                setFacilities(data);
            })
            .catch((err: Error) => {
                setError(err.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return { facilities, loading, error };
}

export default useFacilities;