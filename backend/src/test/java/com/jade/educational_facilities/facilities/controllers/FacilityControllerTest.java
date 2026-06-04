package com.jade.educational_facilities.facilities.controllers;

import com.jade.educational_facilities.facilities.models.FacilityCountView;
import com.jade.educational_facilities.facilities.services.FacilityService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(FacilityController.class)
class FacilityControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FacilityService facilityService;

    private FacilityCountView countView(String label, long count) {
        return new FacilityCountView() {
            @Override public String getLabel() { return label; }
            @Override public long   getCount() { return count; }
        };
    }

    @Test
    void getFacilities() throws Exception {
        when(facilityService.getAllFacilities()).thenReturn(List.of());

        mockMvc.perform(get("/api/facilities"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        verify(facilityService, times(1)).getAllFacilities();
    }

    @Test
    void getFacilityCountByProvinceAndFacilityType() throws Exception {
        when(facilityService.getFacilityCountByProvince("ON", "School")).thenReturn(12L);

        mockMvc.perform(get("/api/facilities/count")
                .param("province", "ON")
                .param("facilityType", "School"))
                .andExpect(status().isOk())
                .andExpect(content().string("12"));

        verify(facilityService, times(1)).getFacilityCountByProvince("ON", "School");
    }

    @Test
    void getFacilityCountByProvinceAndFacilityTypeReturnsZero() throws Exception {
        when(facilityService.getFacilityCountByProvince("NU", "University")).thenReturn(0L);

        mockMvc.perform(get("/api/facilities/count")
                .param("province", "NU")
                .param("facilityType", "University"))
                .andExpect(status().isOk())
                .andExpect(content().string("0"));

        verify(facilityService, times(1)).getFacilityCountByProvince("NU", "University");
    }

    @Test
    void getFacilityCountByProvinceMissingProvinceReturnsBadRequest() throws Exception {
        mockMvc.perform(get("/api/facilities/count")
                .param("facilityType", "School"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getFacilityCountByProvinceMissingFacilityTypeReturnsBadRequest() throws Exception {
        mockMvc.perform(get("/api/facilities/count")
                .param("province", "ON"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getImmersionSummaryReturnsAllFourImmersionTypes() throws Exception {
        String province = "ON";
        List<FacilityCountView> mockResult = List.of(
                countView("French Immersion", 10),
                countView("Early Immersion",   5),
                countView("Middle Immersion",  3),
                countView("Late Immersion",    2)
        );
        when(facilityService.getImmersionSummary(province)).thenReturn(mockResult);

        mockMvc.perform(get("/api/facilities/immersion-summary")
                        .param("province", province)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$", hasSize(4)))
                .andExpect(jsonPath("$[*].label", containsInAnyOrder(
                        "French Immersion",
                        "Early Immersion",
                        "Middle Immersion",
                        "Late Immersion"
                )));

        verify(facilityService, times(1)).getImmersionSummary(province);
    }

    @Test
    void getImmersionSummaryReturnsCorrectCountsPerLabel() throws Exception {
        String province = "QC";
        List<FacilityCountView> mockResult = List.of(
                countView("French Immersion", 20),
                countView("Early Immersion",   7),
                countView("Middle Immersion",  3),
                countView("Late Immersion",    1)
        );
        when(facilityService.getImmersionSummary(province)).thenReturn(mockResult);

        mockMvc.perform(get("/api/facilities/immersion-summary")
                        .param("province", province)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.label == 'French Immersion')].count", contains(20)))
                .andExpect(jsonPath("$[?(@.label == 'Early Immersion')].count",  contains(7)))
                .andExpect(jsonPath("$[?(@.label == 'Middle Immersion')].count", contains(3)))
                .andExpect(jsonPath("$[?(@.label == 'Late Immersion')].count",   contains(1)));
    }

    @Test
    void getImmersionSummaryProvinceParamIsForwardedToService() throws Exception {
        String province = "BC";
        when(facilityService.getImmersionSummary(province)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/facilities/immersion-summary")
                        .param("province", province))
                .andExpect(status().isOk());

        verify(facilityService, times(1)).getImmersionSummary("BC");
        verify(facilityService, never()).getImmersionSummary(argThat(p -> !p.equals("BC")));
    }

    @Test
    void getImmersionSummaryMissingProvinceReturnsBadRequest() throws Exception {
        mockMvc.perform(get("/api/facilities/immersion-summary")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());

        verify(facilityService, never()).getImmersionSummary(any());
    }

    @Test
    void getImmersionSummaryReturnsEmptyArrayWhenNoImmersionData() throws Exception {
        String province = "PE";
        when(facilityService.getImmersionSummary(province)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/facilities/immersion-summary")
                        .param("province", province)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$", hasSize(0)));

        verify(facilityService, times(1)).getImmersionSummary(province);
    }

    @Test
    void getImmersionSummaryReturnsEmptyArrayForUnknownProvince() throws Exception {
        String province = "XX";
        when(facilityService.getImmersionSummary(province)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/facilities/immersion-summary")
                        .param("province", province)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    // ✅ FIXED TEST (types removed)
    @Test
    void getFacilitiesWithinRadius() throws Exception {
        double lat = 43.0;
        double lng = 80.0;
        double radiusKm = 10.0;

        when(facilityService.getFacilitiesWithinRadius(lat, lng, radiusKm)).thenReturn(List.of());

        mockMvc.perform(get("/api/facilities/within-radius")
                .param("lat", String.valueOf(lat))
                .param("lng", String.valueOf(lng))
                .param("radiusKm", String.valueOf(radiusKm)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray());

        verify(facilityService, times(1)).getFacilitiesWithinRadius(lat, lng, radiusKm);
    }
}