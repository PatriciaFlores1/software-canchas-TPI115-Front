<?php
use Slim\Factory\AppFactory;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;

require __DIR__ . '/vendor/autoload.php';

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

    if ($realPath && is_file($realPath)) {
        $mime = mime_content_type($realPath) ?: 'text/html';
        $response->getBody()->write(file_get_contents($realPath));
        return $response->withHeader('Content-Type', $mime);
    }

    $response->getBody()->write('404 Not Found');
    return $response->withStatus(404);
}


$app = AppFactory::create();
$app->addBodyParsingMiddleware();

(require __DIR__ . '/http/controllers/login.php')($app);

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

$app->get('/', function (Request $request, Response $response) {
    return renderView($response, 'index.html');
});

$app->get('/login', function (Request $request, Response $response) {
    return renderView($response, 'authentication/login.html');
});

$app->get('/registro', function (Request $request, Response $response) {
    return renderView($response, 'authentication/registro.html');
});

$app->run();
