<?php

namespace Paw\App\Controllers;
use Paw\Core\Validator;
use Paw\Core\Session;
use Paw\App\Models\User;
use Paw\App\Models\Roles;
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
        $email = $data['username'];
        $password = $data['password'];

        try {
            $user = User::valid($email, $password);

            // Iniciar la sesión y almacenar el email del usuario
            $session = Session::getInstance();
            $session->logged_in = true;
            $session->email = $user->email;

            $this->redirect("/");
        } catch(ModelNotFoundException $e) {
            $error = 'Usuario o contraseña incorrecto';
            parent::showView('login.view.twig', [
                "email" => $email,
                "status" => $error
            ]);
        }
    }

    public function logout()
    {
        $session = Session::getInstance()->destroy();
        $this->redirect("/");
    }

    public function getRoles()
    { 
        $roles = Roles::getAll();

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
