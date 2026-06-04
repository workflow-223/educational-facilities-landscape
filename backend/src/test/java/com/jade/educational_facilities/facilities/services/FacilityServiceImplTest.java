package com.jade.educational_facilities.facilities.services;

import com.jade.educational_facilities.facilities.dao.FacilityDao;
import com.jade.educational_facilities.facilities.models.FacilityCountView;
import com.jade.educational_facilities.facilities.models.FacilityMarkerView;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class FacilityServiceImplTest {

    @Mock
    private FacilityDao facilityDao;

    @InjectMocks
    private FacilityServiceImpl facilityService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    private FacilityCountView countView(String label, long count) {
        return new FacilityCountView() {
            @Override public String getLabel() { return label; }
            @Override public long   getCount() { return count; }
        };
    }

    @Test
    public void testGetAllFacilities() {
        List<FacilityMarkerView> expectedFacilities = new ArrayList<>();
        when(facilityDao.findAllFacilityMarkers()).thenReturn(expectedFacilities);

        List<FacilityMarkerView> result = facilityService.getAllFacilities();
        assertNotNull(result);
        assertEquals(expectedFacilities, result);
        verify(facilityDao, times(1)).findAllFacilityMarkers();
    }

    @Test
    public void testGetFacilityCountByProvinceAndFacilityType() {
        String province = "ON";
        String facilityType = "School";
        long expectedCount = 12L;

        when(facilityDao.countFacilitiesByProvince(province, facilityType)).thenReturn(expectedCount);
        long result = facilityService.getFacilityCountByProvince(province, facilityType);

        assertEquals(expectedCount, result);
        verify(facilityDao, times(1)).countFacilitiesByProvince(province, facilityType);
    }

    @Test
    public void testGetFacilityCountByProvinceAndFacilityTypeReturnsZero() {
        String province = "NU";
        String facilityType = "University";
        long expectedCount = 0L;

        when(facilityDao.countFacilitiesByProvince(province, facilityType)).thenReturn(expectedCount);
        long result = facilityService.getFacilityCountByProvince(province, facilityType);

        assertEquals(expectedCount, result);
        verify(facilityDao, times(1)).countFacilitiesByProvince(province, facilityType);
    }

    @Test
    public void testGetImmersionSummaryReturnsFourImmersionTypes() {
        String province = "ON";
        List<FacilityCountView> expected = List.of(
                countView("French Immersion", 10),
                countView("Early Immersion",   5),
                countView("Middle Immersion",  3),
                countView("Late Immersion",    2)
        );
        when(facilityDao.getImmersionSummary(province)).thenReturn(expected);

        List<FacilityCountView> result = facilityService.getImmersionSummary(province);

        assertNotNull(result);
        assertEquals(4, result.size());
        verify(facilityDao, times(1)).getImmersionSummary(province);
    }

    @Test
    public void testGetImmersionSummaryReturnsCorrectCountsPerLabel() {
        String province = "QC";
        List<FacilityCountView> expected = List.of(
                countView("French Immersion", 20),
                countView("Early Immersion",   7),
                countView("Middle Immersion",  3),
                countView("Late Immersion",    1)
        );
        when(facilityDao.getImmersionSummary(province)).thenReturn(expected);

        List<FacilityCountView> result = facilityService.getImmersionSummary(province);

        assertEquals("French Immersion", result.get(0).getLabel());
        assertEquals(20L, result.get(0).getCount());
        assertEquals("Early Immersion",  result.get(1).getLabel());
        assertEquals(7L,  result.get(1).getCount());
        assertEquals("Middle Immersion", result.get(2).getLabel());
        assertEquals(3L,  result.get(2).getCount());
        assertEquals("Late Immersion",   result.get(3).getLabel());
        assertEquals(1L,  result.get(3).getCount());
    }

    @Test
    public void testGetImmersionSummaryDelegatesExactProvinceToDao() {
        String province = "BC";
        when(facilityDao.getImmersionSummary(province)).thenReturn(Collections.emptyList());

        facilityService.getImmersionSummary(province);

        verify(facilityDao, times(1)).getImmersionSummary("BC");
        verify(facilityDao, never()).getImmersionSummary(argThat(p -> !p.equals("BC")));
    }

    @Test
    public void testGetImmersionSummaryReturnsDaoResultUnmodified() {
        String province = "MB";
        List<FacilityCountView> daoResult = List.of(
                countView("French Immersion", 6),
                countView("Early Immersion",  2),
                countView("Middle Immersion", 1),
                countView("Late Immersion",   0)
        );
        when(facilityDao.getImmersionSummary(province)).thenReturn(daoResult);

        List<FacilityCountView> result = facilityService.getImmersionSummary(province);

        assertSame(daoResult, result);
    }

    @Test
    public void testGetImmersionSummaryReturnsEmptyListWhenNoImmersionData() {
        String province = "PE";
        when(facilityDao.getImmersionSummary(province)).thenReturn(Collections.emptyList());

        List<FacilityCountView> result = facilityService.getImmersionSummary(province);

        assertNotNull(result);
        assertEquals(0, result.size());
        verify(facilityDao, times(1)).getImmersionSummary(province);
    }

    @Test
    public void testGetImmersionSummaryReturnsEmptyListForUnknownProvince() {
        String province = "XX";
        when(facilityDao.getImmersionSummary(province)).thenReturn(Collections.emptyList());

        List<FacilityCountView> result = facilityService.getImmersionSummary(province);

        assertNotNull(result);
        assertEquals(0, result.size());
    }

    @Test
    public void testGetFacilitiesWithinRadius() {
        double lat = 43.0;
        double lng = 80.0;
        double radiusKm = 10.0;

        List<FacilityMarkerView> expectedFacilities = new ArrayList<>();

        when(facilityDao.findFacilitiesWithinRadius(lat, lng, radiusKm))
                .thenReturn(expectedFacilities);

        List<FacilityMarkerView> result =
                facilityService.getFacilitiesWithinRadius(lat, lng, radiusKm);

        assertNotNull(result);
        assertEquals(expectedFacilities, result);

        verify(facilityDao, times(1))
                .findFacilitiesWithinRadius(lat, lng, radiusKm);
    }
}