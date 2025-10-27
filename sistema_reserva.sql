-- Base de datos
CREATE DATABASE IF NOT EXISTS `sistema_reserva` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `sistema_reserva`;

-- --------------------------------------------------------
-- Tabla: estados
-- --------------------------------------------------------
CREATE TABLE `estados` (
  `id_estado` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL,
  `color` VARCHAR(20) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Tabla: tipos_deporte
-- --------------------------------------------------------
CREATE TABLE `tipos_deporte` (
  `id_tipo_deporte` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_tipo_deporte`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Tabla: roles
-- --------------------------------------------------------
CREATE TABLE `roles` (
  `id_rol` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Tabla: usuarios
-- --------------------------------------------------------
CREATE TABLE `usuarios` (
  `id_usuario` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL,
  `apellido` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `telefono` VARCHAR(20) UNIQUE,
  `id_rol` INT(11) NOT NULL,
  `fecha_registro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `id_estado` INT(11) NOT NULL,
  `url_foto` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  FOREIGN KEY (`id_rol`) REFERENCES `roles`(`id_rol`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`id_estado`) REFERENCES `estados`(`id_estado`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --------------------------------------------------------
-- Tabla: canchas
-- --------------------------------------------------------
CREATE TABLE `canchas` (
  `id_cancha` INT(11) NOT NULL AUTO_INCREMENT,
  `precio_hora` DECIMAL(10,2) NOT NULL CHECK (`precio_hora` >= 0),
  `ubicacion` VARCHAR(200) NOT NULL,
  `coordenada` VARCHAR(100) DEFAULT NULL,
  `condiciones_uso` TEXT DEFAULT NULL,
  `id_estado` INT(11) NOT NULL,
  `nombre` VARCHAR(100) NOT NULL,
  `descripcion` TEXT DEFAULT NULL,
  `id_tipo_deporte` INT(11) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_cancha`),
  FOREIGN KEY (`id_estado`) REFERENCES `estados`(`id_estado`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`id_tipo_deporte`) REFERENCES `tipos_deporte`(`id_tipo_deporte`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Tabla: fotos_cancha
-- --------------------------------------------------------
CREATE TABLE `fotos_cancha` (
  `id_foto` INT(11) NOT NULL AUTO_INCREMENT,
  `id_cancha` INT(11) NOT NULL,
  `url_foto` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_foto`),
  FOREIGN KEY (`id_cancha`) REFERENCES `canchas`(`id_cancha`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Tabla: horarios_disponibles
-- --------------------------------------------------------
CREATE TABLE `horarios_disponibles` (
  `id_horario` INT(11) NOT NULL AUTO_INCREMENT,
  `id_cancha` INT(11) NOT NULL,
  `dia_semana` VARCHAR(20) NOT NULL,
  `hora_inicio` TIME NOT NULL,
  `hora_fin` TIME NOT NULL,
  `id_estado` INT(11) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_horario`),
  FOREIGN KEY (`id_cancha`) REFERENCES `canchas`(`id_cancha`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`id_estado`) REFERENCES `estados`(`id_estado`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Tabla: reservas
-- --------------------------------------------------------
CREATE TABLE `reservas` (
  `id_reserva` INT(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` INT(11) NOT NULL,
  `id_cancha` INT(11) NOT NULL,
  `fecha_inicio` DATETIME NOT NULL,
  `fecha_fin` DATETIME NOT NULL,
  `id_estado` INT(11) NOT NULL,
  `nombre_cliente` VARCHAR(100) DEFAULT NULL,
  `nombre_cancha` VARCHAR(100) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_reserva`),
  FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`id_cancha`) REFERENCES `canchas`(`id_cancha`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`id_estado`) REFERENCES `estados`(`id_estado`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Tabla: pagos
-- --------------------------------------------------------
CREATE TABLE `pagos` (
  `id_pago` INT(11) NOT NULL AUTO_INCREMENT,
  `id_reserva` INT(11) NOT NULL,
  `monto` DECIMAL(10,2) NOT NULL CHECK (`monto` >= 0),
  `transaccion` VARCHAR(100) UNIQUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_pago`),
  FOREIGN KEY (`id_reserva`) REFERENCES `reservas`(`id_reserva`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Tabla: propietarios
-- --------------------------------------------------------
CREATE TABLE `propietarios` (
  `id_propietario` INT(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` INT(11) NOT NULL,
  `id_cancha` INT(11) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_propietario`),
  FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`id_cancha`) REFERENCES `canchas`(`id_cancha`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Tabla: otp
-- --------------------------------------------------------
CREATE TABLE `otp` (
  `id_otp` INT(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` INT(11) NOT NULL,
  `otp` VARCHAR(10) NOT NULL,
  `vencimiento` DATETIME NOT NULL,
  `id_estado` INT(11) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_otp`),
  FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`id_estado`) REFERENCES `estados`(`id_estado`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Tabla: sesiones
-- --------------------------------------------------------
CREATE TABLE `sesiones` (
  `id_sesion` INT(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` INT(11) NOT NULL,
  `token` VARCHAR(255) UNIQUE NOT NULL,
  `id_estado` INT(11) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_sesion`),
  FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`id_estado`) REFERENCES `estados`(`id_estado`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- INSERTS: estados (3 registros)
-- --------------------------------------------------------
INSERT INTO `estados` (`nombre`, `color`) VALUES
  ('Activo', '#28a745'),
  ('Inactivo', '#dc3545'),
  ('Pendiente', '#ffc107');

-- --------------------------------------------------------
-- INSERTS: tipos_deporte (3 registros)
-- --------------------------------------------------------
INSERT INTO `tipos_deporte` (`nombre`) VALUES
  ('Fútbol'),
  ('Básquetbol'),
  ('Voleibol');
