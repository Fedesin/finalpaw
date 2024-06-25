<?php

require __DIR__ . '/../vendor/autoload.php';

use Paw\Core\Router;
use Paw\Core\Config;
use Paw\Core\Log;
use Paw\Core\Request;
use Paw\Core\Database\ConnectionBuilder;

use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Twig\Loader\FilesystemLoader;

$log = Log::make(__DIR__ . "/../" . Config::getLogFile(), Config::getLogLevel());

$connectionBuilder = new ConnectionBuilder;
$connectionBuilder->setLogger($log);
$connection = $connectionBuilder->make();

$whoops = new \Whoops\Run;
$whoops->pushHandler(new \Whoops\Handler\PrettyPageHandler);
$whoops->register();

$request = new Request;

//$loader = new \Twig\Loader\FilesystemLoader(__DIR__ . "/App/Views/");
$loader = new FilesystemLoader(__DIR__ . "/App/Views/");
$twig = new \Twig\Environment($loader);

// Define the path for the cache directory
$cachePath = __DIR__ . "/App/Views/cache";

// Create the cache directory if it doesn't exist
if (!is_dir($cachePath)) {
    mkdir($cachePath);
}

// Configure Twig to use the cache directory
/*$twig = new \Twig\Environment($loader, [
    'cache' => $cachePath,
]);

// You can also set other Twig options as needed
$twig->setCache($cachePath);
*/
$router = new Router('ErrorController@notFound', 'ErrorController@internalError');
$router->setLogger($log);

$router->get('/', 'PageController@index');
$router->get('/index', 'PageController@index');

$router->get('/login', 'PageController@login');
$router->post('/login', 'UserController@login');

$router->get('/register', 'PageController@register');
$router->post('/register', 'UserController@register');