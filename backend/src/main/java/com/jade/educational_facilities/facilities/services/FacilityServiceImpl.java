package com.jade.educational_facilities.facilities.services;

import com.jade.educational_facilities.facilities.dao.FacilityDao;
import com.jade.educational_facilities.facilities.models.EducationLevel;
import com.jade.educational_facilities.facilities.models.FacilityCountView;
import com.jade.educational_facilities.facilities.models.FacilityMarkerView;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FacilityServiceImpl implements FacilityService {

    private final FacilityDao facilityDao;

    public FacilityServiceImpl(FacilityDao facilityDao) {
        this.facilityDao = facilityDao;
    }

    @Override
    public List<FacilityMarkerView> getAllFacilities() {
        return facilityDao.findAllFacilityMarkers();
    }

    @Override
    public long getFacilityCountByProvince(String province, String facilityType) {
        return facilityDao.countFacilitiesByProvince(province, facilityType);
    }

    @Override
    public long countByEducationLevel(String province, EducationLevel level) {
        return switch (level) {
            case ELEMENTARY -> facilityDao.countElementaryByProvince(province);
            case SECONDARY -> facilityDao.countSecondaryByProvince(province);
            case UNIVERSITY -> facilityDao.countUniversityByProvince(province);
        };
    }

    @Override
    public List<FacilityCountView> getImmersionSummary(String province) {
        return facilityDao.getImmersionSummary(province);
    }

    /* 🔥 FIXED METHOD */
    @Override
    public List<FacilityMarkerView> getFacilitiesWithinRadius(double lat, double lng, double radiusKm) {
        return facilityDao.findFacilitiesWithinRadius(lat, lng, radiusKm);
    }
}