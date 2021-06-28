-- phpMyAdmin SQL Dump
-- version 5.1.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Erstellungszeit: 28. Jun 2021 um 15:52
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
-- Tabellenstruktur für Tabelle `benutzer`
--

CREATE TABLE `benutzer` (
  `BenutzerID` int(11) NOT NULL,
  `Anmeldename` varchar(255) NOT NULL,
  `Telefonnummer` varchar(255) NOT NULL,
  `Administrator` bit(1) DEFAULT b'0',
  `Passwort` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Daten für Tabelle `benutzer`
--

INSERT INTO `benutzer` (`BenutzerID`, `Anmeldename`, `Telefonnummer`, `Administrator`, `Passwort`) VALUES
(1, 'test', '0123456789', b'0', 'test123'),
(2, 'admin', '9876543210', b'1', 'admin123');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `hersteller`
--

CREATE TABLE `hersteller` (
  `HerstellerID` int(11) NOT NULL,
  `Name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Daten für Tabelle `hersteller`
--

INSERT INTO `hersteller` (`HerstellerID`, `Name`) VALUES
(1, 'Hersteller A'),
(2, 'Hersteller B'),
(3, 'Hersteller C');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `log`
--

CREATE TABLE `log` (
  `Zeit` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `LogID` int(11) NOT NULL,
  `SensorID` int(11) NOT NULL,
  `BenutzerID` int(11) NOT NULL,
  `Info` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `sensor`
--

CREATE TABLE `sensor` (
  `SensorID` int(11) NOT NULL,
  `Serverschrank` int(11) NOT NULL,
  `HerstellerID` int(11) NOT NULL,
  `MaximalTemperatur` float NOT NULL,
  `Adresse` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Daten für Tabelle `sensor`
--

INSERT INTO `sensor` (`SensorID`, `Serverschrank`, `HerstellerID`, `MaximalTemperatur`, `Adresse`) VALUES
(1, 1, 1, 90, '10.10.10.1'),
(2, 2, 2, 85, '10.10.10.2'),
(3, 3, 3, 95, '10.10.10.3');

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
-- Indizes für die Tabelle `benutzer`
--
ALTER TABLE `benutzer`
  ADD PRIMARY KEY (`BenutzerID`);

--
-- Indizes für die Tabelle `hersteller`
--
ALTER TABLE `hersteller`
  ADD PRIMARY KEY (`HerstellerID`);

--
-- Indizes für die Tabelle `log`
--
ALTER TABLE `log`
  ADD PRIMARY KEY (`LogID`),
  ADD KEY `SensorID` (`SensorID`),
  ADD KEY `BenutzerID` (`BenutzerID`);

--
-- Indizes für die Tabelle `sensor`
--
ALTER TABLE `sensor`
  ADD PRIMARY KEY (`SensorID`),
  ADD KEY `HerstellerID` (`HerstellerID`);

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
-- AUTO_INCREMENT für Tabelle `benutzer`
--
ALTER TABLE `benutzer`
  MODIFY `BenutzerID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT für Tabelle `hersteller`
--
ALTER TABLE `hersteller`
  MODIFY `HerstellerID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT für Tabelle `log`
--
ALTER TABLE `log`
  MODIFY `LogID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `sensor`
--
ALTER TABLE `sensor`
  MODIFY `SensorID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT für Tabelle `temperatur`
--
ALTER TABLE `temperatur`
  MODIFY `TemperaturID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints der exportierten Tabellen
--

--
-- Constraints der Tabelle `log`
--
ALTER TABLE `log`
  ADD CONSTRAINT `log_ibfk_1` FOREIGN KEY (`SensorID`) REFERENCES `sensor` (`SensorID`),
  ADD CONSTRAINT `log_ibfk_2` FOREIGN KEY (`BenutzerID`) REFERENCES `benutzer` (`BenutzerID`);

--
-- Constraints der Tabelle `sensor`
--
ALTER TABLE `sensor`
  ADD CONSTRAINT `sensor_ibfk_1` FOREIGN KEY (`HerstellerID`) REFERENCES `hersteller` (`HerstellerID`);

--
-- Constraints der Tabelle `temperatur`
--
ALTER TABLE `temperatur`
  ADD CONSTRAINT `temperatur_ibfk_1` FOREIGN KEY (`SensorID`) REFERENCES `sensor` (`SensorID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
