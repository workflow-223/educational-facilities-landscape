import { renderHook, waitFor } from '@testing-library/react';
import useFacilities from './useFacilities';

global.fetch = jest.fn();

const mockFetch = global.fetch as jest.Mock;

describe('useFacilities', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('loading starts as true', () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        const { result } = renderHook(() => useFacilities());

        expect(result.current.loading).toBe(true);
    });

    test('loading becomes false after successful fetch', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        const { result } = renderHook(() => useFacilities());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.loading).toBe(false);
    });

    test('returns facilities on successful fetch', async () => {
        const mockData = [
            {
                uniqueId: 'ON-001',
                facilityName: 'Test School',
                fullAddress: '123 Main St, Toronto, ON',
                facilityType: 'Public School',
                latitude: 43.7,
                longitude: -79.4,
            },
        ];

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockData,
        });

        const { result } = renderHook(() => useFacilities());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.facilities).toEqual(mockData);
        expect(result.current.error).toBeNull();
    });

    test('returns empty array when API returns empty list', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        const { result } = renderHook(() => useFacilities());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.facilities).toEqual([]);
        expect(result.current.error).toBeNull();
    });

    test('sets error when response is not ok', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
        });

        const { result } = renderHook(() => useFacilities());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBe('Server error: 500');
        expect(result.current.facilities).toEqual([]);
    });

    test('sets error on network failure', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'));

        const { result } = renderHook(() => useFacilities());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBe('Network error');
        expect(result.current.facilities).toEqual([]);
    });

    test('calls the correct endpoint', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        const { result } = renderHook(() => useFacilities());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(mockFetch).toHaveBeenCalledWith('/api/facilities');
    });
});
