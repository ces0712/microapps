CREATE USER upload WITH SUPERUSER PASSWORD 'upload';
CREATE DATABASE upload;
GRANT ALL PRIVILEGES ON DATABASE upload TO upload;
\connect upload
CREATE TABLE fileuploads(id serial NOT NULL, name text, email text, CONSTRAINT pk_id_fileuploads PRIMARY KEY (id));
ALTER TABLE fileuploads OWNER TO upload;
