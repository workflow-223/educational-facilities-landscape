package com.jade.educational_facilities.facilities.models;

public interface FacilityMarkerView {
    String getUniqueId();

    String getFacilityName();

    String getFullAddress();

    String getFacilityType();

    Double getLatitude();

    Double getLongitude();
}