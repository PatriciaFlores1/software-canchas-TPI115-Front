<?php

namespace App\Controllers;

use App\Models\Reserva;
use App\Models\Cancha;
use App\Models\Usuario;
use App\Models\Pago;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

class EstadisticasController
{
    private const CONTENT_TYPE_JSON = 'application/json';

    /**
     * Estadísticas generales: totales de canchas, usuarios y reservas.
     */
    public function estadisticasGenerales(Request $request, Response $response): Response
    {
        try {
            // usar $request para evitar warnings si el framework lo requiere
            $request->getQueryParams();

            $numeroCanchas = (int) Cancha::count();
            $usuariosRegistrados = (int) Usuario::count();
            $reservasTotales = (int) Reserva::count();

            $payload = [
                'numero_canchas' => $numeroCanchas,
                'usuarios_registrados' => $usuariosRegistrados,
                'reservas_totales' => $reservasTotales,
            ];

            $response->getBody()->write(json_encode($payload));
            return $response->withHeader('Content-Type', self::CONTENT_TYPE_JSON);

        } catch (\Throwable $e) {
            $payload = json_encode([
                'message' => 'Ocurrió un error al obtener las estadísticas generales',
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
            ]);
            $response->getBody()->write($payload);
            return $response->withStatus(500)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
        }
    }

    /**
     * Devuelve el resumen de reservas por mes para el año actual.
     * Respuesta: { year: 2025, data: [{month:1,total:0}, ... month:12] }
     */
    public function reservasMensuales(Request $request, Response $response): Response
    {
        try {
            // usar $request para evitar warnings
            $request->getQueryParams();
            $year = (int) date('Y');

            $rows = Reserva::selectRaw('MONTH(fecha_inicio) as month, COUNT(*) as total')
                ->whereYear('fecha_inicio', $year)
                ->groupByRaw('MONTH(fecha_inicio)')
                ->orderByRaw('MONTH(fecha_inicio)')
                ->get();

            // Inicializar todos los meses a 0
            $months = [];
            for ($m = 1; $m <= 12; $m++) {
                $months[$m] = 0;
            }

            foreach ($rows as $r) {
                $months[(int)$r->month] = (int)$r->total;
            }

            $data = [];
            foreach ($months as $m => $count) {
                $data[] = [
                    'month' => $m,
                    'total' => $count,
                ];
            }

            $response->getBody()->write(json_encode([
                'year' => $year,
                'data' => $data,
            ]));

            return $response->withHeader('Content-Type', self::CONTENT_TYPE_JSON);

        } catch (\Throwable $e) {
            $payload = json_encode([
                'message' => 'Ocurrió un error al obtener las estadísticas',
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
            ]);
            $response->getBody()->write($payload);
            return $response->withStatus(500)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
        }
    }

    /**
     * Ingresos mensuales: suma de los montos de pagos por mes para el año actual.
     * Respuesta: { year: 2025, data: [{month:1,total:1234.56}, ...] }
     */
    public function ingresosMensuales(Request $request, Response $response): Response
    {
        try {
            $request->getQueryParams();
            $year = (int) date('Y');

            $rows = Pago::selectRaw('MONTH(created_at) as month, COALESCE(SUM(monto),0) as total')
                ->whereYear('created_at', $year)
                ->groupByRaw('MONTH(created_at)')
                ->orderByRaw('MONTH(created_at)')
                ->get();

            $months = [];
            for ($m = 1; $m <= 12; $m++) {
                $months[$m] = 0.0;
            }

            foreach ($rows as $r) {
                $months[(int)$r->month] = (float)$r->total;
            }

            $data = [];
            foreach ($months as $m => $amount) {
                $data[] = [
                    'month' => $m,
                    'total' => round($amount, 2),
                ];
            }

            $response->getBody()->write(json_encode([
                'year' => $year,
                'data' => $data,
            ]));

            return $response->withHeader('Content-Type', self::CONTENT_TYPE_JSON);

        } catch (\Throwable $e) {
            $payload = json_encode([
                'message' => 'Ocurrió un error al obtener los ingresos mensuales',
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
            ]);
            $response->getBody()->write($payload);
            return $response->withStatus(500)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
        }
    }

    public function estadisticasGeneralesPropietario(Request $request, Response $response): Response
    {
        try {
            $params = $request->getQueryParams();
            $id_propietario = $params['id_propietario'] ?? null;

            if (!$id_propietario) {
                $response->getBody()->write(json_encode(['message' => 'El parámetro id_propietario es requerido']));
                return $response->withStatus(400)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
            }

            $canchas = Cancha::whereHas('propietarios', function ($query) use ($id_propietario) {
                $query->where('usuarios.id_usuario', $id_propietario);
            });

            $numeroCanchas = (int) $canchas->count();
            $usuariosRegistrados = (int) Usuario::count();
            $reservasTotales = (int) Reserva::whereIn('id_cancha', $canchas->pluck('id_cancha'))->count();

            $payload = [
                'numero_canchas' => $numeroCanchas,
                'usuarios_registrados' => $usuariosRegistrados,
                'reservas_totales' => $reservasTotales,
            ];

            $response->getBody()->write(json_encode($payload));
            return $response->withHeader('Content-Type', self::CONTENT_TYPE_JSON);

        } catch (\Throwable $e) {
            $payload = json_encode([
                'message' => 'Ocurrió un error al obtener las estadísticas generales del propietario',
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
            ]);
            $response->getBody()->write($payload);
            return $response->withStatus(500)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
        }
    }

    public function reservasMensualesPropietario(Request $request, Response $response): Response
    {
        try {
            $params = $request->getQueryParams();
            $id_propietario = $params['id_propietario'] ?? null;
            $year = (int) date('Y');

            if (!$id_propietario) {
                $response->getBody()->write(json_encode(['message' => 'El parámetro id_propietario es requerido']));
                return $response->withStatus(400)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
            }

            $canchas = Cancha::whereHas('propietarios', function ($query) use ($id_propietario) {
                $query->where('usuarios.id_usuario', $id_propietario);
            })->pluck('id_cancha');

            $rows = Reserva::selectRaw('MONTH(fecha_inicio) as month, COUNT(*) as total')
                ->whereIn('id_cancha', $canchas)
                ->whereYear('fecha_inicio', $year)
                ->groupByRaw('MONTH(fecha_inicio)')
                ->orderByRaw('MONTH(fecha_inicio)')
                ->get();

            $months = [];
            for ($m = 1; $m <= 12; $m++) {
                $months[$m] = 0;
            }

            foreach ($rows as $r) {
                $months[(int)$r->month] = (int)$r->total;
            }

            $data = [];
            foreach ($months as $m => $count) {
                $data[] = [
                    'month' => $m,
                    'total' => $count,
                ];
            }

            $response->getBody()->write(json_encode([
                'year' => $year,
                'data' => $data,
            ]));

            return $response->withHeader('Content-Type', self::CONTENT_TYPE_JSON);

        } catch (\Throwable $e) {
            $payload = json_encode([
                'message' => 'Ocurrió un error al obtener las estadísticas del propietario',
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
            ]);
            $response->getBody()->write($payload);
            return $response->withStatus(500)->withHeader('Content-Type', self::CONTENT_TYPE_JSON);
        }
    }
}

