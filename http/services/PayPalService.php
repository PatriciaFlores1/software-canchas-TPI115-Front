<?php

namespace App\Services;

use PayPalCheckoutSdk\Core\PayPalHttpClient;
use PayPalCheckoutSdk\Core\SandboxEnvironment;
use PayPalCheckoutSdk\Core\ProductionEnvironment;
use PayPalCheckoutSdk\Orders\OrdersCreateRequest;
use PayPalCheckoutSdk\Orders\OrdersCaptureRequest;
use PayPalHttp\HttpException;

class PayPalService
{
    private $client;

    public function __construct()
    {
        $clientId = $_ENV['PAYPAL_CLIENT_ID'] ?? '';
        $clientSecret = $_ENV['PAYPAL_CLIENT_SECRET'] ?? '';
        $mode = $_ENV['PAYPAL_MODE'] ?? 'sandbox';

        if (empty($clientId) || empty($clientSecret)) {
            throw new \Exception('PayPal credentiales no configuradas');
        }

        if ($mode === 'production') {
            $environment = new ProductionEnvironment($clientId, $clientSecret);
        } else {
            $environment = new SandboxEnvironment($clientId, $clientSecret);
        }

        $this->client = new PayPalHttpClient($environment);
    }

    /**
     * Create a PayPal order
     * 
     * @param float 
     * @param string 
     * @param array
     * @return array
     */
    public function createOrder($amount, $currency = 'USD', $metadata = [])
    {
        try {
            $request = new OrdersCreateRequest();
            $request->prefer('return=representation');

            $body = [
                'intent' => 'CAPTURE',
                'purchase_units' => [
                    [
                        'amount' => [
                            'currency_code' => $currency,
                            'value' => number_format($amount, 2, '.', '')
                        ]
                    ]
                ],
                'application_context' => [
                    'brand_name' => 'Canchas SV',
                    'locale' => 'es-SV',
                    'landing_page' => 'BILLING',
                    'shipping_preference' => 'NO_SHIPPING',
                    'user_action' => 'PAY_NOW'
                ]
            ];

            if (!empty($metadata)) {
                $body['purchase_units'][0]['custom_id'] = json_encode($metadata);
            }

            $request->body = $body;

            $response = $this->client->execute($request);

            return [
                'success' => true,
                'order_id' => $response->result->id,
                'status' => $response->result->status,
                'response' => $response->result
            ];
        } catch (HttpException $e) {
            error_log('PayPal Create Order Error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'details' => json_decode($e->getMessage(), true)
            ];
        } catch (\Exception $e) {
            error_log('PayPal Create Order Exception: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Capture a PayPal order
     * 
     * @param string
     * @return array 
     */
    public function captureOrder($orderId)
    {
        try {
            $request = new OrdersCaptureRequest($orderId);
            $request->prefer('return=representation');

            $response = $this->client->execute($request);

            $captureId = null;
            $status = $response->result->status;


            if (isset($response->result->purchase_units[0]->payments->captures[0]->id)) {
                $captureId = $response->result->purchase_units[0]->payments->captures[0]->id;
            }

            return [
                'success' => true,
                'order_id' => $orderId,
                'capture_id' => $captureId,
                'status' => $status,
                'payer' => $response->result->payer ?? null,
                'amount' => $response->result->purchase_units[0]->payments->captures[0]->amount ?? null,
                'response' => $response->result
            ];
        } catch (HttpException $e) {
            error_log('PayPal Capture Order Error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'details' => json_decode($e->getMessage(), true)
            ];
        } catch (\Exception $e) {
            error_log('PayPal Capture Order Exception: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get order details
     * 
     * @param string
     * @return array
     */
    public function getOrderDetails($orderId)
    {
        try {
            $request = new \PayPalCheckoutSdk\Orders\OrdersGetRequest($orderId);
            $response = $this->client->execute($request);

            return [
                'success' => true,
                'order' => $response->result
            ];
        } catch (HttpException $e) {
            error_log('PayPal Get Order Error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        } catch (\Exception $e) {
            error_log('PayPal Get Order Exception: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}

