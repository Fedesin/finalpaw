<?php

namespace Paw\App\Controllers;
use Paw\Core\Validator;
use Paw\Core\Session;
use Paw\App\Models\User;
use Paw\App\Models\Roles;
use Paw\Core\Exceptions\ModelNotFoundException;

class UserController extends BaseController
{
    private $user;
    public function __construct()
    {
        $this->modelName = User::class;
        parent::__construct();
        // Inicializar el usuario logueado
        $this->user = $this->getLoggedInUser();
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
            $user = User::valid($email, $password, true);

            // Iniciar la sesión y almacenar el email del usuario
            $session = Session::getInstance();
            $session->logged_in = true;
            $session->email = $user->email;
            $session->user_id = $user->id; // Guardar el ID del usuario

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

    private function getLoggedInUser()
    {
        // Obtener el ID del usuario desde la sesión
        $session = Session::getInstance();
        if (isset($session->user_id)) {
            // Obtener el usuario por su ID
            return User::getById($session->user_id);
        }
        return null;
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
        $users = User::getAll([
            'email' => [
                'LIKE', '%' . $request->email . '%'
            ]
        ]);

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
    

    public function changePassword($request)
    {
        $session = Session::getInstance();
        $userId = $session->user_id;
        $user = User::getById($userId);
        $newPassword = $request->new_password;

        if (!$user->verifyPassword($request->actual_password)) {
            echo json_encode([
                'success' => false,
                'message' => 'La contraseña ingresada es incorrecta.'
            ]);
            return;
        }

        if ($user) {
            $user->updatePassword($newPassword); // Aplicar el cambio de contraseña
            echo json_encode([
                'success' => true,
                'message' => 'Contraseña cambiada con éxito.'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Usuario no encontrado.'
            ]);
        }
    }


}
