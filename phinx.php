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

echo "DB_ADAPTER:".$_ENV["DB_ADAPTER"];
echo "DB_HOSTNAME:".$_ENV["DB_HOSTNAME"];
echo "DB_DBNAME:".$_ENV["DB_DBNAME"];
echo "DB_USERNAME:".$_ENV["DB_USERNAME"];
echo "DB_PASSWORD:".$_ENV["DB_PASSWORD"];
echo "DB_PORT:".$_ENV["DB_PORT"];
echo "DB_CHARSET:".$_ENV["DB_CHARSET"];

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
