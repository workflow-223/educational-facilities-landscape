import React from 'react';
import ImmersionPieChart from './components/ImmersionPieChart';
import FacilityComparisonChart from './components/FacilityComparisonChart';
import FacilityMap from './components/FacilityMap';
import './App.css';

function App() {
    return (
        <div className="app-shell">
            <div className="chart-section">
                <ImmersionPieChart />
            </div>

            <div className="chart-section">
                <FacilityComparisonChart />
            </div>

            <div className="map-section">
                <FacilityMap />
            </div>
        </div>
    );
}

export default App;