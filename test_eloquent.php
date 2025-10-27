<?php
/**
 * Script de prueba para Eloquent
 * 
 * Ejecuta este archivo para verificar que Eloquent está configurado correctamente
 * Comando: php test_eloquent.php
 */

require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/http/database/eloquent.php';

use App\Models\Usuario;
use App\Models\Cancha;
use App\Models\Reserva;

echo "=================================\n";
echo "Prueba de Eloquent ORM\n";
echo "=================================\n\n";

try {
    // Probar conexión
    echo "1. Probando conexión a la base de datos...\n";
    $usuarios = Usuario::count();
    echo "   ✓ Conexión exitosa! Total de usuarios: $usuarios\n\n";
    
    // Probar SELECT
    echo "2. Probando SELECT - Primeros 5 usuarios:\n";
    $usuarios = Usuario::take(5)->get();
    foreach ($usuarios as $usuario) {
        echo "   - ID: {$usuario->id_usuario}, Nombre: {$usuario->nombre} {$usuario->apellido}, Email: {$usuario->email}\n";
    }
    echo "\n";
    
    // Probar WHERE
    echo "3. Probando WHERE - Usuarios con rol 'cliente':\n";
    $clientes = Usuario::where('id_rol', 1)->count();
    echo "   ✓ Total de clientes: $clientes\n\n";
    
    // Probar relaciones (si existen datos)
    echo "4. Probando relaciones - Canchas con propietarios (pivot propietarios):\n";
    $canchas = Cancha::with('propietarios')->take(3)->get();
    if ($canchas->count() > 0) {
        foreach ($canchas as $cancha) {
            $countProps = $cancha->propietarios->count();
            echo "   - Cancha: {$cancha->nombre}, Propietarios: {$countProps}\n";
        }
    } else {
        echo "   ℹ No hay canchas registradas\n";
    }
    echo "\n";
    
    // Probar agregaciones
    echo "5. Probando agregaciones:\n";
    $totalCanchas = Cancha::count();
    $totalReservas = Reserva::count();
    echo "   - Total de canchas: $totalCanchas\n";
    echo "   - Total de reservas: $totalReservas\n\n";
    
    echo "=================================\n";
    echo "✓ Todas las pruebas completadas!\n";
    echo "Eloquent está funcionando correctamente.\n";
    echo "=================================\n";
    
} catch (\Exception $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
    echo "Verifica tu configuración de base de datos en http/database/eloquent.php\n";
}
