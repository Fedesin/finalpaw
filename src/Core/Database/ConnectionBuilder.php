<?php

namespace Paw\Core\Database;

use PDO;

use PDOException;

use Paw\Core\Config;

use Paw\Core\Traits\Loggable;

class ConnectionBuilder
{
    use Loggable;

    private static ?PDO $instance = null;

    public function make(): PDO
    {
        try {
            $adapter = Config::getDBAdapter();
            $hostname = Config::getDBHostname();
            $dbname = Config::getDBName();
            $port = Config::getDBPort();
            $charset = Config::getDBCharset();
            
            self::$instance = new PDO(
                "{$adapter}:host={$hostname};dbname={$dbname};port={$port};options='--client_encoding={$charset}'",
                Config::getDBUsername(),
                Config::getDBPassword(),
                [
                    [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
                    ]
                ]
            );

            return self::$instance;
        } catch(PDOException $e) {
            $this->logger->error('Internal Server Error',["Error"=>$e]);
            die("Error Interno - Consulte al administrador");
        }
    }

    public static function getInstance(): PDO
    {
        return self::$instance;
    }
}