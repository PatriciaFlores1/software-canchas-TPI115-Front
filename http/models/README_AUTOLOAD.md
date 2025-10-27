# Autoload de Composer - Guía Rápida

## ✅ Configuración Completada

Se ha configurado el autoload PSR-4 en `composer.json` para cargar automáticamente tus clases sin necesidad de `require` o `require_once`.

## 📋 Configuración en composer.json

```json
{
    "autoload": {
        "psr-4": {
            "App\\Models\\": "http/models/",
            "App\\Controllers\\": "http/controllers/",
            "App\\Database\\": "http/database/"
        }
    }
}
```

## 📁 Estructura de Namespaces

### Modelos (`http/models/`)
- **Namespace**: `App\Models`
- **Ejemplo**: `App\Models\Usuario`

```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Usuario extends Model
{
    // ...
}
```

### Controladores (`http/controllers/`)
- **Namespace**: `App\Controllers`
- **Ejemplo**: `App\Controllers\UsuarioController`

```php
<?php
namespace App\Controllers;

use App\Models\Usuario;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

class UsuarioController
{
    public function index(Request $request, Response $response)
    {
        $usuarios = Usuario::all();
        // ...
    }
}
```

## 🚀 Cómo Usar

### 1. En tus controladores (archivos PHP que retornan funciones)

```php
<?php
use App\Models\Usuario;
use App\Models\Cancha;
use App\Models\Reserva;

return function ($app) {
    $app->get('/api/usuarios', function ($request, $response) {
        // Ahora puedes usar Usuario directamente sin require
        $usuarios = Usuario::all();
        
        $response->getBody()->write(json_encode($usuarios));
        return $response->withHeader('Content-Type', 'application/json');
    });
};
```

### 2. En clases de controladores

```php
<?php
namespace App\Controllers;

use App\Models\Usuario;
use App\Models\Cancha;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

class CanchaController
{
    public function listar(Request $request, Response $response)
    {
        $canchas = Cancha::with('propietario')->get();
        
        $response->getBody()->write(json_encode([
            'success' => true,
            'data' => $canchas
        ]));
        
        return $response->withHeader('Content-Type', 'application/json');
    }
}
```

### 3. En scripts independientes

```php
<?php
require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/http/database/eloquent.php';

use App\Models\Usuario;
use App\Models\Cancha;

// Ahora puedes usar los modelos
$usuarios = Usuario::all();
$canchas = Cancha::where('estado', 'activo')->get();
```

## 🔄 Regenerar Autoload

Cada vez que agregues nuevas clases o cambies namespaces, ejecuta:

```bash
composer dump-autoload
```

## ✨ Ventajas del Autoload

1. **Sin require/require_once**: No necesitas incluir manualmente los archivos
2. **PSR-4 Estándar**: Sigue las convenciones de PHP moderno
3. **Mejor organización**: Estructura clara de namespaces
4. **Autocompletado**: Los IDEs pueden detectar mejor tus clases
5. **Mantenible**: Más fácil de mantener y escalar

## 📝 Ejemplos de Uso

### Crear un nuevo modelo

**Archivo**: `http/models/Horario.php`

```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Horario extends Model
{
    protected $table = 'horarios';
    
    protected $fillable = [
        'cancha_id',
        'dia_semana',
        'hora_inicio',
        'hora_fin',
        'disponible'
    ];
    
    public function cancha()
    {
        return $this->belongsTo(Cancha::class, 'cancha_id');
    }
}
```

**Uso en controlador**:

```php
<?php
use App\Models\Horario;

$horarios = Horario::where('cancha_id', 1)
                   ->where('disponible', true)
                   ->get();
```

### Crear un nuevo controlador

**Archivo**: `http/controllers/ReservaController.php`

```php
<?php
namespace App\Controllers;

use App\Models\Reserva;
use App\Models\Cancha;
use App\Models\Usuario;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

class ReservaController
{
    public function crear(Request $request, Response $response)
    {
        $data = $request->getParsedBody();
        
        // Validar disponibilidad
        $disponible = !Reserva::where('cancha_id', $data['cancha_id'])
            ->where('fecha_reserva', $data['fecha_reserva'])
            ->where('hora_inicio', $data['hora_inicio'])
            ->exists();
            
        if (!$disponible) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Horario no disponible'
            ]));
            return $response->withStatus(400)
                           ->withHeader('Content-Type', 'application/json');
        }
        
        // Crear reserva
        $reserva = Reserva::create($data);
        
        $response->getBody()->write(json_encode([
            'success' => true,
            'data' => $reserva
        ]));
        
        return $response->withStatus(201)
                       ->withHeader('Content-Type', 'application/json');
    }
    
    public function listar(Request $request, Response $response)
    {
        $reservas = Reserva::with(['cancha', 'usuario'])->get();
        
        $response->getBody()->write(json_encode([
            'success' => true,
            'data' => $reservas
        ]));
        
        return $response->withHeader('Content-Type', 'application/json');
    }
}
```

**Registrar en index.php**:

```php
use App\Controllers\ReservaController;

$reservaController = new ReservaController();

$app->post('/api/reservas', [$reservaController, 'crear']);
$app->get('/api/reservas', [$reservaController, 'listar']);
```

## 🎯 Mejores Prácticas

1. **Siempre usa namespaces** en todas tus clases nuevas
2. **Importa las clases** que necesites con `use`
3. **Regenera el autoload** después de crear nuevos archivos
4. **Sigue PSR-4**: Estructura de carpetas = estructura de namespaces
5. **Nombres de clases = nombres de archivos**: `Usuario.php` contiene `class Usuario`

## ⚠️ Importante

- Los archivos en `http/models/` **deben** tener `namespace App\Models;`
- Los archivos en `http/controllers/` **deben** tener `namespace App\Controllers;` (si son clases)
- Los controladores que retornan funciones anónimas no necesitan namespace, solo `use` para importar
- Después de agregar nuevos archivos, ejecuta `composer dump-autoload`

¡El autoload está listo para usar! 🚀
