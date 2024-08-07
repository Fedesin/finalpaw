<?php

namespace Paw\App\Controllers;
use Paw\Core\Validator;
use Paw\App\Models\User;
use Paw\Core\Exceptions\ModelNotFoundException;

class UserController extends BaseController
{
    public function __construct()
    {
        $this->modelName = User::class;
        parent::__construct();
    }

    public function index()
    {
        parent::showView('index.view.twig');
    }

    public function login()
    {
        $data = $_POST;
        $valido = true;
        
        $email = $data['username'];
        $password = $data['password'];

        try {
            $user = User::valid($email, $password);
            parent::showView('index.view.twig');
            
        } catch(ModelNotFoundException $e) {
            $error = 'Usuario o contraseña incorrecto';
            parent::showView('login.view.twig', [
                "status" => $error
            ]);
        }
    }

    public function getRoles()
    { 
        $roles = [
			['id' => 1, 'nombre' => 'usuario'],
			['id' => 2, 'nombre' => 'supervisor'],
			['id' => 3, 'nombre' => 'administrador']
		];

        parent::showView('register.view.twig', [
            "roles" => $roles
        ]);
    }

    public function showRegisterForm()
    {
        $this->getRoles();
    }

    public function register()
    {
        $data = $_POST;
        
        $email = $data['username'];
        $password = $data['password'];
        $rol_id = $data['rol_id'];

        try {
			$user = new User();
            $user->register($email, $password, $rol_id); // Llamada no estática
        	parent::showView('index.view.twig');
        } catch(ModelNotFoundException $e) {
            $error = 'Ocurrio un error al registrar el usuario';
            parent::showView('register.view.twig', [
                "status" => $error
            ]);
        }
    }
}
