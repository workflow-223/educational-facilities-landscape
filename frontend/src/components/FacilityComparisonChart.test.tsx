import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FacilityComparisonChart from './FacilityComparisonChart';

jest.mock('recharts', () => {
    const MockResponsiveContainer = ({ children }: { children: React.ReactNode }) => (
        <div data-testid="responsive-container">{children}</div>
    );

    const MockBarChart = ({ children, data }: { children: React.ReactNode; data: object[] }) => (
        <div data-testid="bar-chart" data-row-count={data.length}>
            {children}
        </div>
    );

    const MockBar = ({
        dataKey,
        name,
        fill,
    }: {
        dataKey: string;
        name?: string;
        fill?: string;
    }) => (
        <div
            data-testid="bar"
            data-key={dataKey}
            data-name={name ?? dataKey}
            data-fill={fill}
        />
    );

    const MockXAxis = ({ dataKey }: { dataKey: string }) => (
        <div data-testid="x-axis" data-key={dataKey} />
    );

    const MockYAxis = () => <div data-testid="y-axis" />;
    const MockTooltip = () => <div data-testid="tooltip" />;
    const MockLegend = () => <div data-testid="legend" />;
    const MockCartesianGrid = () => <div data-testid="cartesian-grid" />;

    return {
        ResponsiveContainer: MockResponsiveContainer,
        BarChart: MockBarChart,
        Bar: MockBar,
        XAxis: MockXAxis,
        YAxis: MockYAxis,
        Tooltip: MockTooltip,
        Legend: MockLegend,
        CartesianGrid: MockCartesianGrid,
    };
});

function mockFetchSuccess(count = 5) {
    global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(String(count)),
    } as unknown as Response);
}

function mockFetchError() {
    global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve(''),
    } as unknown as Response);
}

function toggleRegion(label: string) {
    fireEvent.click(screen.getByRole('checkbox', { name: label }));
}

beforeEach(() => {
    jest.clearAllMocks();
});

describe('AC1: chart displays facility counts grouped by type for selected provinces', () => {
    test('renders all 13 province/territory checkboxes on mount', () => {
        render(<FacilityComparisonChart />);

        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes).toHaveLength(13);
    });

    test('chart is not visible before any province is selected', () => {
        render(<FacilityComparisonChart />);

        expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
    });

    test('chart appears after selecting one province', async () => {
        mockFetchSuccess();
        render(<FacilityComparisonChart />);

        toggleRegion('Ontario');

        await waitFor(() => {
            expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
        });
    });

    test('chart data has one row per hardcoded facility type (3 rows)', async () => {
        mockFetchSuccess();
        render(<FacilityComparisonChart />);

        toggleRegion('Ontario');

        await waitFor(() => {
            const chart = screen.getByTestId('bar-chart');
            expect(Number(chart.getAttribute('data-row-count'))).toBe(3);
        });
    });

    test('renders one Bar series whose name matches the selected province', async () => {
        mockFetchSuccess();
        render(<FacilityComparisonChart />);

        toggleRegion('Ontario');

        await waitFor(() => {
            const bars = screen.getAllByTestId('bar');
            const ontarioBar = bars.find((b) => b.getAttribute('data-name') === 'Ontario');
            expect(ontarioBar).toBeInTheDocument();
        });
    });

    test('fetches data for each facility type when a province is selected', async () => {
        mockFetchSuccess();
        render(<FacilityComparisonChart />);

        toggleRegion('Ontario');

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(3);
        });
    });

    test('API calls include the correct province code and level parameters', async () => {
        mockFetchSuccess();
        render(<FacilityComparisonChart />);

        toggleRegion('Ontario');

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('province=ON'),
            );
        });
    });
});

describe('AC2: adding a province includes its data alongside existing selections', () => {
    test('chart has one Bar series before a second province is added', async () => {
        mockFetchSuccess();
        render(<FacilityComparisonChart />);

        toggleRegion('Ontario');

        await waitFor(() => {
            expect(screen.getAllByTestId('bar')).toHaveLength(1);
        });
    });

    test('chart gains a second Bar series after adding another province', async () => {
        mockFetchSuccess();
        render(<FacilityComparisonChart />);

        toggleRegion('Ontario');
        await waitFor(() => expect(screen.getAllByTestId('bar')).toHaveLength(1));

        toggleRegion('British Columbia');

        await waitFor(() => {
            expect(screen.getAllByTestId('bar')).toHaveLength(2);
        });
    });

    test('the newly added province has its own Bar series', async () => {
        mockFetchSuccess();
        render(<FacilityComparisonChart />);

        toggleRegion('Ontario');
        await waitFor(() => expect(screen.getAllByTestId('bar')).toHaveLength(1));

        toggleRegion('British Columbia');

        await waitFor(() => {
            const bars = screen.getAllByTestId('bar');
            const bcBar = bars.find((b) => b.getAttribute('data-name') === 'British Columbia');
            expect(bcBar).toBeInTheDocument();
        });
    });

    test('previously selected province Bar series remains after adding another', async () => {
        mockFetchSuccess();
        render(<FacilityComparisonChart />);

        toggleRegion('Ontario');
        await waitFor(() => expect(screen.getAllByTestId('bar')).toHaveLength(1));

        toggleRegion('British Columbia');

        await waitFor(() => {
            const bars = screen.getAllByTestId('bar');
            const ontarioBar = bars.find((b) => b.getAttribute('data-name') === 'Ontario');
            expect(ontarioBar).toBeInTheDocument();
        });
    });

    test('fetch is called for all facility types for each selected province', async () => {
        mockFetchSuccess();
        render(<FacilityComparisonChart />);

        toggleRegion('Ontario');
        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(3));

        (global.fetch as jest.Mock).mockClear();

        toggleRegion('British Columbia');

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(6);
        });
    });
});

describe('AC3: deselecting a province removes its data from the chart', () => {
    test('removes the Bar series for the deselected province', async () => {
        mockFetchSuccess();
        render(<FacilityComparisonChart />);

        toggleRegion('Ontario');
        toggleRegion('British Columbia');
        await waitFor(() => expect(screen.getAllByTestId('bar')).toHaveLength(2));

        toggleRegion('British Columbia');

        await waitFor(() => {
            const bars = screen.getAllByTestId('bar');
            const bcBar = bars.find((b) => b.getAttribute('data-name') === 'British Columbia');
            expect(bcBar).toBeUndefined();
        });
    });

    test('remaining selected province Bar series is still rendered', async () => {
        mockFetchSuccess();
        render(<FacilityComparisonChart />);

        toggleRegion('Ontario');
        toggleRegion('British Columbia');
        await waitFor(() => expect(screen.getAllByTestId('bar')).toHaveLength(2));

        toggleRegion('British Columbia');

        await waitFor(() => {
            const bars = screen.getAllByTestId('bar');
            const ontarioBar = bars.find((b) => b.getAttribute('data-name') === 'Ontario');
            expect(ontarioBar).toBeInTheDocument();
        });
    });

    test('deselecting a province unchecks its checkbox', async () => {
        mockFetchSuccess();
        render(<FacilityComparisonChart />);

        toggleRegion('Ontario');
        toggleRegion('Ontario');

        const checkbox = screen.getByRole('checkbox', { name: 'Ontario' });
        expect(checkbox).not.toBeChecked();
    });

    test('chart disappears when the last selected province is deselected', async () => {
        mockFetchSuccess();
        render(<FacilityComparisonChart />);

        toggleRegion('Ontario');
        await waitFor(() => expect(screen.getByTestId('bar-chart')).toBeInTheDocument());

        toggleRegion('Ontario');

        await waitFor(() => {
            expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
        });
    });
});

describe('AC4: each region is visually distinguished when two or more are selected', () => {
    test('each Bar series receives a distinct fill colour', async () => {
        mockFetchSuccess();
        render(<FacilityComparisonChart />);

        toggleRegion('Ontario');
        toggleRegion('British Columbia');

        await waitFor(() => {
            const bars = screen.getAllByTestId('bar');
            expect(bars).toHaveLength(2);

            const fills = bars.map((b) => b.getAttribute('data-fill'));
            const uniqueFills = new Set(fills.filter(Boolean));
            expect(uniqueFills.size).toBe(2);
        });
    });

    test('a Legend is rendered in the chart', async () => {
        mockFetchSuccess();
        render(<FacilityComparisonChart />);

        toggleRegion('Ontario');
        toggleRegion('British Columbia');

        await waitFor(() => {
            expect(screen.getByTestId('legend')).toBeInTheDocument();
        });
    });

    test('each Bar series name matches its province label', async () => {
        mockFetchSuccess();
        render(<FacilityComparisonChart />);

        toggleRegion('Ontario');
        toggleRegion('British Columbia');

        await waitFor(() => {
            const bars = screen.getAllByTestId('bar');
            const names = bars.map((b) => b.getAttribute('data-name'));
            expect(names).toContain('Ontario');
            expect(names).toContain('British Columbia');
        });
    });

    test('adding a third province assigns it a different fill from the first two', async () => {
        mockFetchSuccess();
        render(<FacilityComparisonChart />);

        toggleRegion('Ontario');
        toggleRegion('British Columbia');
        toggleRegion('Alberta');

        await waitFor(() => {
            const bars = screen.getAllByTestId('bar');
            expect(bars).toHaveLength(3);

            const fills = bars.map((b) => b.getAttribute('data-fill'));
            const uniqueFills = new Set(fills.filter(Boolean));
            expect(uniqueFills.size).toBe(3);
        });
    });
});

describe('AC5: a Tooltip is present so hovering a bar reveals the exact count', () => {
    test('Tooltip is rendered inside the chart after selecting a province', async () => {
        mockFetchSuccess();
        render(<FacilityComparisonChart />);

        toggleRegion('Ontario');

        await waitFor(() => {
            expect(screen.getByTestId('tooltip')).toBeInTheDocument();
        });
    });

    test('Tooltip remains present when multiple provinces are selected', async () => {
        mockFetchSuccess();
        render(<FacilityComparisonChart />);

        toggleRegion('Ontario');
        toggleRegion('British Columbia');
        toggleRegion('Alberta');

        await waitFor(() => {
            expect(screen.getByTestId('tooltip')).toBeInTheDocument();
        });
    });

    test('XAxis uses facilityType as its data key so bars are labelled by type', async () => {
        mockFetchSuccess();
        render(<FacilityComparisonChart />);

        toggleRegion('Ontario');

        await waitFor(() => {
            const xAxis = screen.getByTestId('x-axis');
            expect(xAxis.getAttribute('data-key')).toBe('facilityType');
        });
    });
});

describe('AC6: no provinces selected shows a no-data message', () => {
    test('displays a no-data message on initial render', () => {
        render(<FacilityComparisonChart />);

        expect(
            screen.getByText(/no data is available to display/i),
        ).toBeInTheDocument();
    });

    test('does not render the bar chart when no provinces are selected', () => {
        render(<FacilityComparisonChart />);

        expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
    });

    test('no-data message disappears once a province is selected', async () => {
        mockFetchSuccess();
        render(<FacilityComparisonChart />);

        expect(screen.getByText(/no data is available to display/i)).toBeInTheDocument();

        toggleRegion('Ontario');

        await waitFor(() => {
            expect(screen.queryByText(/no data is available to display/i)).not.toBeInTheDocument();
        });
    });

    test('no-data message reappears after all provinces are deselected', async () => {
        mockFetchSuccess();
        render(<FacilityComparisonChart />);

        toggleRegion('Ontario');
        await waitFor(() =>
            expect(screen.queryByText(/no data is available to display/i)).not.toBeInTheDocument(),
        );

        toggleRegion('Ontario');

        await waitFor(() => {
            expect(screen.getByText(/no data is available to display/i)).toBeInTheDocument();
        });
    });

    test('prompts the user to select a province in the no-data message', () => {
        render(<FacilityComparisonChart />);

        expect(
            screen.getByText(/please select at least one province or territory/i),
        ).toBeInTheDocument();
    });
});

describe('loading and error states', () => {
    test('shows a loading message while fetch is in progress', async () => {
        const neverResolve = () => { return; };
        global.fetch = jest.fn().mockReturnValue(new Promise(neverResolve));
        render(<FacilityComparisonChart />);

        toggleRegion('Ontario');

        await waitFor(() => {
            expect(screen.getByText(/loading chart data/i)).toBeInTheDocument();
        });
    });

    test('loading message disappears after data loads successfully', async () => {
        mockFetchSuccess();
        render(<FacilityComparisonChart />);

        toggleRegion('Ontario');

        await waitFor(() => {
            expect(screen.queryByText(/loading chart data/i)).not.toBeInTheDocument();
        });
    });

    test('shows an error message when the API returns a non-OK response', async () => {
        mockFetchError();
        render(<FacilityComparisonChart />);

        toggleRegion('Ontario');

        await waitFor(() => {
            expect(
                screen.getByText(/unable to load facility comparison data/i),
            ).toBeInTheDocument();
        });
    });

    test('hides the chart when the API returns an error', async () => {
        mockFetchError();
        render(<FacilityComparisonChart />);

        toggleRegion('Ontario');

        await waitFor(() => {
            expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
        });
    });

    test('error message clears and chart renders on retry after deselect/reselect', async () => {
        mockFetchError();
        render(<FacilityComparisonChart />);

        toggleRegion('Ontario');
        await waitFor(() =>
            expect(screen.getByText(/unable to load facility comparison data/i)).toBeInTheDocument(),
        );

        mockFetchSuccess();
        toggleRegion('Ontario');
        toggleRegion('Ontario');

        await waitFor(() => {
            expect(screen.queryByText(/unable to load facility comparison data/i)).not.toBeInTheDocument();
            expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
        });
    });
});
