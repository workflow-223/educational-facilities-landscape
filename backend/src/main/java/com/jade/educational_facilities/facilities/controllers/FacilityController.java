package com.jade.educational_facilities.facilities.controllers;

import com.jade.educational_facilities.facilities.models.EducationLevel;
import com.jade.educational_facilities.facilities.models.FacilityCountView;
import com.jade.educational_facilities.facilities.models.FacilityMarkerView;
import com.jade.educational_facilities.facilities.services.FacilityService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/facilities")
public class FacilityController {

    private final FacilityService facilityService;

    public FacilityController(FacilityService facilityService) {
        this.facilityService = facilityService;
    }

    @GetMapping
    public List<FacilityMarkerView> getFacilities() {
        return facilityService.getAllFacilities();
    }

    @GetMapping("/count")
    public long getFacilityCountByProvince(
            @RequestParam String province,
            @RequestParam String facilityType) {
        return facilityService.getFacilityCountByProvince(province, facilityType);
    }

    @GetMapping("/education-level")
    public long getFacilityCountByEducationLevel(
            @RequestParam String province,
            @RequestParam String level) {
        EducationLevel educationLevel = EducationLevel.valueOf(level.toUpperCase());
        return facilityService.countByEducationLevel(province, educationLevel);
    }

    @GetMapping("/immersion-summary")
    public List<FacilityCountView> getImmersionSummary(@RequestParam String province) {
        return facilityService.getImmersionSummary(province);
    }

    @GetMapping("/within-radius")
    public List<FacilityMarkerView> getFacilitiesWithinRadius(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam double radiusKm) {

        return facilityService.getFacilitiesWithinRadius(lat, lng, radiusKm);
    }
}