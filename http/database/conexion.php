<?php
namespace App\Infrastructure\Persistence;

use PDO;
use PDOException;

class Database
{
    private $connection;

    public function __construct()
    {
        $host = 'localhost';
        $db = 'db_cancha';
        $user = 'root';
        $pass = '';
        $charset = 'utf8';

        $dsn = "mysql:host=$host;dbname=$db;charset=$charset";

        try {
            $this->connection = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]);
        } catch (PDOException $e) {
            throw new PDOException($e->getMessage(), (int)$e->getCode());
        }
    }

    public function getConnection()
    {
        return $this->connection;
    }
}
