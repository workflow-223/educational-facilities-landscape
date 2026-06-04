CREATE DATABASE IF NOT EXISTS jade_db;
USE jade_db;

CREATE TABLE IF NOT EXISTS providers (
    provider_id INT AUTO_INCREMENT PRIMARY KEY,
    provider_name TEXT NOT NULL,
    UNIQUE KEY uq_provider_name (provider_name(255))
);

CREATE TABLE IF NOT EXISTS authorities (
    authority_pk INT AUTO_INCREMENT PRIMARY KEY,
    authority_key CHAR(64) NOT NULL,
    authority_id TEXT,
    authority_name TEXT NOT NULL,
    provider_id INT NOT NULL,
    UNIQUE KEY uq_authority_key (authority_key),
    CONSTRAINT fk_authorities_provider
        FOREIGN KEY (provider_id) REFERENCES providers(provider_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS facility_types (
    facility_type_id INT AUTO_INCREMENT PRIMARY KEY,
    facility_type_name TEXT NOT NULL,
    UNIQUE KEY uq_facility_type_name (facility_type_name(255))
);

CREATE TABLE IF NOT EXISTS locations (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    location_key CHAR(64) NOT NULL,
    full_address TEXT,
    street_address TEXT,
    postal_code TEXT,
    locality TEXT,
    province_code TEXT,
    dguid TEXT,
    csdname TEXT,
    geometry LONGTEXT,
    latitude DOUBLE,
    longitude DOUBLE,
    UNIQUE KEY uq_location_key (location_key)
);

CREATE TABLE IF NOT EXISTS facilities (
    facility_id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id VARCHAR(255) NOT NULL,
    geocode INT,
    source_id INT,
    school_id TEXT,
    facility_name TEXT NOT NULL,
    min_grade TEXT,
    max_grade TEXT,
    ISCED010 INT,
    ISCED020 INT,
    ISCED1 INT,
    ISCED2 INT,
    ISCED3 INT,
    ISCED4Plus INT,
    is_OLMS INT,
    french_immersion INT,
    early_immersion INT,
    middle_immersion INT,
    late_immersion INT,
    date_updated TEXT,
    authority_pk INT NOT NULL,
    facility_type_id INT NOT NULL,
    location_id INT NOT NULL,
    UNIQUE KEY uq_facility_unique_id (unique_id),
    CONSTRAINT fk_facilities_authority
        FOREIGN KEY (authority_pk) REFERENCES authorities(authority_pk)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_facilities_type
        FOREIGN KEY (facility_type_id) REFERENCES facility_types(facility_type_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_facilities_location
        FOREIGN KEY (location_id) REFERENCES locations(location_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);