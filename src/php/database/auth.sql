-- Create Database "Auth" ver. N/A. Generated on 12/15/2016
-- ## TargetDB: MYSQL5; Delimiter: "@@"; Comments: "--;#";

CREATE TABLE User (
  Id INTEGER(11) NOT NULL AUTO_INCREMENT,
  Photo_URL VARCHAR(255),
  Display_Name VARCHAR(32),
  First_Name VARCHAR(32) NOT NULL,
  Last_Name VARCHAR(32) NOT NULL,
  Email VARCHAR(255) NOT NULL,
  Password VARCHAR(255),
  EmailConfirmed CHAR(1) NOT NULL DEFAULT 'F',
  EmailConfirmationKey VARCHAR(255),
  PasswordResetKey VARCHAR(255),
  PRIMARY KEY (Id),
  UNIQUE  UK_user_email(Email)
);

CREATE TABLE User_Provider (
  Id INTEGER(11) NOT NULL AUTO_INCREMENT,
  User_Id INTEGER NOT NULL,
  Provider VARCHAR(32) NOT NULL,
  Provider_User_Id VARCHAR(255) NOT NULL,
  PRIMARY KEY (Id)
);

ALTER TABLE User_Provider
  ADD CONSTRAINT FK_User_Provider_User FOREIGN KEY (User_Id) REFERENCES User(Id)
    ON DELETE NO ACTION ON UPDATE NO ACTION;
