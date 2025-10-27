<?php

namespace App\Controllers;

use App\Models\TipoDeporte;
use App\Models\Estado;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

class CatalogosController
{
    private const CONTENT_TYPE_JSON = 'application/json';

    public function tiposDeporte(Request $request, Response $response): Response
    {
        try {
            $items = TipoDeporte::orderBy('nombre', 'asc')
                ->get(['id_tipo_deporte', 'nombre']);

            $response->getBody()->write(json_encode(['data' => $items]));
            return $response->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
        } catch (\Throwable $e) {
            $response->getBody()->write(json_encode([
                'message' => 'Ocurrió un error al obtener los tipos de deporte',
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
        }
    }

    public function estados(Request $request, Response $response): Response
    {
        try {
            $items = Estado::orderBy('nombre', 'asc')
                ->get(['id_estado', 'nombre']);

            $response->getBody()->write(json_encode(['data' => $items]));
            return $response->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
        } catch (\Throwable $e) {
            $response->getBody()->write(json_encode([
                'message' => 'Ocurrió un error al obtener los estados',
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
        }
    }
}
