import os
import re
import hashlib
from typing import Any

import pandas as pd
import pymysql
from pymysql import MySQLError as Error


DATA_FILE = os.getenv("DATA_FILE", "odef_v3_0_1.csv")

DB_HOST = os.getenv("DB_HOST", "database")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_NAME = os.getenv("DB_NAME", "jade_db")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "rootpassword")

BATCH_SIZE = int(os.getenv("BATCH_SIZE", "1000"))


def read_input_file(file_path: str) -> pd.DataFrame:
    if not file_path.lower().endswith(".csv"):
        raise ValueError("This importer only supports CSV files.")
    return pd.read_csv(file_path)


def clean_value(value: Any) -> Any:
    if pd.isna(value):
        return None
    if isinstance(value, float) and value.is_integer():
        return int(value)
    return value


def to_int_flag(value: Any) -> int | None:
    if pd.isna(value):
        return None

    if isinstance(value, str):
        value = value.strip().lower()
        if value in {"true", "yes", "y", "1"}:
            return 1
        if value in {"false", "no", "n", "0"}:
            return 0

    try:
        return int(float(value))
    except (ValueError, TypeError):
        return None


def normalize_text(value: Any) -> str | None:
    value = clean_value(value)
    if value is None:
        return None
    return str(value).strip()

def extract_lat_long(geometry: Any) -> tuple[float | None, float | None]:
    geometry = normalize_text(geometry)
    if geometry is None:
        return None, None

    match = re.match(r"POINT\s*\(([-\d.]+)\s+([-\d.]+)\)", geometry)
    if not match:
        return None, None
    
    longitude = float(match.group(1))
    latitude = float(match.group(2))
    return latitude, longitude


def make_location_key(row: pd.Series) -> str:
    parts = [
        normalize_text(row.get("full_address")),
        normalize_text(row.get("streetAddress")),
        normalize_text(row.get("postalCode")),
        normalize_text(row.get("addressLocality")),
        normalize_text(row.get("province_code")),
        normalize_text(row.get("dguid")),
        normalize_text(row.get("csdname")),
        normalize_text(row.get("geometry")),
    ]
    raw = "|".join("" if part is None else part for part in parts)
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def make_authority_key(row: pd.Series) -> str:
    parts = [
        normalize_text(row.get("authority_id")),
        normalize_text(row.get("authority_name")),
        normalize_text(row.get("provider")),
        normalize_text(row.get("province_code")),
    ]
    raw = "|".join("" if part is None else part for part in parts)
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def chunks(items: list[tuple], size: int):
    for i in range(0, len(items), size):
        yield items[i:i + size]


def main():
    df = read_input_file(DATA_FILE)

    for col in df.columns:
        df[col] = df[col].apply(clean_value)

    conn = pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        db=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        autocommit=False,
    )
    cursor = conn.cursor()

    try:
        # 1. Providers
        provider_rows = []
        seen_providers = set()

        for _, row in df.iterrows():
            provider_name = normalize_text(row.get("provider"))
            if provider_name and provider_name not in seen_providers:
                seen_providers.add(provider_name)
                provider_rows.append((provider_name,))

        if provider_rows:
            provider_sql = """
                INSERT IGNORE INTO providers (provider_name)
                VALUES (%s)
            """
            for batch in chunks(provider_rows, BATCH_SIZE):
                cursor.executemany(provider_sql, batch)

        conn.commit()

        cursor.execute("SELECT provider_id, provider_name FROM providers")
        provider_map = {name: pid for pid, name in cursor.fetchall()}

        # 2. Authorities
        authority_rows = []
        seen_authority_keys = set()

        for _, row in df.iterrows():
            authority_key = make_authority_key(row)
            authority_id = normalize_text(row.get("authority_id"))
            authority_name = normalize_text(row.get("authority_name"))
            provider_name = normalize_text(row.get("provider"))

            if authority_key in seen_authority_keys:
                continue

            provider_id = provider_map.get(provider_name)
            if provider_id is None or not authority_name:
                continue

            seen_authority_keys.add(authority_key)
            authority_rows.append((authority_key, authority_id, authority_name, provider_id))

        if authority_rows:
            authority_sql = """
                INSERT INTO authorities (authority_key, authority_id, authority_name, provider_id)
                VALUES (%s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    authority_id = VALUES(authority_id),
                    authority_name = VALUES(authority_name),
                    provider_id = VALUES(provider_id)
            """
            for batch in chunks(authority_rows, BATCH_SIZE):
                cursor.executemany(authority_sql, batch)

        conn.commit()

        cursor.execute("SELECT authority_pk, authority_key FROM authorities")
        authority_map = {key: authority_pk for authority_pk, key in cursor.fetchall()}

        # 3. Facility types
        facility_type_rows = []
        seen_types = set()

        for _, row in df.iterrows():
            facility_type = normalize_text(row.get("facility_type"))
            if facility_type and facility_type not in seen_types:
                seen_types.add(facility_type)
                facility_type_rows.append((facility_type,))

        if facility_type_rows:
            facility_type_sql = """
                INSERT IGNORE INTO facility_types (facility_type_name)
                VALUES (%s)
            """
            for batch in chunks(facility_type_rows, BATCH_SIZE):
                cursor.executemany(facility_type_sql, batch)

        conn.commit()

        cursor.execute("SELECT facility_type_id, facility_type_name FROM facility_types")
        facility_type_map = {name: facility_type_id for facility_type_id, name in cursor.fetchall()}

        # 4. Locations
        location_rows = []
        seen_location_keys = set()

        for _, row in df.iterrows():
            location_key = make_location_key(row)
            if location_key in seen_location_keys:
                continue

            seen_location_keys.add(location_key)
            latitude, longitude = extract_lat_long(row.get("geometry"))
            
            location_rows.append(
                (
                    location_key,
                    normalize_text(row.get("full_address")),
                    normalize_text(row.get("streetAddress")),
                    normalize_text(row.get("postalCode")),
                    normalize_text(row.get("addressLocality")),
                    normalize_text(row.get("province_code")),
                    normalize_text(row.get("dguid")),
                    normalize_text(row.get("csdname")),
                    normalize_text(row.get("geometry")),
                    latitude,
                    longitude,
                )
            )

        if location_rows:
            location_sql = """
                INSERT IGNORE INTO locations (
                    location_key,
                    full_address,
                    street_address,
                    postal_code,
                    locality,
                    province_code,
                    dguid,
                    csdname,
                    geometry,
                    latitude,
                    longitude
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            for batch in chunks(location_rows, BATCH_SIZE):
                cursor.executemany(location_sql, batch)

        conn.commit()

        cursor.execute("SELECT location_id, location_key FROM locations")
        location_map = {key: location_id for location_id, key in cursor.fetchall()}

        # 5. Facilities
        facility_rows = []

        for _, row in df.iterrows():
            unique_id = normalize_text(row.get("unique_id"))
            if not unique_id:
                continue

            authority_key = make_authority_key(row)
            facility_type_name = normalize_text(row.get("facility_type"))
            location_key = make_location_key(row)

            authority_pk = authority_map.get(authority_key)
            facility_type_id = facility_type_map.get(facility_type_name)
            location_id = location_map.get(location_key)

            if authority_pk is None or facility_type_id is None or location_id is None:
                continue

            facility_rows.append(
                (
                    unique_id,
                    clean_value(row.get("geocode")),
                    clean_value(row.get("source_id")),
                    normalize_text(row.get("school_id")),
                    normalize_text(row.get("facility_name")),
                    normalize_text(row.get("min_grade")),
                    normalize_text(row.get("max_grade")),
                    to_int_flag(row.get("ISCED010")),
                    to_int_flag(row.get("ISCED020")),
                    to_int_flag(row.get("ISCED1")),
                    to_int_flag(row.get("ISCED2")),
                    to_int_flag(row.get("ISCED3")),
                    to_int_flag(row.get("ISCED4Plus")),
                    to_int_flag(row.get("is_OLMS")),
                    to_int_flag(row.get("french_immersion")),
                    to_int_flag(row.get("early_immersion")),
                    to_int_flag(row.get("middle_immersion")),
                    to_int_flag(row.get("late_immersion")),
                    normalize_text(row.get("date_updated")),
                    authority_pk,
                    facility_type_id,
                    location_id,
                )
            )

        if facility_rows:
            facility_sql = """
                INSERT INTO facilities (
                    unique_id,
                    geocode,
                    source_id,
                    school_id,
                    facility_name,
                    min_grade,
                    max_grade,
                    ISCED010,
                    ISCED020,
                    ISCED1,
                    ISCED2,
                    ISCED3,
                    ISCED4Plus,
                    is_OLMS,
                    french_immersion,
                    early_immersion,
                    middle_immersion,
                    late_immersion,
                    date_updated,
                    authority_pk,
                    facility_type_id,
                    location_id
                )
                VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
                ON DUPLICATE KEY UPDATE
                    geocode = VALUES(geocode),
                    source_id = VALUES(source_id),
                    school_id = VALUES(school_id),
                    facility_name = VALUES(facility_name),
                    min_grade = VALUES(min_grade),
                    max_grade = VALUES(max_grade),
                    ISCED010 = VALUES(ISCED010),
                    ISCED020 = VALUES(ISCED020),
                    ISCED1 = VALUES(ISCED1),
                    ISCED2 = VALUES(ISCED2),
                    ISCED3 = VALUES(ISCED3),
                    ISCED4Plus = VALUES(ISCED4Plus),
                    is_OLMS = VALUES(is_OLMS),
                    french_immersion = VALUES(french_immersion),
                    early_immersion = VALUES(early_immersion),
                    middle_immersion = VALUES(middle_immersion),
                    late_immersion = VALUES(late_immersion),
                    date_updated = VALUES(date_updated),
                    authority_pk = VALUES(authority_pk),
                    facility_type_id = VALUES(facility_type_id),
                    location_id = VALUES(location_id)
            """
            for batch in chunks(facility_rows, BATCH_SIZE):
                cursor.executemany(facility_sql, batch)

        conn.commit()
        print("Data import completed successfully.")

    except Error as e:
        conn.rollback()
        print(f"Database error: {e}")
        raise
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    main()