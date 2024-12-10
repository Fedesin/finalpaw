<?php

namespace Paw\App\Controllers;
use Paw\App\Models\User;
use Paw\App\Models\Roles;
use Paw\Core\Session;
use Paw\Core\Validator;
use Paw\App\Models\TipoProducto;
use Paw\App\Models\Lote;

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
        $userEmail= $user->email;

        parent::showView('index.view.twig', [
            "user" => $user,
            "userMail" => $userEmail
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

        $session = Session::getInstance();
        $user = User::getById($session->user_id);
        
        $tipo_productos = TipoProducto::getAll(); 
        parent::showView('admtipopro.view.twig', [
            'tipo_productos' => $tipo_productos,
            'user' => $user
        ]);    
    }

    public function admlotes ()
    {
        $session = Session::getInstance();
        $user = User::getById($session->user_id);
        
        $data = [];
        if(isset($session->admLotesData)) {
            $data = $session->admLotesData;
            unset($session->admLotesData);
        }
        $users = User::getAll();
        parent::showView('admlotes.view.twig', [
            'data' => $data,
            'user' => $user,
            'users' => $users
        ]);
    }

    public function admfases ()
    {
        $session = Session::getInstance();
        $user = User::getById($session->user_id);
        
        $tipo_productos = TipoProducto::getAll();
        
        parent::showView('admfases.view.twig', [
            'tipo_productos' => $tipo_productos,
            'user' => $user
        ]);
    }

    public function admform ()
    {
        $session = Session::getInstance();
        $user = User::getById($session->user_id);
        $userId= $user->id;
        if ($user->rol_id == 1 || $user->rol_id == 2) {
            //si el usuario activo es rol usuario o rol supervisor entonces
            //solo muestro los lotes en los cuales el 
            //es un integrante
            $where = [
                'OR' => [
                    ['supervisor_id', '=', $userId],
                    ['encargado_produccion_id', '=', $userId],
                    ['encargado_limpieza_id', '=', $userId],
                ]
            ];
    
            parent::showView('admform.view.twig', [
                'lotes' => Lote::getAll($where),
                'user' => $user
            ]);
        } else {
            //si el usuario es administrador que pueda ver todos los lotes
            parent::showView('admform.view.twig', [
                'lotes' => Lote::getAll(),
                'user' => $user
            ]);
        }
    }

    public function admalert ()
    {
        parent::showView('admalert.view.twig');
    }

    public function admuser ()
    {
        $session = Session::getInstance();
        $user = User::getById($session->user_id);
        $cantUsers = User::count();
        $roles = Roles::getAll();


        parent::showView('admuser.view.twig', [
            "cantUsers" => $cantUsers,
            "roles" => $roles,
            "user" => $user
        ]);
    }
}