package com.jade.educational_facilities.facilities.services;

import com.jade.educational_facilities.facilities.models.EducationLevel;
import com.jade.educational_facilities.facilities.models.FacilityCountView;
import com.jade.educational_facilities.facilities.models.FacilityMarkerView;

import java.util.List;

public interface FacilityService {
    List<FacilityMarkerView> getAllFacilities();

    long getFacilityCountByProvince(String province, String facilityType);

    long countByEducationLevel(String province, EducationLevel level);

    List<FacilityCountView> getImmersionSummary(String province);

    List<FacilityMarkerView> getFacilitiesWithinRadius(double lat, double lng, double radiusKm);}