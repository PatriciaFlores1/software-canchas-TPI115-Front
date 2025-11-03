<?php

namespace App\Controllers;

use App\Models\Pago;
use App\Models\Reserva;
use App\Services\PayPalService;
use Illuminate\Database\QueryException;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class PagosController
{
    private $paypalService;

    public function __construct()
    {
        try {
            $this->paypalService = new PayPalService();
        } catch (\Exception $e) {
            // Service will be null if credentials not configured
            error_log('PayPal Service initialization failed: ' . $e->getMessage());
            $this->paypalService = null;
        }
    }

    public function createOrder(Request $request, Response $response): Response
    {
        $data = $request->getParsedBody();
        $idReserva = $data['id_reserva'] ?? null;
        $monto = $data['monto'] ?? null;

        if (!$idReserva || !$monto) {
            $response->getBody()->write(json_encode([
                'error' => 'Faltan campos requeridos: id_reserva y monto'
            ]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        if ($monto <= 0) {
            $response->getBody()->write(json_encode([
                'error' => 'El monto debe ser mayor a cero'
            ]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        if (!$this->paypalService) {
            $response->getBody()->write(json_encode([
                'error' => 'Servicio de PayPal no disponible. Verifica la configuración.'
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }

        $reserva = Reserva::find($idReserva);
        if (!$reserva) {
            $response->getBody()->write(json_encode([
                'error' => 'Reserva no encontrada'
            ]));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        $existingPago = Pago::where('id_reserva', $idReserva)->first();
        if ($existingPago) {
            $response->getBody()->write(json_encode([
                'error' => 'Ya existe un pago para esta reserva'
            ]));
            return $response->withStatus(409)->withHeader('Content-Type', 'application/json');
        }

        $result = $this->paypalService->createOrder(
            $monto,
            'USD',
            ['id_reserva' => $idReserva]
        );

        if (!$result['success']) {
            $response->getBody()->write(json_encode([
                'error' => 'Error al crear orden de PayPal',
                'details' => $result['error'] ?? 'Error desconocido'
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode([
            'success' => true,
            'order_id' => $result['order_id'],
            'status' => $result['status']
        ]));

        return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
    }

    public function captureOrder(Request $request, Response $response): Response
    {
        $data = $request->getParsedBody();
        $orderId = $data['order_id'] ?? null;
        $idReserva = $data['id_reserva'] ?? null;

        if (!$orderId || !$idReserva) {
            $response->getBody()->write(json_encode([
                'error' => 'Faltan campos requeridos: order_id y id_reserva'
            ]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        if (!$this->paypalService) {
            $response->getBody()->write(json_encode([
                'error' => 'Servicio de PayPal no disponible'
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }

        $reserva = Reserva::find($idReserva);
        if (!$reserva) {
            $response->getBody()->write(json_encode([
                'error' => 'Reserva no encontrada'
            ]));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        $existingPago = Pago::where('id_reserva', $idReserva)->first();
        if ($existingPago) {
            $response->getBody()->write(json_encode([
                'error' => 'Ya existe un pago para esta reserva',
                'pago' => $existingPago
            ]));
            return $response->withStatus(409)->withHeader('Content-Type', 'application/json');
        }

        $result = $this->paypalService->captureOrder($orderId);

        if (!$result['success']) {
            $response->getBody()->write(json_encode([
                'error' => 'Error al capturar el pago',
                'details' => $result['error'] ?? 'Error desconocido'
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }

        $amount = 0;
        if (isset($result['amount'])) {
            if (is_object($result['amount']) && isset($result['amount']->value)) {
                $amount = floatval($result['amount']->value);
            } elseif (is_array($result['amount']) && isset($result['amount']['value'])) {
                $amount = floatval($result['amount']['value']);
            }
        }

        try {
            \Illuminate\Database\Capsule\Manager::beginTransaction();

            $pago = Pago::create([
                'id_reserva' => $idReserva,
                'monto' => $amount,
                'transaccion' => $result['capture_id'] ?? $orderId
            ]);

            $reserva->id_estado = 1;
            $reserva->save();

            \Illuminate\Database\Capsule\Manager::commit();

            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'Pago procesado correctamente',
                'pago' => [
                    'id_pago' => $pago->id_pago,
                    'monto' => $pago->monto,
                    'transaccion' => $pago->transaccion,
                    'created_at' => $pago->created_at
                ],
                'reserva' => [
                    'id_reserva' => $reserva->id_reserva,
                    'id_estado' => $reserva->id_estado
                ]
            ]));

            return $response->withStatus(200)->withHeader('Content-Type', 'application/json');
        } catch (QueryException $e) {
            \Illuminate\Database\Capsule\Manager::rollBack();
            error_log('Database error saving payment: ' . $e->getMessage());
            
            $response->getBody()->write(json_encode([
                'error' => 'Error al guardar el pago en la base de datos',
                'details' => $e->getMessage()
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            \Illuminate\Database\Capsule\Manager::rollBack();
            error_log('Error saving payment: ' . $e->getMessage());
            
            $response->getBody()->write(json_encode([
                'error' => 'Error interno al procesar el pago',
                'details' => $e->getMessage()
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function show(Request $request, Response $response): Response
    {
        $params = $request->getQueryParams();
        $idReserva = $params['id_reserva'] ?? null;

        if (!$idReserva) {
            $response->getBody()->write(json_encode([
                'error' => 'Falta el parámetro id_reserva'
            ]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $pago = Pago::with('reserva')->where('id_reserva', $idReserva)->first();

        if (!$pago) {
            $response->getBody()->write(json_encode([
                'error' => 'Pago no encontrado para esta reserva'
            ]));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode($pago));
        return $response->withStatus(200)->withHeader('Content-Type', 'application/json');
    }
}

