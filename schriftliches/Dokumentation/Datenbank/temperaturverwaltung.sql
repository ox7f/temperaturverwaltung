-- phpMyAdmin SQL Dump
-- version 5.1.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Erstellungszeit: 26. Jun 2021 um 13:00
-- Server-Version: 10.4.19-MariaDB
-- PHP-Version: 8.0.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Datenbank: `temperaturverwaltung`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `temperatur`
--

CREATE TABLE `temperatur` (
  `TemperaturID` int(11) NOT NULL,
  `Zeit` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `SensorID` int(11) NOT NULL,
  `Temperatur` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Daten für Tabelle `temperatur`
--

INSERT INTO `temperatur` (`TemperaturID`, `Zeit`, `SensorID`, `Temperatur`) VALUES
(5, '2021-06-26 07:32:18', 1, 20),
(6, '2021-06-26 07:32:38', 1, 20.5);

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `temperatur`
--
ALTER TABLE `temperatur`
  ADD PRIMARY KEY (`TemperaturID`),
  ADD KEY `SensorID` (`SensorID`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `temperatur`
--
ALTER TABLE `temperatur`
  MODIFY `TemperaturID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints der exportierten Tabellen
--

--
-- Constraints der Tabelle `temperatur`
--
ALTER TABLE `temperatur`
  ADD CONSTRAINT `temperatur_ibfk_1` FOREIGN KEY (`SensorID`) REFERENCES `sensor` (`SensorID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
