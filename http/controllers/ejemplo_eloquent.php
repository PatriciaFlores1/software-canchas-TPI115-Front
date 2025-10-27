<?php

namespace App\Controllers;

use App\Models\Usuario;
use App\Models\Cancha;
use App\Models\Reserva;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

/**
 * Controlador de ejemplo usando Eloquent ORM
 * 
 * Este es un ejemplo de cómo usar Eloquent en tus controladores
 */

return function ($app) {
    
    // ============================================
    // EJEMPLOS DE ENDPOINTS USANDO ELOQUENT
    // ============================================
    
    // Obtener todos los usuarios
    $app->get('/api/usuarios', function (Request $request, Response $response) {
        try {
            $usuarios = Usuario::all();
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $usuarios
            ]));
            
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    });
    
    // Obtener un usuario por ID
    $app->get('/api/usuarios/{id}', function (Request $request, Response $response, array $args) {
        try {
            $usuario = Usuario::findOrFail($args['id']);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $usuario
            ]));
            
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ]));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    });
    
    // Crear un nuevo usuario
    $app->post('/api/usuarios', function (Request $request, Response $response) {
        try {
            $data = $request->getParsedBody();
            
            // Validar que el email no exista
            if (Usuario::where('email', $data['email'])->exists()) {
                $response->getBody()->write(json_encode([
                    'success' => false,
                    'message' => 'El email ya está registrado'
                ]));
                return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            }
            
            // Crear el usuario
            $usuario = Usuario::create([
                'nombre' => $data['nombre'],
                'email' => $data['email'],
                'password' => password_hash($data['password'], PASSWORD_BCRYPT),
                'rol' => $data['rol'] ?? 'cliente',
                'telefono' => $data['telefono'] ?? null,
                'estado' => $data['estado'] ?? 'activo'
            ]);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'Usuario creado exitosamente',
                'data' => $usuario
            ]));
            
            return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    });
    
    // Actualizar un usuario
    $app->put('/api/usuarios/{id}', function (Request $request, Response $response, array $args) {
        try {
            $usuario = Usuario::findOrFail($args['id']);
            $data = $request->getParsedBody();
            
            // Actualizar campos
            if (isset($data['nombre'])) $usuario->nombre = $data['nombre'];
            if (isset($data['email'])) $usuario->email = $data['email'];
            if (isset($data['telefono'])) $usuario->telefono = $data['telefono'];
            if (isset($data['estado'])) $usuario->estado = $data['estado'];
            
            $usuario->save();
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'Usuario actualizado exitosamente',
                'data' => $usuario
            ]));
            
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ]));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    });
    
    // Eliminar un usuario
    $app->delete('/api/usuarios/{id}', function (Request $request, Response $response, array $args) {
        try {
            $usuario = Usuario::findOrFail($args['id']);
            $usuario->delete();
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'Usuario eliminado exitosamente'
            ]));
            
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ]));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    });
    
    // Obtener todas las canchas con información del propietario
    $app->get('/api/canchas', function (Request $request, Response $response) {
        try {
            $canchas = Cancha::with('propietario')->get();
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $canchas
            ]));
            
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    });
    
    // Obtener reservas con información de cancha y usuario
    $app->get('/api/reservas', function (Request $request, Response $response) {
        try {
            $reservas = Reserva::with(['cancha', 'usuario'])->get();
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $reservas
            ]));
            
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    });
    
    // Buscar canchas por tipo de deporte
    $app->get('/api/canchas/tipo/{tipo}', function (Request $request, Response $response, array $args) {
        try {
            $canchas = Cancha::where('tipo_deporte', $args['tipo'])
                            ->where('estado', 'activo')
                            ->get();
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $canchas
            ]));
            
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    });
    
};
