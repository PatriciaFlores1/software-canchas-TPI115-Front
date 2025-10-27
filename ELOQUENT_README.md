# Eloquent ORM - Guía de Uso

Eloquent es el ORM (Object-Relational Mapping) incluido con Laravel que facilita la interacción con la base de datos usando modelos PHP orientados a objetos.

## 📁 Estructura de Archivos

```
http/
├── database/
│   ├── conexion.php       # Conexión PDO original (opcional)
│   └── eloquent.php       # Configuración de Eloquent ✨
├── models/                # Modelos de Eloquent
│   ├── Usuario.php
│   ├── Cancha.php
│   ├── Reserva.php
│   └── EJEMPLOS_ELOQUENT.php
└── controllers/
    ├── login.php
    └── ejemplo_eloquent.php
```

## ⚙️ Configuración

### 1. Instalación
Ya tienes instalado el paquete `illuminate/database` en tu `composer.json`.

### 2. Configuración de Base de Datos
Edita `http/database/eloquent.php` si necesitas cambiar las credenciales:

```php
$capsule->addConnection([
    'driver'    => 'mysql',
    'host'      => 'localhost',
    'database'  => 'db_cancha',
    'username'  => 'root',
    'password'  => '',
    'charset'   => 'utf8',
    'collation' => 'utf8_unicode_ci',
    'prefix'    => '',
]);
```

### 3. Inicialización
Eloquent se inicializa automáticamente en `index.php`:

```php
require __DIR__ . '/http/database/eloquent.php';
```

## 📝 Crear un Modelo

Los modelos se crean en `http/models/`. Ejemplo básico:

```php
<?php

use Illuminate\Database\Eloquent\Model;

class NombreModelo extends Model
{
    // Nombre de la tabla
    protected $table = 'nombre_tabla';
    
    // Clave primaria
    protected $primaryKey = 'id';
    
    // Si usas created_at y updated_at
    public $timestamps = true;
    
    // Campos que se pueden asignar masivamente
    protected $fillable = [
        'campo1',
        'campo2',
    ];
    
    // Campos ocultos (passwords, tokens, etc.)
    protected $hidden = [
        'password'
    ];
}
```

## 🚀 Operaciones Básicas

### Crear (INSERT)

```php
// Método 1: Instanciar y guardar
$usuario = new Usuario();
$usuario->nombre = 'Juan Pérez';
$usuario->email = 'juan@example.com';
$usuario->save();

// Método 2: Creación masiva (requiere fillable)
$usuario = Usuario::create([
    'nombre' => 'María García',
    'email' => 'maria@example.com'
]);
```

### Leer (SELECT)

```php
// Obtener todos los registros
$usuarios = Usuario::all();

// Buscar por ID
$usuario = Usuario::find(1);

// Buscar con condiciones
$usuario = Usuario::where('email', 'test@example.com')->first();

// Múltiples condiciones
$canchas = Cancha::where('tipo_deporte', 'futbol')
                 ->where('estado', 'activo')
                 ->get();

// Ordenar
$canchas = Cancha::orderBy('nombre', 'asc')->get();

// Limitar resultados
$usuarios = Usuario::take(10)->get();

// Paginación
$usuarios = Usuario::paginate(15);
```

### Actualizar (UPDATE)

```php
// Método 1: Buscar y actualizar
$usuario = Usuario::find(1);
$usuario->nombre = 'Nuevo Nombre';
$usuario->save();

// Método 2: Actualización directa
Usuario::where('id', 1)->update([
    'nombre' => 'Nuevo Nombre'
]);
```

### Eliminar (DELETE)

```php
// Método 1: Buscar y eliminar
$usuario = Usuario::find(1);
$usuario->delete();

// Método 2: Eliminar por ID
Usuario::destroy(1);

// Método 3: Eliminar con condiciones
Usuario::where('estado', 'inactivo')->delete();
```

## 🔗 Relaciones entre Modelos

### One to Many (Uno a Muchos)

```php
// En el modelo Usuario
public function canchas()
{
    return $this->hasMany(Cancha::class, 'propietario_id');
}

// En el modelo Cancha
public function propietario()
{
    return $this->belongsTo(Usuario::class, 'propietario_id');
}

// Uso:
$usuario = Usuario::find(1);
$canchas = $usuario->canchas; // Todas las canchas del usuario
```

### Eager Loading (Carga Anticipada)

Evita el problema N+1:

```php
// ❌ Malo: Genera muchas consultas
$canchas = Cancha::all();
foreach ($canchas as $cancha) {
    echo $cancha->propietario->nombre; // Consulta por cada cancha
}

// ✅ Bueno: Una sola consulta
$canchas = Cancha::with('propietario')->get();
foreach ($canchas as $cancha) {
    echo $cancha->propietario->nombre;
}
```

## 📊 Consultas Avanzadas

### Agregaciones

```php
// Contar
$total = Usuario::count();

// Suma
$ingresos = Reserva::sum('precio_total');

// Promedio
$promedio = Cancha::avg('precio_hora');

// Máximo/Mínimo
$max = Cancha::max('precio_hora');
$min = Cancha::min('precio_hora');
```

### Búsqueda con LIKE

```php
$canchas = Cancha::where('nombre', 'LIKE', '%futbol%')->get();
```

### Búsqueda entre rangos

```php
$reservas = Reserva::whereBetween('fecha_reserva', ['2025-10-01', '2025-10-31'])->get();
```

### Verificar existencia

```php
$existe = Usuario::where('email', 'test@example.com')->exists();
```

## 🎯 Uso en Controladores

### Ejemplo completo de endpoint API:

```php
// En tu controlador
$app->post('/api/reservas', function (Request $request, Response $response) {
    try {
        $data = $request->getParsedBody();
        
        // Validar que la cancha exista
        $cancha = Cancha::findOrFail($data['cancha_id']);
        
        // Verificar disponibilidad
        $disponible = !Reserva::where('cancha_id', $data['cancha_id'])
            ->where('fecha_reserva', $data['fecha_reserva'])
            ->where('hora_inicio', $data['hora_inicio'])
            ->exists();
            
        if (!$disponible) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'La cancha no está disponible'
            ]));
            return $response->withStatus(400)
                           ->withHeader('Content-Type', 'application/json');
        }
        
        // Crear la reserva
        $reserva = Reserva::create([
            'cancha_id' => $data['cancha_id'],
            'usuario_id' => $data['usuario_id'],
            'fecha_reserva' => $data['fecha_reserva'],
            'hora_inicio' => $data['hora_inicio'],
            'hora_fin' => $data['hora_fin'],
            'precio_total' => $cancha->precio_hora,
            'estado' => 'pendiente'
        ]);
        
        // Cargar relaciones
        $reserva->load('cancha', 'usuario');
        
        $response->getBody()->write(json_encode([
            'success' => true,
            'message' => 'Reserva creada exitosamente',
            'data' => $reserva
        ]));
        
        return $response->withStatus(201)
                       ->withHeader('Content-Type', 'application/json');
                       
    } catch (\Exception $e) {
        $response->getBody()->write(json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]));
        return $response->withStatus(500)
                       ->withHeader('Content-Type', 'application/json');
    }
});
```

## 🔐 Transacciones

Para operaciones que requieren múltiples inserts/updates:

```php
use Illuminate\Database\Capsule\Manager as DB;

DB::beginTransaction();
try {
    $usuario = Usuario::create([...]);
    $cancha = Cancha::create([...]);
    
    DB::commit();
} catch (\Exception $e) {
    DB::rollBack();
    throw $e;
}
```

## 📚 Recursos Adicionales

- Ver `http/models/EJEMPLOS_ELOQUENT.php` para más ejemplos
- Ver `http/controllers/ejemplo_eloquent.php` para implementación en endpoints
- Documentación oficial: https://laravel.com/docs/eloquent

## ⚠️ Convenciones de Eloquent

1. **Nombres de tablas**: Por defecto, Eloquent usa el plural del nombre del modelo en minúsculas
   - Modelo `Usuario` → tabla `usuarios`
   - Modelo `Cancha` → tabla `canchas`
   
2. **Timestamps**: Por defecto busca `created_at` y `updated_at`
   - Si no los usas: `public $timestamps = false;`

3. **Clave primaria**: Por defecto es `id` autoincremental
   - Si es diferente: `protected $primaryKey = 'mi_id';`

## 🎨 Tips y Mejores Prácticas

1. **Usa fillable o guarded**: Protege contra asignación masiva no deseada
2. **Eager Loading**: Usa `with()` para evitar consultas N+1
3. **Scope queries**: Crea métodos reutilizables en tus modelos
4. **Validación**: Siempre valida datos antes de guardar
5. **Transacciones**: Usa para operaciones múltiples relacionadas
6. **Hidden fields**: Oculta campos sensibles como passwords

¡Eloquent está listo para usar! 🚀
