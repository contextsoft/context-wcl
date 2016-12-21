-- Create Database "Auth" ver. N/A. Generated on 12/21/2016
-- ## TargetDB: MYSQL5; Delimiter: "@@"; Comments: "--;#";

CREATE TABLE user (
  id INTEGER(11) NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) COMMENT 'SocialNet may not provide this field, so nullable',
  display_name VARCHAR(255) COMMENT 'SocialNet may not provide this field, so nullable',
  first_name VARCHAR(255) COMMENT 'SocialNet may not provide this field, so nullable',
  last_name VARCHAR(255) COMMENT 'SocialNet may not provide this field, so nullable',
  password VARCHAR(255),
  photo_url VARCHAR(255),
  email_confirmed CHAR(1) NOT NULL DEFAULT 'F',
  email_confirmation_key VARCHAR(255),
  password_reset_key VARCHAR(255),
  PRIMARY KEY (id),
  UNIQUE  IDX_User_Email(email)
);

CREATE TABLE user_provider (
  id INTEGER(11) NOT NULL AUTO_INCREMENT,
  id_user INTEGER NOT NULL,
  provider VARCHAR(255) NOT NULL,
  provider_user_id VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  INDEX IDX_User_Provider_User_Id(id_user),
  INDEX IDX_User_Provider_Provider(provider,provider_user_id)
);

ALTER TABLE user_provider
  ADD CONSTRAINT FK_User_Provider_User FOREIGN KEY (id_user) REFERENCES user(id)
     ON DELETE NO ACTION ON UPDATE NO ACTION;
