# Sistema de Reserva de Canchas Deportivas

API REST con Slim Framework 4 + Eloquent ORM

## Requisitos

- PHP 8.0+
- Composer
- MySQL 5.7+
- XAMPP/WAMP/LAMP (o servidor Apache + MySQL)

## Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/PatriciaFlores1/software-canchas-TPI115-Front.git
cd software-canchas-TPI115-Front
```

2. **Instalar dependencias**
```bash
composer install
```

3. **Configurar base de datos**
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env con tus credenciales
# DB_DATABASE=sistema_reserva
# DB_USERNAME=root
# DB_PASSWORD=tu_password
```

4. **Importar la base de datos**
   - Abrir MySQL (phpMyAdmin, MySQL Workbench, o CLI)
   - Ejecutar el script `sistema_reserva.sql` que está en la raíz del proyecto

5. **Iniciar el servidor**
```bash
php -S localhost:8080 -t .
```

## Estructura del Proyecto

```
├── http/
│   ├── controllers/      # Controladores (CanchasController, etc.)
│   ├── database/         # Configuración Eloquent (eloquent.php)
│   └── models/           # Modelos Eloquent (Usuario, Cancha, Reserva, etc.)
├── routes/
│   ├── api.php          # Rutas API (/api/v1/*)
│   └── web.php          # Rutas web (views)
├── view/                # Vistas HTML
├── public/              # Assets estáticos (CSS, JS, imágenes)
├── vendor/              # Dependencias Composer
├── .env                 # Configuración (NO subir a Git)
├── .env.example         # Plantilla de configuración
├── index.php            # Entry point
└── composer.json        # Dependencias
```

## Endpoints API

### Canchas
- `GET /api/v1/canchas` - Listar todas las canchas
- `GET /api/v1/canchas/{id}` - Detalle de una cancha

### Autenticación
- `POST /api/v1/login` - Login de usuario

## Modelos Disponibles

Todos con relaciones Eloquent configuradas:

- `Usuario` - Usuarios del sistema
- `Cancha` - Canchas deportivas
- `Reserva` - Reservas de canchas
- `Estado` - Estados (activo, inactivo, etc.)
- `TipoDeporte` - Tipos de deporte (fútbol, basketball, etc.)
- `Rol` - Roles de usuario (admin, cliente, propietario)
- `FotoCancha` - Fotos de las canchas
- `HorarioDisponible` - Horarios disponibles
- `Pago` - Pagos de reservas
- `Propietario` - Relación usuario-cancha (pivot)
- `Otp` - Tokens OTP
- `Sesion` - Sesiones de usuario

## Tecnologías

- **Slim Framework 4** - Micro framework PHP
- **Eloquent ORM** - ORM standalone de Laravel
- **PHP dotenv** - Gestión de variables de entorno
- **Bootstrap 5** - Framework CSS
- **jQuery** - Manipulación DOM

## Comandos Útiles

```bash
# Probar conexión Eloquent
php test_eloquent.php

# Actualizar dependencias
composer update

# Ver rutas (revisar routes/api.php y routes/web.php)
```

## Notas para Desarrollo

- El archivo `.env` contiene credenciales sensibles y **NO** debe subirse a Git
- Usar `.env.example` como plantilla
- Los modelos usan `timestamps = true` (created_at, updated_at automáticos)
- Autoload PSR-4: `App\Models`, `App\Controllers`, `App\Database`

## Troubleshooting

**Error: Class 'App\Models\X' not found**
```bash
composer dump-autoload
```

**Error: Base table or view not found**
- Verificar que la base de datos esté importada
- Verificar credenciales en `.env`

**Error: Connection refused**
- Verificar que MySQL esté corriendo
- Verificar host/port en `.env`
