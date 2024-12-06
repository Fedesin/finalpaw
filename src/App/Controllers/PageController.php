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
        $session = Session::getInstance();
        $user = User::getById($session->user_id);
        
        if ($user->rol_id == 1) {
            $this->redirect("/");
        }
        $tipo_productos = TipoProducto::getAll(); // Obtiene todos los tipos de productos desde el modelo
        parent::showView('admtipopro.view.twig', [
            'tipo_productos' => $tipo_productos
        ]);    
    }

    public function admlotes ()
    {
        $session = Session::getInstance();
        $user = User::getById($session->user_id);
        
        if ($user->rol_id == 1) {
            $this->redirect("/");
        }
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
        $session = Session::getInstance();
        $user = User::getById($session->user_id);
        if ($user->rol_id == 1) {
            $this->redirect("/");
        }
        $tipo_productos = TipoProducto::getAll();
        
        parent::showView('admfases.view.twig', [
            'tipo_productos' => $tipo_productos
        ]);
    }

    public function admform ()
    {
        parent::showView('admform.view.twig', [
            'lotes' => Lote::getAll()
        ]);
    }

    public function admalert ()
    {
        parent::showView('admalert.view.twig');
    }

    public function admuser ()
    {   
        $session = Session::getInstance();
        $user = User::getById($session->user_id);
        
        if ($user->rol_id != 3) {
            $this->redirect("/");
        }
        $cantUsers = User::count();
        $roles = Roles::getAll();

        parent::showView('admuser.view.twig', [
            "cantUsers" => $cantUsers,
            "roles" => $roles
        ]);
    }
}