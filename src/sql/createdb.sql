
-- DROP DATABASE abot;

CREATE DATABASE ddd
  WITH OWNER = postgres
       ENCODING = 'UTF8'
       TABLESPACE = pg_default
       LC_COLLATE = 'English_United States.1252'
       LC_CTYPE = 'English_United States.1252'
       CONNECTION LIMIT = -1;
GRANT ALL ON DATABASE ddd TO postgres;
GRANT ALL ON DATABASE ddd TO joeadmin;
GRANT CONNECT ON DATABASE ddd TO joe;
REVOKE ALL ON DATABASE ddd FROM public;



COMMENT ON DATABASE ddd
  IS 'ddd database';