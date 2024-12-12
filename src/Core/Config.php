<?php

namespace Paw\Core;

use Dotenv\Dotenv;

class Config 
{
    private static $instance = null;

    private function __construct()
    {
        $dotenv = Dotenv::createImmutable(__DIR__ . "/../../");
        $dotenv->safeLoad();
    }

    private static function getVar($var, $default)
    {
        if(self::$instance === null)
            self::$instance = New Config();

        return $_ENV[$var] ?? $default;
    }

    public static function getLogLevel()
    {
        return self::getVar("LOG_LEVEL", "INFO");
    }

    public static function getLogFile()
    {
        return self::getVar("LOG_FILE", "logs/app.log");
    }

    public static function getDBAdapter()
    {
        return self::getVar("DB_ADAPTER", "pgsql");
    }

    public static function getDBHostname()
    {
        return self::getVar("DB_HOSTNAME", "localhost");
    }

    public static function getDBName()
    {
        return self::getVar("DB_DBNAME", "finalpaw");
    }

    public static function getDBUsername()
    {
        return self::getVar("DB_USERNAME", "postgres");
    }

    public static function getDBPassword()
    {
        return self::getVar("DB_PASSWORD", "postgres");
    }

    public static function getDBPort()
    {
        return self::getVar("DB_PORT", "5432");
    }

    public static function getDBCharset()
    {
        return self::getVar("DB_CHARSET", "utf8");
    }

    public static function getPublicKeyCaptcha()
    {
        return self::getVar("RECAPTCHA_SITE_KEY", "");
    }
    public static function getPrivateKeyCaptcha()
    {
        return self::getVar("RECAPTCHA_SECRET_KEY", "");
    }

    public static function getUrlCaptcha()
    {
        return self::getVar("RECAPTCHA_VERIFY_URL", "https://www.google.com/recaptcha/api/siteverify");
    }
    
}