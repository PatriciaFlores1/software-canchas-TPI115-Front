<?php
use Slim\Factory\AppFactory;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;

require_once __DIR__ . '/vendor/autoload.php';

// Inicializar Eloquent ORM
require_once __DIR__ . '/http/database/eloquent.php';

/**
 * Carga una vista desde /view y devuelve 404 si no existe
 *
 * @param Response $response
 * @param string $view Nombre de la vista, ej: 'authentication/login.html'
 * @return Response
 */
function renderView(Response $response, string $view): Response
{
    $filePath = __DIR__ . '/view/' . $view;
    $realPath = realpath($filePath);

    // Seguridad: verificar autorización por rol para carpetas privadas
    // iniciar sesión si es necesario
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_start();
    }

    // Función simple para comprobar acceso según prefijo de ruta
    $checkAccess = function (string $viewPath) {
        // Normalizar
        $p = ltrim($viewPath, '/');
        // Carpetas protegidas: administrador, cliente, propietario
        if (strpos($p, 'administrador/') === 0) {
            return isset($_SESSION['id_rol']) && (int)$_SESSION['id_rol'] === 1;
        }
        if (strpos($p, 'cliente/') === 0) {
            return isset($_SESSION['id_rol']) && (int)$_SESSION['id_rol'] === 2;
        }
        if (strpos($p, 'propietario/') === 0) {
            return isset($_SESSION['id_rol']) && (int)$_SESSION['id_rol'] === 3;
        }
        // Para otras vistas, permitir acceso público
        return true;
    };

    if ($realPath && is_file($realPath)) {
        if (!$checkAccess($view)) {
            // No autenticado o sin permiso: redirigir a login
            $response = new \Slim\Psr7\Response();
            $response = $response->withHeader('Location', '/login')->withStatus(302);
            return $response;
        }

        $mime = mime_content_type($realPath) ?: 'text/html';
        $response->getBody()->write(file_get_contents($realPath));
        return $response->withHeader('Content-Type', $mime);
    }

    $response->getBody()->write('404 Not Found');
    return $response->withStatus(404);
}

// Fallback to serve a view directly via query param ?v=path/to/view.html
// This helps when mod_rewrite/.htaccess isn't available on the server.
if (isset($_GET['v'])) {
    $v = $_GET['v'];
    $filePath = __DIR__ . '/view/' . ltrim($v, '/');
    $realPath = realpath($filePath);

    if ($realPath && is_file($realPath)) {
        // Iniciar sesión para comprobar permisos
        if (session_status() !== PHP_SESSION_ACTIVE) {
            session_start();
        }

        // Comprobar acceso según carpeta
        $p = ltrim($v, '/');
        $allowed = true;
        if (strpos($p, 'administrador/') === 0) {
            $allowed = isset($_SESSION['id_rol']) && (int)$_SESSION['id_rol'] === 1;
        } elseif (strpos($p, 'cliente/') === 0) {
            $allowed = isset($_SESSION['id_rol']) && (int)$_SESSION['id_rol'] === 2;
        } elseif (strpos($p, 'propietario/') === 0) {
            $allowed = isset($_SESSION['id_rol']) && (int)$_SESSION['id_rol'] === 3;
        }

        if (!$allowed) {
            header('Location: /login');
            exit;
        }

        $mime = mime_content_type($realPath) ?: 'text/html';
        header('Content-Type: ' . $mime);
        readfile($realPath);
        exit;
    } else {
        header('HTTP/1.1 404 Not Found');
        echo '404 Not Found';
        exit;
    }
}


$app = AppFactory::create();
$app->addBodyParsingMiddleware();

// Registrar rutas API y Web (estilo Laravel)
(require __DIR__ . '/routes/api.php')($app);
(require __DIR__ . '/routes/web.php')($app);

$app->add(function (Request $request, RequestHandler $handler): Response {
    $uri = $request->getUri()->getPath();

    if (substr($uri, 0, 8) === '/public/') {
        $filePath = __DIR__ . $uri;

        $realPath = realpath($filePath);
        if ($realPath && strpos($realPath, __DIR__) === 0 && is_file($realPath)) {
            $mime = mime_content_type($realPath) ?: 'application/octet-stream';
            $response = new \Slim\Psr7\Response();
            $response->getBody()->write(file_get_contents($realPath));
            return $response->withHeader('Content-Type', $mime);
        }

        $response = new \Slim\Psr7\Response();
        $response->getBody()->write('404 Not Found');
        return $response->withStatus(404);
    }

    return $handler->handle($request);
});

$app->run();
