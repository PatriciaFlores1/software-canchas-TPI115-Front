<?php
/**
 * EJEMPLOS DE USO DE ELOQUENT ORM
 * 
 * Este archivo muestra ejemplos de cómo usar Eloquent en tus controladores.
 * Copia y adapta estos ejemplos según tus necesidades.
 */

use App\Models\Usuario;
use App\Models\Cancha;
use App\Models\Reserva;
use Illuminate\Database\Capsule\Manager as DB;

// ============================================
// 1. CREAR UN NUEVO REGISTRO
// ============================================

// Crear un nuevo usuario
$usuario = new Usuario();
$usuario->nombre = 'Juan Pérez';
$usuario->email = 'juan@example.com';
$usuario->password = password_hash('123456', PASSWORD_BCRYPT);
$usuario->rol = 'cliente';
$usuario->save();

// O usando create() con fillable
$usuario = Usuario::create([
    'nombre' => 'María García',
    'email' => 'maria@example.com',
    'password' => password_hash('123456', PASSWORD_BCRYPT),
    'rol' => 'cliente'
]);


// ============================================
// 2. BUSCAR REGISTROS
// ============================================

// Buscar por ID
$usuario = Usuario::find(1);

// Buscar por ID o lanzar excepción si no existe
$usuario = Usuario::findOrFail(1);

// Buscar el primer registro que cumpla una condición
$usuario = Usuario::where('email', 'juan@example.com')->first();

// Obtener todos los usuarios
$usuarios = Usuario::all();

// Obtener usuarios con condiciones
$clientes = Usuario::where('rol', 'cliente')
                   ->where('estado', 'activo')
                   ->get();

// Paginación
$usuarios = Usuario::paginate(10);


// ============================================
// 3. ACTUALIZAR REGISTROS
// ============================================

// Buscar y actualizar
$usuario = Usuario::find(1);
$usuario->nombre = 'Juan Carlos Pérez';
$usuario->save();

// Actualizar usando update()
Usuario::where('id', 1)->update([
    'nombre' => 'Juan Carlos Pérez'
]);


// ============================================
// 4. ELIMINAR REGISTROS
// ============================================

// Buscar y eliminar
$usuario = Usuario::find(1);
$usuario->delete();

// Eliminar directamente
Usuario::destroy(1);

// Eliminar con condiciones
Usuario::where('estado', 'inactivo')->delete();


// ============================================
// 5. RELACIONES
// ============================================

// Obtener las canchas de un propietario
$usuario = Usuario::find(1);
$canchas = $usuario->canchas; // Relación definida en el modelo

// Obtener reservas de una cancha con información del usuario
$cancha = Cancha::find(1);
$reservas = $cancha->reservas()->with('usuario')->get();

// Crear una reserva relacionada a una cancha
$cancha = Cancha::find(1);
$reserva = $cancha->reservas()->create([
    'usuario_id' => 5,
    'fecha_reserva' => '2025-10-26',
    'hora_inicio' => '10:00',
    'hora_fin' => '11:00',
    'estado' => 'pendiente',
    'precio_total' => 50.00
]);


// ============================================
// 6. CONSULTAS AVANZADAS
// ============================================

// Ordenar resultados
$canchas = Cancha::orderBy('nombre', 'asc')->get();

// Seleccionar columnas específicas
$usuarios = Usuario::select('id', 'nombre', 'email')->get();

// Contar registros
$totalUsuarios = Usuario::count();
$clientesActivos = Usuario::where('rol', 'cliente')
                          ->where('estado', 'activo')
                          ->count();

// Suma, promedio, etc.
$totalIngresos = Reserva::where('estado', 'completada')->sum('precio_total');
$precioPromedio = Cancha::avg('precio_hora');

// Búsqueda con LIKE
$canchas = Cancha::where('nombre', 'LIKE', '%futbol%')->get();

// Búsqueda entre fechas
$reservas = Reserva::whereBetween('fecha_reserva', ['2025-10-01', '2025-10-31'])->get();

// Consultas con múltiples condiciones (OR)
$usuarios = Usuario::where('rol', 'cliente')
                   ->orWhere('rol', 'propietario')
                   ->get();


// ============================================
// 7. EAGER LOADING (Optimización)
// ============================================

// Cargar relaciones de forma eficiente
$canchas = Cancha::with('propietario', 'reservas')->get();

// Cargar relaciones anidadas
$reservas = Reserva::with('cancha.propietario', 'usuario')->get();


// ============================================
// 8. VALIDACIÓN ANTES DE GUARDAR
// ============================================

// Verificar si existe un email antes de crear
$existeEmail = Usuario::where('email', 'test@example.com')->exists();
if (!$existeEmail) {
    Usuario::create([
        'nombre' => 'Test',
        'email' => 'test@example.com',
        'password' => password_hash('123456', PASSWORD_BCRYPT),
        'rol' => 'cliente'
    ]);
}


// ============================================
// 9. TRANSACCIONES
// ============================================

use Illuminate\Database\Capsule\Manager as DB;

DB::beginTransaction();
try {
    $usuario = Usuario::create([...]);
    $cancha = Cancha::create([...]);
    
    DB::commit();
} catch (\Exception $e) {
    DB::rollBack();
    // Manejar error
}


// ============================================
// 10. CONSULTAS RAW (SQL Directo)
// ============================================

use Illuminate\Database\Capsule\Manager as DB;

// SELECT
$usuarios = DB::select('SELECT * FROM usuarios WHERE rol = ?', ['cliente']);

// INSERT
DB::insert('INSERT INTO usuarios (nombre, email) VALUES (?, ?)', ['Test', 'test@example.com']);

// UPDATE
DB::update('UPDATE usuarios SET estado = ? WHERE id = ?', ['activo', 1]);

// DELETE
DB::delete('DELETE FROM usuarios WHERE id = ?', [1]);
