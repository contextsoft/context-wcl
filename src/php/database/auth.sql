-- Create Database "Auth" ver. 1.03. Generated on 11/21/2016
-- ## TargetDB: MYSQL5; Delimiter: ";"; Comments: "--;#";

CREATE TABLE user (
  id INTEGER(11) NOT NULL AUTO_INCREMENT,
  photoURL VARCHAR(255),
  displayName VARCHAR(255),
  firstName VARCHAR(255),
  lastName VARCHAR(255),
  email VARCHAR(255),
  password VARCHAR(255),
  emailConfirmed CHAR(1) NOT NULL DEFAULT 'F',
  emailConfirmationKey VARCHAR(255),
  passwordResetKey VARCHAR(255),
  PRIMARY KEY (id),
  UNIQUE  UK_user_email(email)
);

CREATE TABLE user_provider (
  userid INTEGER(11) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  provider_userid VARCHAR(255) NOT NULL,
  PRIMARY KEY (userid,provider)
);

CREATE TABLE user_file (
  id INTEGER NOT NULL AUTO_INCREMENT,
  user_id INTEGER NOT NULL,
  file_id INTEGER,
  name VARCHAR(64) NOT NULL,
  directory TINYINT NOT NULL DEFAULT 0,
  file_name VARCHAR(128),
  PRIMARY KEY (id),
  UNIQUE  Idx_user_file_U(user_id,file_id,name)
);

CREATE TABLE user_variable (
  id INTEGER NOT NULL AUTO_INCREMENT,
  user_id INTEGER NOT NULL,
  name VARCHAR(250) NOT NULL,
  value TEXT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE  Idx_user_variable_U(user_id,name)
);


ALTER TABLE user_provider
  ADD CONSTRAINT FK_user_provider_user FOREIGN KEY (userid) REFERENCES user(id)
     ON DELETE NO ACTION ON UPDATE NO ACTION;


ALTER TABLE user_file
  ADD CONSTRAINT FK_user_file_user FOREIGN KEY (user_id) REFERENCES user(id)
     ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE user_file
  ADD CONSTRAINT FK_user_file_user_file FOREIGN KEY (file_id) REFERENCES user_file(id)
     ON DELETE CASCADE ON UPDATE CASCADE;


ALTER TABLE user_variable
  ADD CONSTRAINT FK_user_variable_user FOREIGN KEY (user_id) REFERENCES user(id)
     ON DELETE CASCADE ON UPDATE CASCADE;