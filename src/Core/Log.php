<?php

namespace Paw\Core;

use Monolog\Logger;
use Monolog\Handler\StreamHandler;

class Log
{
    private static ?Logger $instance;

    public static function make($logFile, $logLevel): Logger
    {
        $handler = new StreamHandler($logFile);
        $handler->setLevel($logLevel);

        $log = new Logger('mvc-app');
        $log->pushHandler($handler);

        self::$instance = $log;

        return $log;
    }

    public static function getInstance(): Logger
    {
        return self::$instance;
    }
}