<?php

namespace Paw\App\Controllers;
use Paw\App\Models\User;
use Paw\App\Models\Roles;
use Paw\Core\Session;
use Paw\Core\Validator;
use Paw\App\Models\TipoProducto;

class PageController extends BaseController
{
    public function __construct()
    {
        parent::__construct();
    }

    public function index()
    {
        $session = Session::getInstance();
        $user = User::getById($session->user_id);

        parent::showView('index.view.twig', [
            "user" => $user
        ]);
    }

    public function login ()
    {
        parent::showView('login.view.twig');
    }

    public function register ()
    {
        parent::showView('register.view.twig');
    }

    public function admtipopro ()
    {
        $tipo_productos = TipoProducto::getAll(); // Obtiene todos los tipos de productos desde el modelo
        parent::showView('admtipopro.view.twig', [
            'tipo_productos' => $tipo_productos
        ]);    
    }

    public function admlotes ()
    {
        $session = Session::getInstance();

        $data = [];
        if(isset($session->admLotesData)) {
            $data = $session->admLotesData;
            unset($session->admLotesData);
        }

        parent::showView('admlotes.view.twig', [
            'data' => $data
        ]);
    }

    public function admfases ()
    {
        parent::showView('admfases.view.twig');
    }

    public function admform ()
    {
        parent::showView('admform.view.twig');
    }

    public function admalert ()
    {
        parent::showView('admalert.view.twig');
    }

    public function admuser ()
    {
        $users = User::getAll();
        $roles = Roles::getAll();

        parent::showView('admuser.view.twig', [
            "users" => $users,
            "roles" => $roles
        ]);
    }
}