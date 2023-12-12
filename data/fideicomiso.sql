-- MariaDB dump 10.19-11.0.3-MariaDB, for osx10.19 (x86_64)
--
-- Host: localhost    Database: fideicomiso
-- ------------------------------------------------------
-- Server version	11.0.3-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `comprobante`
--

DROP TABLE IF EXISTS `comprobante`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comprobante` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `plan` int(11) DEFAULT NULL,
  `codigo` varchar(255) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `detalle` varchar(255) DEFAULT NULL,
  `fecha_operacion` date DEFAULT NULL,
  `fecha_ejercicio` date DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `debe` decimal(15,2) DEFAULT NULL,
  `haber` decimal(15,2) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf32 COLLATE=utf32_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comprobante`
--

LOCK TABLES `comprobante` WRITE;
/*!40000 ALTER TABLE `comprobante` DISABLE KEYS */;
INSERT INTO `comprobante` VALUES
(13,1,'','APORTE INICIAL','G-20000085-6 - BANCO NACIONAL DE HABITAT Y VIVIENDA (BANAVIH)','2023-12-05','2023-12-05','2023-12-07 19:52:35',1926224.12,1926224.12),
(14,3,'','APORTE INICIAL','J0001 - PREGUNTON OMAR','2023-12-05','2023-12-05','2023-12-07 19:52:35',800000.00,800000.00),
(15,4,'','APORTE INICIAL','J-0987654321 - CARLOS ENRIQUE ALBARRA','2023-12-05','2023-12-05','2023-12-07 19:52:35',1500000.00,1500000.00),
(30,1,'0001','INCREMENTO DE CAPITAL','G-20000085-6-BANCO NACIONAL DE HABITAT Y VIVIENDA (BANAVIH)','2023-12-06','2023-12-06','2023-12-11 14:43:02',370000.00,370000.00),
(31,3,'0003','INCREMENTO DE CAPITAL','J0001-PREGUNTON OMAR','2023-12-06','2023-12-06','2023-12-11 14:43:02',275600.00,275600.00);
/*!40000 ALTER TABLE `comprobante` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cuenta`
--

DROP TABLE IF EXISTS `cuenta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cuenta` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo_padre` char(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `parte` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `moneda` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `nivel_1` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `nivel_2` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `nivel_3` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `nivel_4` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `nivel_5` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `descripcion` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `aumenta` char(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `disminuye` char(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `totalizadora` int(11) DEFAULT NULL,
  `fecha` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `usuario` char(64) CHARACTER SET utf32 COLLATE utf32_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cuenta`
--

LOCK TABLES `cuenta` WRITE;
/*!40000 ALTER TABLE `cuenta` DISABLE KEYS */;
INSERT INTO `cuenta` VALUES
(1,'710','00','0','00','00','00','00','00','ACTIVOS DE LOS FIDEICOMISOS','DEBE','HABER',1,'2023-09-01 20:12:55',''),
(2,'711','00','0','00','00','00','00','00','disponibilidades','DEBE','HABER',2,'2023-09-01 20:19:35',''),
(3,'711','02','1','01','00','00','00','00','disponibilidad en cuenta operativa','DEBE','HABER',0,'2023-09-01 20:20:04',''),
(4,'712','00','0','00','00','00','00','00','INVERSIONES EN TITULOS VALORES MANTENIDAS HASTA SU VENCIMIENTO','DEBE','HABER',2,'2023-08-30 15:17:18',''),
(5,'712','30','1','08','00','00','00','00','inversiones en papeles comerciales','DEBE','HABER',0,NULL,''),
(6,'712','30','1','09','00','00','00','00','deposito para microcredito','DEBE','HABER',0,'2023-09-05 15:38:31',''),
(7,'714','00','0','00','00','00','00','00','intereses y comisiones por cobrar','DEBE','HABER',2,'2023-08-30 12:22:36',''),
(8,'714','20','1','03','07','00','00','00','rend. por cobrar en papeles comerciales','DEBE','HABER',0,'2023-08-30 11:58:13',''),
(9,'714','20','1','03','08','00','00','00','rend. por cobrar deposito para microcredito','DEBE','HABER',0,NULL,''),
(10,'718','00','0','00','00','00','00','00','otros activos','DEBE','HABER',2,'2023-08-30 12:22:36',''),
(11,'718','99','1','02','01','00','00','00','otras cuentas por cobrar','DEBE','HABER',0,NULL,''),
(12,'720','00','0','00','00','00','00','00','pasivos de los fideicomisos','HABER','DEBE',1,NULL,''),
(13,'722','00','0','00','00','00','00','00','otras cuentas por pagar','HABER','DEBE',2,'2023-08-30 12:22:37',''),
(14,'722','01','1','01','00','00','00','00','comisiones por pagar admon fideicomiso','HABER','DEBE',0,NULL,''),
(15,'722','04','1','05','00','00','00','00','otras cuentas por pagar','HABER','DEBE',0,NULL,''),
(16,'730','00','0','00','00','00','00','00','patrimonio de los fideicomiso','HABER','DEBE',1,'2023-09-01 23:14:30',''),
(17,'731','00','0','00','00','00','00','00','PATRIMONIO ASIGNADO DE LOS FIDEICOMISO','HABER','DEBE',2,'2023-09-01 23:13:05',''),
(18,'731','01','1','01','00','00','00','00','fideicomiso de inversion','HABER','DEBE',0,NULL,''),
(19,'731','02','1','99','00','00','00','00','otros de administracion','HABER','DEBE',0,NULL,''),
(20,'734','00','0','00','00','00','00','00','RESULTADOS ACUMULADOS','HABER','DEBE',1,'2023-09-03 20:48:19',''),
(21,'740','00','0','00','00','00','00','00','GASTOS DE LOS FIDEICOMISOS','DEBE','HABER',1,'2023-09-01 23:14:30',''),
(22,'741','00','0','00','00','00','00','00','GASTOS FINANCIEROS','DEBE','HABER',2,'2023-08-30 12:22:38',''),
(23,'744','05','1','00','00','00','00','00','GASTOS POR ADMINISTRACION','DEBE','HABER',0,NULL,''),
(24,'744','06','1','00','00','00','00','00','GASTOS POR DESEMBOLSO','DEBE','HABER',0,NULL,''),
(25,'744','22','1','00','00','00','00','00','GASTOS COMISION POR TRANSFERENCIA','DEBE','HABER',0,NULL,''),
(26,'750','00','0','00','00','00','00','00','INGRESOS DE LOS FIDEICOMISO','HABER','DEBE',1,NULL,''),
(27,'751','00','0','00','00','00','00','00','INGRESOS FINANCIEROS','HABER','DEBE',2,'2023-08-30 12:22:38',''),
(28,'751','01','1','04','00','00','00','00','INGRESOS FINANCIEROS X DISPONIBILIDAD','HABER','DEBE',0,NULL,''),
(29,'751','01','1','12','00','00','00','00','INGRESOS PAPELES COMERCIALES','HABER','DEBE',0,NULL,''),
(30,'751','01','1','13','00','00','00','00','INGRESOS DEPOSITO PARA MICROCREDITO','HABER','DEBE',0,NULL,''),
(31,'752','00','0','00','00','00','00','00','INGRESOS P/RECUPERAC. ACTIVOS FINANCIER','HABER','DEBE',2,'2023-08-30 12:22:38',''),
(32,'712','30','1','00','00','00','00','00','INVERSIONES EN PAGARE','DEBE','HABER',0,'2023-08-30 15:20:55',''),
(33,'712','30','1','07','00','00','00','00','pagare bursatil','DEBE','HABER',0,'2023-08-30 12:20:44',''),
(34,'714','20','1','03','06','00','00','00','REND. POR COBRAR PAGARE BURSATIL','DEBE','HABER',0,NULL,''),
(35,'751','01','1','03','00','00','00','00','INGRESOS PAGARE BURSATIL','HABER','DEBE',0,NULL,''),
(36,'712','30','1','06','00','00','00','00','CERTIFICADO DE DEPOSITO A PLAZO','DEBE','HABER',0,'2023-08-30 12:20:44',''),
(37,'714','20','1','03','05','00','00','00','REND. POR COBRAR CERTIFICADO DE DEPOSITO A PLAZO','DEBE','HABER',0,NULL,''),
(38,'751','01','1','02','00','00','00','00','INGRESO POR INTERESES CERTIFICADO DEPOSITO PLAZO','HABER','DEBE',0,NULL,''),
(39,'744','00','1','00','00','00','00','00','gastos generales y administrativa','DEBE','HABER',2,'2023-08-30 12:22:38',''),
(40,'734','00','1','00','00','00','00','00','RESULTADOS ACUMULADOS','HABER','DEBE',0,'2023-09-03 20:52:45','');
/*!40000 ALTER TABLE `cuenta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cuenta_configuracion`
--

DROP TABLE IF EXISTS `cuenta_configuracion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cuenta_configuracion` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `idc` int(11) DEFAULT NULL,
  `idi` int(11) DEFAULT NULL,
  `tip` char(1) DEFAULT NULL,
  `acc` char(1) DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `ope` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf32 COLLATE=utf32_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cuenta_configuracion`
--

LOCK TABLES `cuenta_configuracion` WRITE;
/*!40000 ALTER TABLE `cuenta_configuracion` DISABLE KEYS */;
INSERT INTO `cuenta_configuracion` VALUES
(26,3,0,'A','A','2023-12-06 17:53:03',2),
(27,19,0,'A','A','2023-12-06 17:53:03',2),
(29,3,0,'A','A','2023-12-06 18:30:31',0),
(30,18,0,'A','A','2023-12-06 18:30:31',0),
(31,3,0,'R','D','2023-12-06 21:18:06',0),
(32,18,0,'R','D','2023-12-06 21:31:35',0),
(33,3,0,'R','D','2023-12-07 20:08:32',2),
(34,19,0,'R','D','2023-12-07 20:08:32',2),
(35,3,0,'T','A','2023-12-07 20:09:14',0),
(36,18,0,'T','A','2023-12-07 20:09:14',0),
(37,19,0,'T','A','2023-12-07 20:09:38',2),
(38,3,0,'T','A','2023-12-07 20:10:20',2),
(39,23,0,'D','A','2023-12-11 19:26:32',3),
(40,14,0,'D','A','2023-12-11 19:26:32',3);
/*!40000 ALTER TABLE `cuenta_configuracion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_comprobante`
--

DROP TABLE IF EXISTS `detalle_comprobante`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `detalle_comprobante` (
  `id_comprobante` int(11) DEFAULT NULL,
  `cuenta` int(11) DEFAULT NULL,
  `debe` decimal(15,2) DEFAULT NULL,
  `haber` decimal(15,2) DEFAULT NULL,
  `fecha_operacion` date DEFAULT NULL,
  `fecha_ejercicio` date DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `plan` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf32 COLLATE=utf32_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_comprobante`
--

LOCK TABLES `detalle_comprobante` WRITE;
/*!40000 ALTER TABLE `detalle_comprobante` DISABLE KEYS */;
INSERT INTO `detalle_comprobante` VALUES
(13,3,1926224.12,0.00,'2023-12-05','2023-12-05','2023-12-07 19:52:35',1),
(13,18,0.00,1926224.12,'2023-12-05','2023-12-05','2023-12-07 19:52:35',1),
(14,3,800000.00,0.00,'2023-12-05','2023-12-05','2023-12-07 19:52:35',3),
(14,19,0.00,800000.00,'2023-12-05','2023-12-05','2023-12-07 19:52:35',3),
(15,3,1500000.00,0.00,'2023-12-05','2023-12-05','2023-12-07 19:52:35',4),
(15,18,0.00,1500000.00,'2023-12-05','2023-12-05','2023-12-07 19:52:35',4),
(30,3,370000.00,0.00,'2023-12-06','2023-12-06','2023-12-11 14:43:02',1),
(30,18,0.00,370000.00,'2023-12-06','2023-12-06','2023-12-11 14:43:02',1),
(31,3,275600.00,0.00,'2023-12-06','2023-12-06','2023-12-11 14:43:02',3),
(31,19,0.00,275600.00,'2023-12-06','2023-12-06','2023-12-11 14:43:02',3);
/*!40000 ALTER TABLE `detalle_comprobante` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `instrumento`
--

DROP TABLE IF EXISTS `instrumento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `instrumento` (
  `id` int(11) DEFAULT NULL,
  `nombre` varchar(256) DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf32 COLLATE=utf32_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instrumento`
--

LOCK TABLES `instrumento` WRITE;
/*!40000 ALTER TABLE `instrumento` DISABLE KEYS */;
INSERT INTO `instrumento` VALUES
(1,'ACCIONES','2023-08-07 13:58:40'),
(2,'ADR','2023-08-07 13:58:40'),
(3,'BONOS AGRICOLAS','2023-08-07 13:58:40'),
(4,'CAPITAL ASIGNADO EN INVERSIONES A SUCURSALES','2023-08-07 13:58:40'),
(5,'COLOCACIONES EN EL SECTOR AGRICOLA','2023-08-07 13:58:40'),
(6,'COLOCACIONES EN EL SECTOR TURISMO','2023-08-07 13:58:40'),
(7,'BODEN','2023-08-07 13:58:40'),
(8,'BONOS QUIROGRAFARIOS','2023-08-07 13:58:40'),
(9,'BONOS INTERNACIONALES','2023-08-07 13:58:40'),
(10,'BONO DE LA DEUDA PUBLICA NACIONAL','2023-08-07 13:58:40'),
(11,'BONOS GLOBALES','2023-08-07 13:58:40'),
(12,'BONOS PRENDA','2023-08-07 13:58:40'),
(13,'BONOS EMPRESARIALES Y/O CORPORATIVOS','2023-08-07 13:58:40'),
(14,'BONOS DE EXPORTACION','2023-08-07 13:58:40'),
(15,'BONOS DEL TESORO NACIONAL','2023-08-07 13:58:40'),
(16,'BONOS DEL TESORO EXTRANJERO','2023-08-07 13:58:40'),
(17,'BONOS SOBERANOS','2023-08-07 13:58:40'),
(18,'BONOS BRADYS','2023-08-07 13:58:40'),
(19,'CEDULAS HIPOTECARIAS','2023-08-07 13:58:40'),
(20,'CERTIFICADO DE AHORRO','2023-08-07 13:58:40'),
(21,'CERTIFICADO DE CUSTODIA','2023-08-07 13:58:40'),
(22,'CERTIFICADO DE DEPOSITO','2023-08-07 13:58:40'),
(23,'CERTIFICADO DE PARTICIPACION','2023-08-07 13:58:40'),
(24,'CERTIFICADO REINTEGRO TRIBUTARIO','2023-08-07 13:58:40'),
(25,'CERTIFICADO DE MICROCREDITO','2023-08-07 13:58:40'),
(26,'CERTIFICADO DE TENENCIA DE ORO','2023-08-07 13:58:40'),
(27,'CERTIFICADO DE LINEAS CREDITO DOLARES','2023-08-07 13:58:40'),
(28,'CERTIFICADOS DE MONEDA EXTRANJERA','2023-08-07 13:58:40'),
(29,'CHEQUE EN MONEDA EXTRANJERA','2023-08-07 13:58:40'),
(30,'COLECCION DE BILLETES','2023-08-07 13:58:40'),
(31,'COLOCACION EN EL BANCO CENTRAL DE VENEZUELA','2023-08-07 13:58:40'),
(32,'DEPOSITO PLAZO FIJO','2023-08-07 13:58:40'),
(33,'DEPOSITOS EN GARANTIA','2023-08-07 13:58:40'),
(34,'DEPOSITOS A LA VISTA RESTRINGIDOS','2023-08-07 13:58:40'),
(35,'DOCUMENTOS DE FIANZA','2023-08-07 13:58:40'),
(36,'EURO BONO VENEZUELA','2023-08-07 13:58:40'),
(37,'OBLIGACIONES POR FIDEICOMISO DE INVERSION','2023-08-07 13:58:40'),
(38,'LETRAS DEL TESORO NACIONAL','2023-08-07 13:58:40'),
(39,'LETRAS CAMBIO','2023-08-07 13:58:40'),
(40,'LETRAS DEL TESORO EXTRANJERO','2023-08-07 13:58:40'),
(41,'MONEDAS','2023-08-07 13:58:40'),
(42,'OBLIGACIONES QUIROGRAFARIAS','2023-08-07 13:58:40'),
(43,'OBLIGACIONES QUIROGRAFARIA AL PORTADOR','2023-08-07 13:58:40'),
(44,'OBLIGACIONES QUIROGRAFARIAS AL PORTADOR NO CONVERTIBLES EN ACCION','2023-08-07 13:58:40'),
(45,'OBLIGACIONES A LA PAR','2023-08-07 13:58:40'),
(46,'OBLIGACIONES AL PORTADOR','2023-08-07 13:58:40'),
(47,'OBLIGACIONES CON DESCUENTO','2023-08-07 13:58:40'),
(48,'OBLIGACIONES HIPOTECARIAS','2023-08-07 13:58:40'),
(49,'OBLIGACIONES CON PRIMA','2023-08-07 13:58:40'),
(50,'OBLIGACIONES CONVERTIBLES EN ACCIONES','2023-08-07 13:58:40'),
(51,'OBLIGACIONES NO CONVERTIBLES EN ACCIONES','2023-08-07 13:58:40'),
(52,'OBLIGACIONES NOMINATIVA','2023-08-07 13:58:40'),
(53,'OBLIGACIONES NOMINATIVA QUIROGRAFARIA','2023-08-07 13:58:40'),
(54,'OBLIGACIONES SUBORDINADAS','2023-08-07 13:58:40'),
(55,'OBLIGACIONES GARANTIZADAS CON PETROLEO (OIL OBLIGATIONS WARRANTS)','2023-08-07 13:58:40'),
(56,'OVERNIGHT ACTIVO','2023-08-07 13:58:40'),
(57,'PAGARE','2023-08-07 13:58:40'),
(58,'PAPELES COMERCIALES','2023-08-07 13:58:40'),
(59,'PARTICIPACION','2023-08-07 13:58:40'),
(60,'PETROBONOS','2023-08-07 13:58:40'),
(61,'REPORTO ACTIVO','2023-08-07 13:58:40'),
(62,'REPORTO AGRICOLA','2023-08-07 13:58:40'),
(63,'REPORTO PRENDARIO','2023-08-07 13:58:40'),
(64,'TITULOS INTERES Y CAPITAL CUBIERTO (TICC)','2023-08-07 13:58:40'),
(65,'TITULOS INTERES FIJO (TIF)','2023-08-07 13:58:40'),
(66,'VEBONO','2023-08-07 13:58:40'),
(67,'BONOS CAMBIARIOS','2023-08-07 13:58:40'),
(68,'BONOS PDVSA','2023-08-07 13:58:40'),
(69,'CARTA DE CREDITO','2023-08-07 13:58:40'),
(70,'BONOS EL VENEZOLANO','2023-08-07 13:58:40'),
(71,'NOTAS ESTRUCTURADAS','2023-08-07 13:58:40'),
(72,'BONOS DE CUBA','2023-08-07 13:58:40'),
(73,'BONOS SIDETUR','2023-08-07 13:58:40'),
(74,'OBLIGACIONES QUIROGRAFARIAS DE MICROCREDITOS','2023-08-07 13:58:40'),
(75,'COLOCACIONES COLL','2023-08-07 13:58:40'),
(76,'DEPOSITO A PLAZO FIJO DE MICROCREDITO','2023-08-07 13:58:40'),
(77,'EFECTIVO','2023-08-07 13:58:40'),
(78,'CUENTAS CORRIENTES','2023-08-07 13:58:40'),
(79,'REPORTO PASIVO','2023-08-07 13:58:40'),
(80,'AJUSTE AL CAPITAL ASIGNADO A SUCURSALES DEL EXTERIOR','2023-08-07 13:58:40'),
(81,'APORTES TRANSFERIDOS POR LA CASA MATRIZ A SUCURSALES DEL EXTERIOR','2023-08-07 13:58:40'),
(82,'CERTIFICADOS PETROLEOS DE VENEZUELA, S.A. (PDVSA )','2023-08-07 13:58:40'),
(83,'OPERACIONES ENTRE CASA MATRIZ Y SUCURSALES DEL EXTERIOR','2023-08-07 13:58:40'),
(84,'VALORES HIPOTECARIOS ESPECIALES','2023-08-07 13:58:40'),
(85,'BONOS ARS','2023-08-07 13:58:40'),
(86,'CERTIFICADOS HIPOTECARIOS','2023-08-07 13:58:40'),
(87,'GOVERNMENT NATIONAL MORTGAGE ASSOCIATION (GINNIE MAE)','2023-08-07 13:58:40'),
(88,'FONDO MUTUAL (MUTUAL FUNDS)','2023-08-07 13:58:40'),
(89,'FONDO DE INVERSION','2023-08-07 13:58:40'),
(90,'COLOCACIONES EN SUCURSALES EN EL EXTERIOR','2023-08-07 13:58:40'),
(91,'NOTAS DE CANJE BCV','2023-08-07 13:58:40'),
(92,'PORTAFOLIOS DE TITULOS','2023-08-07 13:58:40'),
(93,'CERTIFICADO DE PARTICIPACION DESMATERIALIZADO SIMON BOLIVAR','2023-08-07 13:58:40'),
(94,'VALORES BOLIVARIANOS PARA LA VIVIENDA','2023-08-07 13:58:40'),
(95,'DEPOSITOS A LA VISTA PARA GARANTIZAR CARTAS DE CREDITO','2023-08-07 13:58:40'),
(96,'INSTRUMENTO DE INVERSION DIRECTO BCV','2023-08-07 13:58:40'),
(97,'INYECCION DE CAPITAL CON GARANTIA - BCV','2023-08-07 13:58:40'),
(98,'NOTAS BANCO CENTRAL DE VENEZUELA','2023-08-07 13:58:40'),
(99,'OPERACIONES DE MERCADO ABIERTO (OMA)','2023-08-07 13:58:40'),
(100,'CERTIFICADO DE PARTICIPACION BANDES AGRICOLA 2017','2023-08-07 13:58:40'),
(101,'VALORES FINANCIEROS BANDES','2023-08-07 13:58:40'),
(102,'BONO VENEZUELA INTER 2036','2023-08-07 13:58:40'),
(103,'PAGARES USD','2023-08-07 13:58:40'),
(104,'TITULOS DE PARTICIPACION NOMINATIVOS RON','2023-08-07 13:58:40'),
(105,'TITULOS DE PARTICIPACION NOMINATIVOS TOTALMENTE GARANTIZADOS','2023-08-07 13:58:40'),
(106,'VALORES Y BIENES EN CUSTODIA','2023-08-07 13:58:40'),
(107,'INSTRUMENTO A VALOR TRANSABLE','2023-08-07 13:58:40'),
(108,'TITULO DE COBERTURA','2023-08-07 13:58:40');
/*!40000 ALTER TABLE `instrumento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inversiones`
--

DROP TABLE IF EXISTS `inversiones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inversiones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `numero` varchar(6) DEFAULT NULL,
  `id_cartera` int(11) DEFAULT NULL,
  `id_portafolio` int(11) DEFAULT NULL,
  `codigo_isin` varchar(128) DEFAULT NULL,
  `id_instrumento` int(11) DEFAULT NULL,
  `instrumento` varchar(255) DEFAULT NULL,
  `custodio` varchar(255) DEFAULT NULL,
  `emisor` varchar(255) DEFAULT NULL,
  `fecha_emision` date DEFAULT NULL,
  `fecha_compra` date DEFAULT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `tipo_moneda` int(11) DEFAULT NULL,
  `pais` varchar(255) DEFAULT NULL,
  `estatus` int(11) DEFAULT NULL,
  `tipo_inversion` int(11) DEFAULT NULL,
  `valor_nominal` decimal(15,2) DEFAULT NULL,
  `precio_compra` decimal(15,2) DEFAULT NULL,
  `costo_adquisicion` decimal(15,2) DEFAULT NULL,
  `tasa_cupon` decimal(15,2) DEFAULT NULL,
  `base_calculo` int(11) DEFAULT NULL,
  `plazo_cupon` int(11) DEFAULT NULL,
  `rendimiento_cupon` decimal(15,2) DEFAULT NULL,
  `interes_diario` decimal(15,2) DEFAULT NULL,
  `plazo_vencimiento` int(11) DEFAULT NULL,
  `rendimiento_vencimiento` decimal(15,2) DEFAULT NULL,
  `dias_caidos` int(11) DEFAULT NULL,
  `intereses_caidos` decimal(15,2) DEFAULT NULL,
  `amortizacion_diaria` decimal(15,2) DEFAULT NULL,
  `primas` decimal(15,2) DEFAULT NULL,
  `descuento` decimal(15,2) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf32 COLLATE=utf32_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inversiones`
--

LOCK TABLES `inversiones` WRITE;
/*!40000 ALTER TABLE `inversiones` DISABLE KEYS */;
INSERT INTO `inversiones` VALUES
(1,'2023-09-09 21:58:27','0001',0,0,'vev00394ah4a-gc206p',NULL,'58 - PAPELES COMERCIALES','69 - CVV CAJA VENEZOLANA DE VALORESVE','1278 - GENIA CAREVE','2023-06-06','2023-07-07','2023-12-06',1,'VENEZUELA',1,2,565536.00,100.00,565536.00,12.00,360,60,11310.72,188.51,180,33932.16,31,5843.87,0.00,0.00,0.00),
(2,'2023-09-09 22:06:50','',0,0,'vev00431ajz8-ga233p',NULL,'58 - PAPELES COMERCIALES','69 - CVV CAJA VENEZOLANA DE VALORESVE','1354 - GRUPO APRADOC, C.A. (PROCESADORA NACIONAL DE CEREALES, C.A.)VE','2023-06-05','2023-07-07','2023-10-14',1,'VENEZUELA',1,2,565536.00,100.00,565536.00,12.00,360,90,16966.08,188.51,129,24318.05,32,6032.38,0.00,0.00,0.00),
(3,'2023-09-09 22:41:39','',0,0,'9010019746',NULL,'25 - CERTIFICADO DE MICROCREDITO','226 - BANCAMIGA BANCO DE DESARROLLO, C.A.VE','33 - BANCAMIGA, BANCO DE DESARROLLO,CAVE','2023-08-22','2023-08-22','2023-09-13',1,'VENEZUELA',1,1,1231383.73,100.00,1231383.73,55.00,360,22,41388.18,1881.28,22,41388.18,0,0.00,0.00,0.00,0.00),
(4,'2023-09-09 22:43:49','',0,0,'9010019787',NULL,'25 - CERTIFICADO DE MICROCREDITO','226 - BANCAMIGA BANCO DE DESARROLLO, C.A.VE','33 - BANCAMIGA, BANCO DE DESARROLLO,CAVE','2023-08-29','2023-08-29','2023-09-20',1,'VENEZUELA',1,1,1029884.15,100.00,1029884.15,58.00,360,22,36503.67,1659.26,22,36503.67,0,0.00,0.00,0.00,0.00),
(5,'2023-09-09 22:45:52','',0,0,'3280510000285',NULL,'25 - CERTIFICADO DE MICROCREDITO','39 - BANCO NACIONAL DE CREDITO CA BANCO UNIVERSALVE','76 - BANCO NACIONAL DE CREDITO, CA BANCO UNIVERSAL BNCVE','2023-08-31','2023-08-31','2023-09-22',1,'VENEZUELA',1,1,2169579.09,100.00,2169579.09,45.00,360,22,59663.42,2711.97,22,59663.42,0,0.00,0.00,0.00,0.00);
/*!40000 ALTER TABLE `inversiones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mov_comision`
--

DROP TABLE IF EXISTS `mov_comision`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mov_comision` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `id_plan` int(11) DEFAULT NULL,
  `id_cuenta` int(11) DEFAULT NULL,
  `estatus` int(11) DEFAULT NULL,
  `fecha_operacion` date DEFAULT '1900-01-01',
  `fecha_precierre` date DEFAULT '1900-01-01',
  `fecha_cierre` date DEFAULT '1900-01-01',
  `debe` decimal(15,2) DEFAULT NULL,
  `haber` decimal(15,2) DEFAULT NULL,
  `usuario` varchar(128) DEFAULT NULL,
  `llave` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf32 COLLATE=utf32_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mov_comision`
--

LOCK TABLES `mov_comision` WRITE;
/*!40000 ALTER TABLE `mov_comision` DISABLE KEYS */;
/*!40000 ALTER TABLE `mov_comision` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mov_devengo`
--

DROP TABLE IF EXISTS `mov_devengo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mov_devengo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `id_plan` int(11) DEFAULT NULL,
  `estatus` int(11) DEFAULT NULL,
  `fecha_operacion` date DEFAULT '1900-01-01',
  `monto` decimal(15,2) DEFAULT NULL,
  `usuario` varchar(128) DEFAULT NULL,
  `llave` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf32 COLLATE=utf32_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mov_devengo`
--

LOCK TABLES `mov_devengo` WRITE;
/*!40000 ALTER TABLE `mov_devengo` DISABLE KEYS */;
/*!40000 ALTER TABLE `mov_devengo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimientos`
--

DROP TABLE IF EXISTS `movimientos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `movimientos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `id_inversion` int(11) DEFAULT NULL,
  `id_comprobante` int(11) DEFAULT NULL,
  `id_cuenta` int(11) DEFAULT NULL,
  `estatus` int(11) DEFAULT NULL,
  `fecha_operacion` date DEFAULT '1900-01-01',
  `fecha_cierre` date DEFAULT '1900-01-01',
  `debe` decimal(15,2) DEFAULT NULL,
  `haber` decimal(15,2) DEFAULT NULL,
  `usuario` varchar(128) DEFAULT NULL,
  `llave` varchar(255) DEFAULT NULL,
  `id_plan` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=127 DEFAULT CHARSET=utf32 COLLATE=utf32_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimientos`
--

LOCK TABLES `movimientos` WRITE;
/*!40000 ALTER TABLE `movimientos` DISABLE KEYS */;
INSERT INTO `movimientos` VALUES
(113,'2023-12-09 19:36:25',0,13,3,0,'2023-12-05','2023-12-05',1926224.12,0.00,'','',1),
(114,'2023-12-09 19:36:25',0,13,18,0,'2023-12-05','2023-12-05',0.00,1926224.12,'','',1),
(115,'2023-12-09 19:36:25',0,14,3,0,'2023-12-05','2023-12-05',800000.00,0.00,'','',3),
(116,'2023-12-09 19:36:25',0,14,19,0,'2023-12-05','2023-12-05',0.00,800000.00,'','',3),
(117,'2023-12-09 19:36:25',0,15,3,0,'2023-12-05','2023-12-05',1500000.00,0.00,'','',4),
(118,'2023-12-09 19:36:25',0,15,18,0,'2023-12-05','2023-12-05',0.00,1500000.00,'','',4),
(120,'2023-12-11 15:58:06',0,30,3,0,'2023-12-06','2023-12-06',370000.00,0.00,'','',1),
(121,'2023-12-11 15:58:06',0,30,18,0,'2023-12-06','2023-12-06',0.00,370000.00,'','',1),
(122,'2023-12-11 15:58:06',0,31,3,0,'2023-12-06','2023-12-06',275600.00,0.00,'','',3),
(123,'2023-12-11 15:58:06',0,31,19,0,'2023-12-06','2023-12-06',0.00,275600.00,'','',3);
/*!40000 ALTER TABLE `movimientos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plan_fideicomiso`
--

DROP TABLE IF EXISTS `plan_fideicomiso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `plan_fideicomiso` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fideicomiso` varchar(255) DEFAULT NULL,
  `tipo_fideicomiso` varchar(255) DEFAULT NULL,
  `clasificacion` varchar(255) DEFAULT NULL,
  `tipo_comision` int(11) DEFAULT NULL,
  `tasa_comision` decimal(5,2) DEFAULT NULL,
  `tipo_calculo` int(11) DEFAULT NULL,
  `comision_flat` int(11) DEFAULT NULL,
  `tasa_flat` decimal(5,2) DEFAULT NULL,
  `frecuencia` int(11) DEFAULT NULL,
  `metodo_ganancia` int(11) DEFAULT NULL,
  `monto_apertura` decimal(15,2) DEFAULT NULL,
  `fecha` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `usuario` varchar(128) DEFAULT NULL,
  `estatus` int(11) DEFAULT NULL,
  `observacion` varchar(255) DEFAULT NULL,
  `fecha_apertura` date DEFAULT NULL,
  `portafolio` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plan_fideicomiso`
--

LOCK TABLES `plan_fideicomiso` WRITE;
/*!40000 ALTER TABLE `plan_fideicomiso` DISABLE KEYS */;
INSERT INTO `plan_fideicomiso` VALUES
(1,'INVERSION','OTROS','1',1,2.50,1,1,1.00,5,2,1926224.12,'2023-12-07 19:12:29','',2,'G-20000085-6|banco nacional de habitat y vivienda (banavih)','2023-12-05',1),
(3,'ADMINISTRACION','OTROS','1',1,2.00,1,1,1.00,5,2,800000.00,'2023-12-05 18:09:53','',1,'J0001|pregunton omar','2023-12-05',NULL),
(4,'INVERSION','JURIDICO','1',1,2.00,1,1,1.00,1,1,1500000.00,'2023-12-07 19:51:25','',2,'J-0987654321|carlos enrique albarra','2023-12-05',1);
/*!40000 ALTER TABLE `plan_fideicomiso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `portafolio`
--

DROP TABLE IF EXISTS `portafolio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `portafolio` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` varchar(16) DEFAULT NULL,
  `autor` varchar(255) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `distribucion` varchar(255) DEFAULT NULL,
  `frecuencia` varchar(255) DEFAULT NULL,
  `moneda` varchar(255) DEFAULT NULL,
  `numerocuenta` varchar(255) DEFAULT NULL,
  `tipo` varchar(255) DEFAULT NULL,
  `valormercado` varchar(255) DEFAULT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `portafolio`
--

LOCK TABLES `portafolio` WRITE;
/*!40000 ALTER TABLE `portafolio` DISABLE KEYS */;
INSERT INTO `portafolio` VALUES
(1,'z7f3k0pt07k','','portafolio de inversiones','','','BS','','','','2023-10-14 16:31:00'),
(2,'lkoi88nfrg','','portafolio de administracion','','','BS','','','','2023-10-14 16:38:01'),
(4,'g9cmkw5frhq','','portafolio de inversion','','','BS','','','','2023-11-20 21:04:00'),
(6,'g9cmkw5frhq','','portafolio de prestaciones','','','BS','','','','2023-12-05 15:16:10'),
(7,'26gxg9vi34u','','portafolio mixto','','','BS','','','','2023-12-05 15:25:45');
/*!40000 ALTER TABLE `portafolio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `posicion_inversiones`
--

DROP TABLE IF EXISTS `posicion_inversiones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `posicion_inversiones` (
  `id_inversion` int(11) NOT NULL,
  `estatus` int(11) DEFAULT NULL,
  `fecha_operacion` date NOT NULL DEFAULT '1900-01-01',
  `monto` decimal(15,2) NOT NULL,
  `tipo` char(1) DEFAULT NULL,
  `usuario` varchar(128) DEFAULT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `llave` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_inversion`,`fecha_operacion`,`monto`),
  KEY `fecha_operacion` (`fecha_operacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf32 COLLATE=utf32_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posicion_inversiones`
--

LOCK TABLES `posicion_inversiones` WRITE;
/*!40000 ALTER TABLE `posicion_inversiones` DISABLE KEYS */;
/*!40000 ALTER TABLE `posicion_inversiones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `saldos`
--

DROP TABLE IF EXISTS `saldos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `saldos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `id_cuenta` int(11) DEFAULT NULL,
  `estatus` int(11) DEFAULT NULL,
  `fecha_cierre` date DEFAULT '1900-01-01',
  `saldo` decimal(15,2) DEFAULT NULL,
  `usuario` varchar(128) DEFAULT NULL,
  `llave` varchar(255) DEFAULT NULL,
  `id_plan` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf32 COLLATE=utf32_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saldos`
--

LOCK TABLES `saldos` WRITE;
/*!40000 ALTER TABLE `saldos` DISABLE KEYS */;
INSERT INTO `saldos` VALUES
(47,'2023-12-09 20:24:20',3,0,'2023-12-05',1926224.12,'','',1),
(48,'2023-12-09 20:24:20',18,0,'2023-12-05',1926224.12,'','',1),
(49,'2023-12-09 20:24:20',3,0,'2023-12-05',800000.00,'','',3),
(50,'2023-12-09 20:24:20',19,0,'2023-12-05',800000.00,'','',3),
(51,'2023-12-09 20:24:20',3,0,'2023-12-05',1500000.00,'','',4),
(52,'2023-12-09 20:24:20',18,0,'2023-12-05',1500000.00,'','',4);
/*!40000 ALTER TABLE `saldos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `zr_inversiones_portafolios`
--

DROP TABLE IF EXISTS `zr_inversiones_portafolios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `zr_inversiones_portafolios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_inversion` int(11) DEFAULT NULL,
  `id_portafolio` int(11) DEFAULT NULL,
  `porcentaje` decimal(5,2) DEFAULT NULL,
  `estatus` int(11) DEFAULT NULL,
  `usuario` varchar(255) DEFAULT NULL,
  `fecha` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `zr_inversiones_portafolios`
--

LOCK TABLES `zr_inversiones_portafolios` WRITE;
/*!40000 ALTER TABLE `zr_inversiones_portafolios` DISABLE KEYS */;
INSERT INTO `zr_inversiones_portafolios` VALUES
(1,1,1,50.00,1,'',NULL),
(2,1,2,50.00,1,'',NULL);
/*!40000 ALTER TABLE `zr_inversiones_portafolios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-12-12  8:20:37
