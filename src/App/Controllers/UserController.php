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
        $ret = [];
        foreach($roles as $rol) {
            $ret[$rol->id] = $rol->nombre;
        }
        echo json_encode($ret);
    }

    public function showRegisterForm()
    {
        $roles = $this->getRoles();
        parent::showView('register.view.twig', [
            "roles" => $roles
        ]);
    }

    private function emailExists($email) {
        $user = User::get(['email' => $email]); // Usar el método `get` del modelo `User`
        return $user !== null; // Si devuelve un usuario, entonces existe
    }

    public function register($request)
    {
        header('Content-Type: application/json');
        
        $email = $request->username;

        // Verifica si el correo ya está registrado
        if ($this->emailExists($email)) {
            echo json_encode(['status' => 'error', 'message' => 'Ya existe un usuario registrado con ese email.']);
            return;
        }

        $password = $request->password;
        $rol_id = $request->rol_id;
        
        try {
            // Registrar el nuevo usuario
            $user = new User();
            $user->register($email, $password, $rol_id);

            // Respuesta exitosa
            echo json_encode(['status' => 'success', 'message' => 'Usuario registrado correctamente']);
        } catch (Exception $e) {
            // Captura cualquier otro error inesperado
            echo json_encode(['status' => 'error', 'message' => 'Ocurrió un error inesperado: ' . $e->getMessage()]);
        }
    }

    public function setStatus($request) {
        // Lógica para actualizar el estado del usuario en la base de datos.
        $user = User::getById($request->userid);
        $user->deshabilitado = $request->status;
        $user->save();

        // Enviar una respuesta exitosa al cliente
        echo json_encode(['status' => 'success']);
    }

    public function changeRole($request) {
        $user = User::getById($request->user_id);
        $user->rol_id = $request->rol_id;
        $user->save();

        // Enviar una respuesta exitosa al cliente
        echo json_encode(['status' => 'success']);
    }

    public function getUsers() {
        $users = User::getAll(); // Asegúrate de que tu modelo User tenga este método

        $ret = [];
        foreach($users as $user) {
            $ret[$user->id] = [
                "id" => $user->id,
                "email" => $user->email,
                "rol_id" => $user->rol_id,
                "deshabilitado" => $user->deshabilitado

            ];
        }
        
        echo json_encode($ret);
    }

    public function updateUser($request) {
        // Lógica para actualizar el estado del usuario en la base de datos.
        $user = User::getById($request->userid);

        if(isset($request->email))
            $user->email = $request->email;

        if(isset($request->rol_id))
            $user->rol_id = $request->rol_id;

        if(isset($request->deshabilitado))
            $user->deshabilitado = $request->deshabilitado;

        $user->save();

        // Enviar una respuesta exitosa al cliente
        echo json_encode(['status' => 'success']);
    }

    public function createUser($request)
    {
        header('Content-Type: application/json');
        
        $email = $request->username;

        // Verifica si el correo ya está registrado
        if ($this->emailExists($email)) {
            echo json_encode(['status' => 'error', 'message' => 'Ya existe un usuario registrado con ese email.']);
            return;
        }

        $password = $request->password;
        $rol_id = $request->rol_id;
        
        try {
            // Registrar el nuevo usuario
            $user = new User();
            $user->register($email, $password, $rol_id);

            // Respuesta exitosa
            echo json_encode(['status' => 'success', 'message' => 'Usuario registrado correctamente']);
        } catch (Exception $e) {
            // Captura cualquier otro error inesperado
            echo json_encode(['status' => 'error', 'message' => 'Ocurrió un error inesperado: ' . $e->getMessage()]);
        }
    }
    private function jsonResponse($data, $status = 200) {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }


    public function getUsersViaEmail($request)
    { 
        $userModel = new User();
        $users = $userModel->filtrarPorEmail($request->email);

        echo json_encode($users);
    }

}
