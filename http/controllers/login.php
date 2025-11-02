<?php
use Slim\App;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Models\Usuario;
use App\Models\Sesion;

return function (App $app) {

    $app->post('/api/v1/login', function (Request $request, Response $response) {

        $data = $request->getParsedBody();
    $email = $data['email'] ?? $data['user'] ?? '';
    $password = $data['password'] ?? $data['pass'] ?? '';

    // Normalizar email
    $email = trim(strtolower($email));

        if (empty($email) || empty($password)) {
            $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'Falta email o contraseña']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

    // Buscar usuario por email (normalizado)
    $usuario = Usuario::whereRaw('LOWER(email) = ?', [$email])->first();

        if (!$usuario) {
            $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'Usuario no encontrado']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        // Verificar contraseña
        if (!password_verify($password, $usuario->password)) {
            $response->getBody()->write(json_encode(['status' => 'error', 'message' => 'Credenciales inválidas']));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }

        // Iniciar sesión PHP básica
        if (session_status() !== PHP_SESSION_ACTIVE) {
            session_start();
        }

        $_SESSION['id_usuario'] = $usuario->id_usuario;
        $_SESSION['nombre'] = $usuario->nombre;
        $_SESSION['apellido'] = $usuario->apellido;
        $_SESSION['id_rol'] = $usuario->id_rol;

        // Opcional: crear registro en tabla sesiones
        try {
            Sesion::create([
                'id_usuario' => $usuario->id_usuario,
                'token' => bin2hex(random_bytes(16)),
                'id_estado' => 1
            ]);
        } catch (\Exception $e) {
            // no bloquear login si falla el registro de sesión
        }

        // Redirigir según rol (usar ?v=...)
        $idRol = (int) ($usuario->id_rol ?? 0);
        switch ($idRol) {
            case 1: // Admin
                $redirect = '/?v=administrador/gestion-estadisticas.html';
                break;
            case 2: // Cliente
                // Redirigir a la vista principal de cliente
                $redirect = '/?v=cliente/gestion-homeCanchas.html';
                break;
            case 3: // Propietario
                $redirect = '/?v=propietario/gestion-estadisticas.html';
                break;
            default:
                $redirect = '/';
        }

        $response->getBody()->write(json_encode(['status' => 'ok', 'message' => 'Login correcto', 'redirect' => $redirect, 'role' => $idRol]));
        return $response->withHeader('Content-Type', 'application/json');
    });

    // Obtener información del usuario autenticado (desde la sesión)
    $app->get('/api/v1/me', function (Request $request, Response $response) {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            session_start();
        }

        if (empty($_SESSION['id_usuario'])) {
            $response->getBody()->write(json_encode(['error' => 'No autenticado']));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }

        $data = [
            'id_usuario' => $_SESSION['id_usuario'],
            'nombre' => $_SESSION['nombre'] ?? null,
            'apellido' => $_SESSION['apellido'] ?? null,
            'id_rol' => $_SESSION['id_rol'] ?? null,
        ];

        $response->getBody()->write(json_encode($data));
        return $response->withHeader('Content-Type', 'application/json');
    });

    // Cerrar sesión
    $app->post('/api/v1/logout', function (Request $request, Response $response) {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            session_start();
        }

        // Opcional: eliminar registro de sesiones en BD si aplica
        // Limpiar session
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params['path'], $params['domain'], $params['secure'], $params['httponly']
            );
        }
        session_destroy();

        $response->getBody()->write(json_encode(['status' => 'ok', 'message' => 'Sesión cerrada']));
        return $response->withHeader('Content-Type', 'application/json');
    });
};
