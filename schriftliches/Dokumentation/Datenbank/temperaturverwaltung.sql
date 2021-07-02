-- phpMyAdmin SQL Dump
-- version 4.9.0.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jul 02, 2021 at 12:28 PM
-- Server version: 10.4.6-MariaDB
-- PHP Version: 7.3.8

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `temperaturverwaltung`
--

-- --------------------------------------------------------

--
-- Table structure for table `benutzer`
--

CREATE TABLE `benutzer` (
  `BenutzerID` int(11) NOT NULL,
  `Anmeldename` varchar(255) NOT NULL,
  `Telefonnummer` varchar(255) NOT NULL,
  `Administrator` bit(1) DEFAULT b'0',
  `Passwort` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `benutzer`
--

INSERT INTO `benutzer` (`BenutzerID`, `Anmeldename`, `Telefonnummer`, `Administrator`, `Passwort`) VALUES
(1, 'test', '0123456789', b'0', 'test123'),
(2, 'admin', '9876543210', b'1', 'admin123'),
(3, 'socket', '123456789', b'0', 'socket123');

-- --------------------------------------------------------

--
-- Table structure for table `hersteller`
--

CREATE TABLE `hersteller` (
  `HerstellerID` int(11) NOT NULL,
  `Name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `hersteller`
--

INSERT INTO `hersteller` (`HerstellerID`, `Name`) VALUES
(1, 'Hersteller A'),
(2, 'Hersteller B'),
(3, 'Hersteller C');

-- --------------------------------------------------------

--
-- Table structure for table `log`
--

CREATE TABLE `log` (
  `LogID` int(11) NOT NULL,
  `SensorID` int(11) NOT NULL,
  `BenutzerID` int(11) NOT NULL,
  `MaximalTemperatur` float NOT NULL,
  `Zeit` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `sensor`
--

CREATE TABLE `sensor` (
  `SensorID` int(11) NOT NULL,
  `Serverschrank` int(11) NOT NULL,
  `HerstellerID` int(11) NOT NULL,
  `MaximalTemperatur` float NOT NULL,
  `Adresse` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `sensor`
--

INSERT INTO `sensor` (`SensorID`, `Serverschrank`, `HerstellerID`, `MaximalTemperatur`, `Adresse`) VALUES
(1, 1, 1, 90, '10.10.10.1'),
(2, 2, 2, 85, '10.10.10.2'),
(3, 3, 3, 95, '10.10.10.3');

-- --------------------------------------------------------

--
-- Table structure for table `temperatur`
--

CREATE TABLE `temperatur` (
  `TemperaturID` int(11) NOT NULL,
  `Zeit` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `SensorID` int(11) NOT NULL,
  `Temperatur` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `temperatur`
--

INSERT INTO `temperatur` (`TemperaturID`, `Zeit`, `SensorID`, `Temperatur`) VALUES
(5, '2021-06-26 07:32:18', 1, 20),
(6, '2021-06-26 07:32:38', 1, 20.5);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `benutzer`
--
ALTER TABLE `benutzer`
  ADD PRIMARY KEY (`BenutzerID`);

--
-- Indexes for table `hersteller`
--
ALTER TABLE `hersteller`
  ADD PRIMARY KEY (`HerstellerID`);

--
-- Indexes for table `log`
--
ALTER TABLE `log`
  ADD PRIMARY KEY (`LogID`),
  ADD KEY `BenutzerID` (`BenutzerID`),
  ADD KEY `SensorID` (`SensorID`);

--
-- Indexes for table `sensor`
--
ALTER TABLE `sensor`
  ADD PRIMARY KEY (`SensorID`),
  ADD KEY `HerstellerID` (`HerstellerID`);

--
-- Indexes for table `temperatur`
--
ALTER TABLE `temperatur`
  ADD PRIMARY KEY (`TemperaturID`),
  ADD KEY `SensorID` (`SensorID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `benutzer`
--
ALTER TABLE `benutzer`
  MODIFY `BenutzerID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `hersteller`
--
ALTER TABLE `hersteller`
  MODIFY `HerstellerID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `log`
--
ALTER TABLE `log`
  MODIFY `LogID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sensor`
--
ALTER TABLE `sensor`
  MODIFY `SensorID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `temperatur`
--
ALTER TABLE `temperatur`
  MODIFY `TemperaturID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `log`
--
ALTER TABLE `log`
  ADD CONSTRAINT `log_ibfk_1` FOREIGN KEY (`BenutzerID`) REFERENCES `benutzer` (`BenutzerID`),
  ADD CONSTRAINT `log_ibfk_2` FOREIGN KEY (`SensorID`) REFERENCES `sensor` (`SensorID`);

--
-- Constraints for table `sensor`
--
ALTER TABLE `sensor`
  ADD CONSTRAINT `sensor_ibfk_1` FOREIGN KEY (`HerstellerID`) REFERENCES `hersteller` (`HerstellerID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
