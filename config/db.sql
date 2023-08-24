CREATE DATABASE survey_responses;

USE survey_responses;

CREATE TABLE IF NOT EXISTS `resshh` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `groupname` VARCHAR(255) NOT NULL,
  `firstname` VARCHAR(255) NOT NULL,
  `lastname` VARCHAR(255) NOT NULL,
  `dob` DATE NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(255) NOT NULL,
  `maritalstatus` VARCHAR(255) NOT NULL,
  `idnumber` VARCHAR(255) NOT NULL,
  `occupation` VARCHAR(255) NOT NULL,
  `incomesource` VARCHAR(255) NOT NULL,
  `monthlyincome` INT(11) NOT NULL,
  `children` BOOLEAN NOT NULL,
  `under5` INT(11) DEFAULT NULL,
  `children6to11` INT(11) DEFAULT NULL,
  `children12to18` INT(11) DEFAULT NULL,
  `landstatus` VARCHAR(255) NOT NULL,
  `landsize` FLOAT NOT NULL,
  `cropgrown` VARCHAR(255) NOT NULL,
  `marketaccess` VARCHAR(255) NOT NULL,
  `wateraccess` VARCHAR(255) NOT NULL,
  `animals` VARCHAR(255) NOT NULL,
  `lastcrop` VARCHAR(255) NOT NULL,
  `cropincome` INT(11) NOT NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
