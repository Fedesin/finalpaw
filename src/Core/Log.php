<?php

namespace Paw\Core;

use Monolog\Logger;
use Monolog\Handler\StreamHandler;

class Log
{
    private static ?Logger $instance;

    /**
    * recursively create a long directory path
    */
    private static function createPath($path)
    {
        if (is_dir($path)) 
            return true;

        $prev_path = substr($path, 0, strrpos($path, '/', -2) + 1 );
        $return = self::createPath($prev_path);
        return ($return && is_writable($prev_path)) ? mkdir($path) : false;
    }

    public static function make($logFile, $logLevel): Logger
    {
        self::createPath(substr($logFile, 0, strrpos($logFile, '/') + 1));

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