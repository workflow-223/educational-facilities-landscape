import pymysql

conn = pymysql.connect(
    host="database",
    port=3306,
    user="root",
    password="rootpassword",
    db="jade_db",
    cursorclass=pymysql.cursors.DictCursor
)

cursor = conn.cursor()

facility_id = input("Enter facility unique_id: ")

query = """
SELECT
    f.unique_id,
    f.geocode,
    f.source_id,
    f.school_id,
    f.facility_name,
    f.min_grade,
    f.max_grade,
    f.ISCED010,
    f.ISCED020,
    f.ISCED1,
    f.ISCED2,
    f.ISCED3,
    f.ISCED4Plus,
    f.is_OLMS,
    f.french_immersion,
    f.early_immersion,
    f.middle_immersion,
    f.late_immersion,
    f.date_updated,
    a.authority_id,
    a.authority_name,
    p.provider_name,
    ft.facility_type_name,
    l.full_address,
    l.street_address,
    l.postal_code,
    l.locality,
    l.province_code,
    l.dguid,
    l.csdname,
    l.geometry
FROM facilities f
JOIN authorities a ON f.authority_pk = a.authority_pk
JOIN providers p ON a.provider_id = p.provider_id
JOIN facility_types ft ON f.facility_type_id = ft.facility_type_id
JOIN locations l ON f.location_id = l.location_id
WHERE f.unique_id = %s
"""

cursor.execute(query, (facility_id,))
result = cursor.fetchone()

if result:
    print("\nFacility Data:\n")
    for key, value in result.items():
        print(f"{key}: {value}")
else:
    print("No facility found.")

cursor.close()
conn.close()