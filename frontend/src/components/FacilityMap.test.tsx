// src/components/FacilityMap.test.tsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FacilityMap from './FacilityMap';
import useFacilities from '../hooks/useFacilities';

jest.mock('../hooks/useFacilities');
const mockUseFacilities = useFacilities as jest.MockedFunction<typeof useFacilities>;

jest.mock('react-leaflet', () => ({
    MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
    TileLayer: () => <div />,
    Marker: ({ children }: any) => <div data-testid="marker">{children}</div>,
    Popup: ({ children }: any) => <div>{children}</div>,
    Circle: () => <div data-testid="circle" />,
    useMapEvents: jest.fn(),
}));

jest.mock('react-leaflet-cluster', () => ({
    __esModule: true,
    default: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('leaflet', () => ({
    Icon: {
        Default: {
            prototype: { _getIconUrl: '' },
            mergeOptions: jest.fn(),
        },
    },
}));

const mockFacilities = [
    {
        uniqueId: '1',
        facilityName: 'Test School A',
        fullAddress: '123 Main St, Toronto, ON',
        facilityType: 'Public School',
        latitude: 43.65,
        longitude: -79.38,
    },
    {
        uniqueId: '2',
        facilityName: 'Test School B',
        fullAddress: '456 Oak Ave, Ottawa, ON',
        facilityType: 'Private School',
        latitude: 45.42,
        longitude: -75.69,
    },
];

describe('FacilityMap', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('displays loading message', () => {
        mockUseFacilities.mockReturnValue({
            facilities: [],
            loading: true,
            error: null,
        });

        render(<FacilityMap />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('displays error message', () => {
        mockUseFacilities.mockReturnValue({
            facilities: [],
            loading: false,
            error: 'Network error',
        });

        render(<FacilityMap />);
        expect(screen.getByText('Error: Network error')).toBeInTheDocument();
    });

    test('renders map container', () => {
        mockUseFacilities.mockReturnValue({
            facilities: mockFacilities,
            loading: false,
            error: null,
        });

        render(<FacilityMap />);
        expect(screen.getByTestId('map-container')).toBeInTheDocument();
    });

    test('renders markers', () => {
        mockUseFacilities.mockReturnValue({
            facilities: mockFacilities,
            loading: false,
            error: null,
        });

        render(<FacilityMap />);
        expect(screen.getAllByTestId('marker')).toHaveLength(2);
    });

    test('displays facility info', () => {
        mockUseFacilities.mockReturnValue({
            facilities: mockFacilities,
            loading: false,
            error: null,
        });

        render(<FacilityMap />);
        expect(screen.getByText('Test School A')).toBeInTheDocument();
        expect(screen.getByText('123 Main St, Toronto, ON')).toBeInTheDocument();
        expect(screen.getByText('Public School')).toBeInTheDocument();
    });

    test('no markers when empty', () => {
        mockUseFacilities.mockReturnValue({
            facilities: [],
            loading: false,
            error: null,
        });

        render(<FacilityMap />);
        expect(screen.queryAllByTestId('marker')).toHaveLength(0);
    });
});

describe('FacilityMap — radius controls', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseFacilities.mockReturnValue({
            facilities: mockFacilities,
            loading: false,
            error: null,
        });
    });

    test('shows prompt initially', () => {
        render(<FacilityMap />);
        expect(screen.getByText('Click on map to analyze an area')).toBeInTheDocument();
    });

    test('slider NOT visible initially', () => {
        render(<FacilityMap />);
        expect(screen.queryByRole('slider')).not.toBeInTheDocument();
    });

    test('slider appears after enabling radius mode', () => {
        render(<FacilityMap />);
        fireEvent.click(screen.getByText('Enable Radius Mode'));

        expect(screen.getByRole('slider')).toBeInTheDocument();
        expect(screen.getByText('Radius: 7 km')).toBeInTheDocument();
    });

    test('slider updates radius value', () => {
        render(<FacilityMap />);
        fireEvent.click(screen.getByText('Enable Radius Mode'));

        const slider = screen.getByRole('slider');
        fireEvent.change(slider, { target: { value: '20' } });

        expect(screen.getByText('Radius: 20 km')).toBeInTheDocument();
    });
});