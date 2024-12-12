<?php

namespace Paw\App\Controllers;
use Paw\App\Models\User;
use Paw\App\Models\Roles;
use Paw\Core\Session;
use Paw\Core\Validator;
use Paw\App\Models\TipoProducto;
use Paw\App\Models\Lote;
use Paw\Core\Config;

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
        $emailjskey = Config::getPublicKeyEmailjs();
        parent::showView('index.view.twig', [
            "user" => $user,
            "emailjskey" => $emailjskey,
            "userMail" => $userEmail
            
        ]);
    }

    public function login ()
    {
        $emailjskey = Config::getPublicKeyEmailjs();
        $sitekey = Config::getPublicKeyCaptcha();
        parent::showView('login.view.twig', [
            "sitekey" => $sitekey,
            "emailjskey" => $emailjskey
            ]);
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

        //si el usuario activo es rol usuario o rol supervisor entonces
        //solo muestro los lotes en los cuales el 
        //es un integrante
        if ($user->rol->nombre == 'usuario' || $user->rol->nombre == 'supervisor') {    
            $lotes = Lote::filtrarPorUsuario($user->id);
        } else {
            $lotes = Lote::getAll();
        }

        parent::showView('admform.view.twig', [
            'lotes' => $lotes,
            'user' => $user
        ]);
    }

    public function admalert ()
    {
        parent::showView('admalert.view.twig');
    }

    public function admuser ()
    {
        $emailjskey = Config::getPublicKeyEmailjs();
        $session = Session::getInstance();
        $user = User::getById($session->user_id);
        $cantUsers = User::count();
        $roles = Roles::getAll();

        parent::showView('admuser.view.twig', [
            "cantUsers" => $cantUsers,
            "roles" => $roles,
            "user" => $user,
            "emailjskey" => $emailjskey
        ]);
    }
    
    public function help()
    {   
        $session = Session::getInstance();
        $user = User::getById($session->user_id);
        return $this->showView('help.view.twig',[
            "user" => $user
        ]);
    }
}