-- Create Database "Auth" ver. N/A. Generated on 12/15/2016
-- ## TargetDB: MYSQL5; Delimiter: "@@"; Comments: "--;#";

CREATE TABLE User (
  Id INTEGER(11) NOT NULL AUTO_INCREMENT,
  Photo_URL VARCHAR(255),
  Display_Name VARCHAR(255) COMMENT 'SocialNet may not provide this field, so nullable',
  First_Name VARCHAR(40) COMMENT 'SocialNet may not provide this field, so nullable',
  Last_Name VARCHAR(40) COMMENT 'SocialNet may not provide this field, so nullable',
  Email VARCHAR(255) COMMENT 'SocialNet may not provide this field, so nullable',
  Password VARCHAR(255),
  Email_Confirmed CHAR(1) NOT NULL DEFAULT 'F',
  Email_Confirmation_Key VARCHAR(255),
  Password_Reset_Key VARCHAR(255),
  PRIMARY KEY (Id),
  UNIQUE  IDX_User_Email_Uniq(Email)
);

CREATE TABLE User_Provider (
  Id INTEGER(11) NOT NULL AUTO_INCREMENT,
  User_Id INTEGER NOT NULL,
  Provider VARCHAR(40) NOT NULL,
  Provider_User_Id VARCHAR(255) NOT NULL,
  PRIMARY KEY (Id),
  INDEX IDX_User_Provider_User_Id(User_Id),
  INDEX IDX_User_Provider_Provider(Provider,Provider_User_Id)
);

ALTER TABLE User_Provider
  ADD CONSTRAINT FK_User_Provider_User FOREIGN KEY (User_Id) REFERENCES User(Id)
     ON DELETE NO ACTION ON UPDATE NO ACTION;
