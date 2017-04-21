
DROP TABLE HSP;

CREATE TABLE HSP
(
  hsh character varying(30) primary key,
  sec integer,
  pth character varying(128),
   "content" character varying(2048)
  )
WITH (
  OIDS=FALSE
);

ALTER TABLE HSP
  OWNER TO postgres;
GRANT ALL ON TABLE HSP TO postgres;
GRANT ALL ON TABLE HSP TO joe;


DROP TABLE SPH;

CREATE TABLE SPH
(
  "sec" integer,
  "pth" character varying(128),
  "hsh" character varying(30),
  "content" character varying(2048),
    primary key("sec","pth")
  )
WITH (
  OIDS=FALSE
);

ALTER TABLE SPH
  OWNER TO postgres;
GRANT ALL ON TABLE SPH TO postgres;
GRANT ALL ON TABLE HSP TO joe;


DROP TABLE PSH;


CREATE TABLE PSH
(
 "pth" character varying(128),
  "sec" integer,
  "hsh" character varying(30),
  "content" character varying(2048),
  primary key("pth","sec")
  )
WITH (
  OIDS=FALSE
);

ALTER TABLE PSH
  OWNER TO postgres;
GRANT ALL ON TABLE PSH TO postgres;

GRANT ALL ON TABLE PSH TO joe;