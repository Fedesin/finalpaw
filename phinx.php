<?php

require __DIR__ . '/vendor/autoload.php';

use Dotenv\Dotenv;

$args = $_SERVER['argv'];
$index = array_search("--environment", $args, true) ;
$index = $index ? $index : array_search("-e", $args, true) ;
$environment = $index ? $args[$index + 1] : '' ;

if(file_exists($environment.'.env')) {
	$dotenv = Dotenv::createUnsafeImmutable(__DIR__, $environment.'.env');
	$dotenv->load();
}

return
[
    'paths' => [
        'migrations' => '%%PHINX_CONFIG_DIR%%/db/migrations',
        'seeds' => '%%PHINX_CONFIG_DIR%%/db/seeds'
    ],
    'environments' => [
        'default_migration_table' => 'phinxlog',
        'default_environment' => '',
        $environment => [
            'adapter' => $_ENV["DB_ADAPTER"] ?? 'pgsql',
            'host' => $_ENV["DB_HOSTNAME"] ?? 'localhost',
            'name' => $_ENV["DB_DBNAME"] ?? 'development_db',
            'user' => $_ENV["DB_USERNAME"]??'root',
            'pass' => $_ENV["DB_PASSWORD"]??'',
            'port' => $_ENV["DB_PORT"]??'5432',
            'charset' => $_ENV["DB_CHARSET"]??'utf8',
        ]
    ],
    'version_order' => 'creation'
];
