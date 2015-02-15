-- create a table to append all zipcode tables to
CREATE TABLE allzipcodes (
    house_no TEXT,
    street TEXT,
    units_2009 INTEGER,
    units_2010 INTEGER,
    units_2011 INTEGER,
    units_2012 INTEGER,
    units_2013 INTEGER,
    units_2014 INTEGER,
    code  TEXT,
    notes TEXT,
    note_author TEXT,
    date date
);

-- insert zipcode 10024 data
INSERT INTO allzipcodes (
    house_no,
    street,
    units_2009,
    units_2010,
    units_2011,
    units_2012,
    units_2013,
    units_2014,
    code,
    notes,
    note_author,
    date
)
SELECT 
     house_number,
     street,
     stabilized_units_2009,
     stabilized_units_2010,
     stabilized_units_2011,
     stabilized_units_2012,
     stabilized_units_2013,
     stabilized_units_2014,
     code,
     notes,
     note_author,
     date
FROM
    zip10024;

-- insert zipcode 10025 data
INSERT INTO allzipcodes (
    house_no,
    street,
    units_2009,
    units_2010,
    units_2011,
    units_2012,
    units_2013,
    units_2014,
    code,
    notes,
    note_author,
    date
)
SELECT 
     house_number,
     street,
     stabilized_units_2009,
     stabilized_units_2010,
     stabilized_units_2011,
     stabilized_units_2012,
     stabilized_units_2013,
     stabilized_units_2014,
     code,
     notes,
     note_author,
     date
FROM
    zip10023;

-- to export data do:
-- COPY allzipcodes to '/Users/chrislhenrick/development/nyc_district6_rent_stabl/data/zipcodes10023_10024.csv' 
-- delimiter ',' CSV HEADER;

-- after grabbing bbl numbers from geo client api and importing tax lots for council 06
SELECT addGeometryColumn('allzipcodes_bbl', 'geom', 4326, 'Polygon', 2);

UPDATE "allzipcodes_bbl" SET geom = (
    SELECT wkb_geometry 
    FROM council6_pluto 
    WHERE council6_pluto.bbl = a.bbl
);

-- update lat lng columns to that of tax lot polygon centroid
update "allzipcodes_bbl" set lat = ST_X(ST_Centroid(geom));
update "allzipcodes_bbl" set lng = ST_Y(ST_Centroid(geom));

-- convert null values to 0
update "allzipcodes_bbl" set units_2009 = 0 where units_2009 is null;
update "allzipcodes_bbl" set units_2010 = 0 where units_2010 is null;
update "allzipcodes_bbl" set units_2011 = 0 where units_2011 is null;
update "allzipcodes_bbl" set units_2012 = 0 where units_2012 is null;
update "allzipcodes_bbl" set units_2013 = 0 where units_2013 is null;
update "allzipcodes_bbl" set units_2014 = 0 where units_2014 is null;

-- update "table_10023_10024_geo" set units_2009 = 0 where units_2009 is null;
-- update "table_10023_10024_geo" set units_2010 = 0 where units_2010 is null;
-- update "table_10023_10024_geo" set units_2011 = 0 where units_2011 is null;
-- update "table_10023_10024_geo" set units_2012 = 0 where units_2012 is null;
-- update "table_10023_10024_geo" set units_2013 = 0 where units_2013 is null;
-- update "table_10023_10024_geo" set units_2014 = 0 where units_2014 is null;