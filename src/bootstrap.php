<?php

require __DIR__ . '/../vendor/autoload.php';

use Paw\Core\Router;
use Paw\Core\Config;
use Paw\Core\Log;
use Paw\Core\Request;
use Paw\Core\Session;
use Paw\Core\Database\ConnectionBuilder;
use Paw\App\Models\User;

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
$twig->addFilter(new \Twig_SimpleFilter('ucfirst', 'ucfirst'));
$twig->addFilter(new \Twig_Filter('json_decode', function($string) {
    return json_decode($string, true);
}));

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

$session = Session::getInstance();

if(!isset($session->logged_in)) {
    $router->get('/', 'PageController@login');

    $router->get('/login', 'PageController@login');
    $router->post('/login', 'UserController@login');
    $router->post('/api/user/forgotPassword', 'UserController@forgotPassword');
    $router->get('/user/resetPassword', 'UserController@showResetPasswordForm');
    $router->post('/user/resetPassword', 'UserController@resetPassword');

    $router->get('/verify', 'UserController@verifyEmail'); // Endpoint para verificar usuarios
    $router->post('/verify', 'UserController@createUser'); // Endpoint para verificar usuarios

} else {
    $session = Session::getInstance();
    $user = User::getById($session->user_id);

    if($user->rol->nombre == 'administrador') {
        $router->get('/admuser', 'PageController@admuser');
    }

    if($user->rol->nombre != 'usuario') {
        $router->get('/admtipopro', 'PageController@admtipopro');
        $router->get('/admlotes', 'PageController@admlotes');
        $router->get('/admfases', 'PageController@admfases');
    }

    $router->get('/logout', 'UserController@logout');

    $router->get('/', 'PageController@index');
    $router->get('/index', 'PageController@index');
    $router->get('/help', 'PageController@help');

    $router->get('/admform', 'PageController@admform');

    $router->get('/admalert', 'PageController@admalert');
    
    $router->get('/api/users', 'UserController@getUsers');

    $router->put('/api/users', 'UserController@updateUser');

    $router->get('/api/roles', 'UserController@getRoles');

    $router->post('/api/users/change-role', 'UserController@changeRole');
    $router->post('/api/user/change-password', 'UserController@changePassword');

    $router->get('/verify-password-change', 'UserController@verifyPasswordChange');

    $router->get('/api/fases', 'FasesController@getFases');

    $router->put('/api/fases', 'FasesController@updateFase');
    
    $router->get('/api/fases/atributos', 'FasesController@getAttributes');
    $router->post('/api/fases/atributos', 'FasesController@addAttribute');
    $router->put('/api/fases/atributos', 'FasesController@updateAttribute');

    $router->delete('/api/fases/deleteCampo', 'FasesController@deleteCampo');

    $router->delete('/api/fases', 'FasesController@deleteFase');

    $router->post('/api/fases', 'FasesController@createFase');

    $router->get('/api/productos', 'ProductoController@getProductos'); // API para obtener productos
    $router->post('/api/productos', 'ProductoController@createProducto'); // API para crear producto
    $router->put('/api/productos', 'ProductoController@updateProducto'); // API para actualizar producto
    $router->delete('/api/productos', 'ProductoController@deleteProducto'); // API para eliminar producto

    $router->post('/api/lotes', 'LotesController@createLote'); // Para crear un nuevo lote
    $router->get('/api/lotes', 'LotesController@getAll'); // Para crear un nuevo lote
    $router->get('/lotes/cargar', 'LotesController@viewCargar'); // Para crear un nuevo lote
    $router->get('/lotes/ver', 'LotesController@viewLote'); 
    $router->get('/api/productos/tipo-productos', 'ProductoController@getTipoProductos'); // Para obtener tipos de productos
    $router->post('/update_attributes', 'LotesController@updateAttributes');
    $router->post('/lotes/pasarFase', 'LotesController@pasarFase');

    $router->get('/api/lotes/ultima-produccion', 'LotesController@getUltimaProduccion');

}