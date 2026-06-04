package com.jade.educational_facilities.facilities.dao;

import com.jade.educational_facilities.facilities.models.Facility;
import com.jade.educational_facilities.facilities.models.FacilityCountView;
import com.jade.educational_facilities.facilities.models.FacilityMarkerView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FacilityDao extends JpaRepository<Facility, Integer> {

    @Query(value = """
            SELECT
                f.unique_id AS uniqueId,
                f.facility_name AS facilityName,
                l.full_address AS fullAddress,
                ft.facility_type_name AS facilityType,
                l.latitude AS latitude,
                l.longitude AS longitude
            FROM facilities f
            JOIN locations l ON f.location_id = l.location_id
            JOIN facility_types ft ON f.facility_type_id = ft.facility_type_id
            WHERE l.latitude IS NOT NULL AND l.longitude IS NOT NULL
            """, nativeQuery = true)
    List<FacilityMarkerView> findAllFacilityMarkers();

    @Query(value = """
            SELECT COUNT(*)
            FROM facilities f
            JOIN locations l ON f.location_id = l.location_id
            JOIN facility_types ft ON f.facility_type_id = ft.facility_type_id
            WHERE LOWER(l.province_code) = LOWER(:province)
              AND LOWER(ft.facility_type_name) = LOWER(:facility_type)
            """, nativeQuery = true)
    long countFacilitiesByProvince(@Param("province") String province, @Param("facility_type") String facilityType);

    @Query(value = """
            SELECT COUNT(*)
            FROM facilities f
            JOIN locations l ON f.location_id = l.location_id
            WHERE LOWER(l.province_code) = LOWER(:province)
              AND f.ISCED1 = 1
            """, nativeQuery = true)
    long countElementaryByProvince(@Param("province") String province);

    @Query(value = """
            SELECT COUNT(*)
            FROM facilities f
            JOIN locations l ON f.location_id = l.location_id
            WHERE LOWER(l.province_code) = LOWER(:province)
              AND (f.ISCED2 = 1 OR f.ISCED3 = 1)
            """, nativeQuery = true)
    long countSecondaryByProvince(@Param("province") String province);

    @Query(value = """
            SELECT COUNT(*)
            FROM facilities f
            JOIN locations l ON f.location_id = l.location_id
            WHERE LOWER(l.province_code) = LOWER(:province)
              AND f.ISCED4Plus = 1
            """, nativeQuery = true)
    long countUniversityByProvince(@Param("province") String province);

    @Query(value = """
            SELECT 'French Immersion' AS label, COUNT(*) AS count
            FROM facilities f
            JOIN locations l ON f.location_id = l.location_id
            WHERE LOWER(l.province_code) = LOWER(:province)
              AND f.french_immersion = 1

            UNION ALL

            SELECT 'Early Immersion' AS label, COUNT(*) AS count
            FROM facilities f
            JOIN locations l ON f.location_id = l.location_id
            WHERE LOWER(l.province_code) = LOWER(:province)
              AND f.early_immersion = 1

            UNION ALL

            SELECT 'Middle Immersion' AS label, COUNT(*) AS count
            FROM facilities f
            JOIN locations l ON f.location_id = l.location_id
            WHERE LOWER(l.province_code) = LOWER(:province)
              AND f.middle_immersion = 1

            UNION ALL

            SELECT 'Late Immersion' AS label, COUNT(*) AS count
            FROM facilities f
            JOIN locations l ON f.location_id = l.location_id
            WHERE LOWER(l.province_code) = LOWER(:province)
              AND f.late_immersion = 1
            """, nativeQuery = true)
    List<FacilityCountView> getImmersionSummary(@Param("province") String province);

    @Query(value = """
        SELECT
            f.unique_id AS uniqueId,
            f.facility_name AS facilityName,
            l.full_address AS fullAddress,
            ft.facility_type_name AS facilityType,
            l.latitude AS latitude,
            l.longitude AS longitude
        FROM facilities f
        JOIN locations l ON f.location_id = l.location_id
        JOIN facility_types ft ON f.facility_type_id = ft.facility_type_id
        WHERE l.latitude IS NOT NULL AND l.longitude IS NOT NULL
          AND (6371 * acos(
                cos(radians(:lat)) * cos(radians(l.latitude))
                * cos(radians(l.longitude) - radians(:lng))
                + sin(radians(:lat)) * sin(radians(l.latitude))
              )) <= :radiusKm
        """, nativeQuery = true)
    List<FacilityMarkerView> findFacilitiesWithinRadius(
          @Param("lat") double lat,
          @Param("lng") double lng,
          @Param("radiusKm") double radiusKm);
}