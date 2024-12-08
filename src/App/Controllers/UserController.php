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

    public function getUsers($request) {
        $where = [];

        if(isset($request->email)) {
            $where = [
                'email' => [
                    'LIKE', '%' . $request->email . '%'
                ]
            ];
        }

        $cantUsers = User::count($where);

        $limit = 'ALL';
        if(isset($request->limit))
            $limit = $request->limit;

        $offset = 0;
        if(isset($request->offset))
            $offset = $request->offset;

        $users = User::getAll($where, limit: $limit, offset: $offset);

        $ret = [
            'total' => $cantUsers,
            'usuarios' => []
        ];
        foreach($users as $user) {
            $ret['usuarios'][] = [
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

    

    public function verifyPasswordChange($request)
    {
        $token = $request->token;

        // Decodificar el token
        $data = json_decode(base64_decode($token), true);

        if (!isset($data['actual_password'], $data['new_password'], $data['email'], $data['timestamp'])) {
            echo "Enlace inválido o información incompleta.";
            return;
        }

        // Validar que el enlace no haya expirado (por ejemplo, 1 hora de validez)
        if (time() - $data['timestamp'] > 3600) {
            echo "El enlace ha expirado. Por favor, solicita un nuevo cambio de contraseña.";
            return;
        }

        $user = User::getByEmail($data['email']); // Método para obtener el usuario por email

        if (!$user || !$user->verifyPassword($data['actual_password'])) {
            echo "Enlace inválido o contraseña actual incorrecta.";
            return;
        }

        // Actualizar la contraseña
        $user->updatePassword($data['new_password']);
        echo "Tu contraseña ha sido cambiada exitosamente.";
    }

    public function sendVerificationEmail($request) {
        $data = json_decode($request->getBody(), true);

        $email = $data['email'] ?? null;
        $rol_id = $data['rol_id'] ?? null;

        if (!$email || !$rol_id) {
            echo json_encode(['status' => 'error', 'message' => 'Email y rol son obligatorios.']);
            return;
        }

    }

    public function verifyEmail($request) {
        // Obtener el token de la URL
        $token = $_GET['token'] ?? null;
    
        if (!$token) {
            http_response_code(400);
            echo "Enlace inválido. Token faltante.";
            return;
        }
    
        // Decodificar el token
        $decodedToken = json_decode(base64_decode($token), true);
    
        if (!$decodedToken || !isset($decodedToken['email'], $decodedToken['rol_id'], $decodedToken['timestamp'])) {
            http_response_code(400);
            echo "Token inválido o mal formado.";
            return;
        }
    
        $email = $decodedToken['email'];
        $rol_id = $decodedToken['rol_id'];
        $timestamp = $decodedToken['timestamp'];
    
        // Validar si el token no ha expirado
        $tokenLifetime = 3600; // 1 hora
        if ((time() - $timestamp) > $tokenLifetime) {
            http_response_code(400);
            echo "El enlace de verificación ha expirado.";
            return;
        }
    
        // Crear un objeto request simulado con la contraseña por defecto
        $mockRequest = (object) [
            'username' => $email,
            'password' => '1234', // Contraseña por defecto
            'rol_id' => $rol_id
        ];
    
        // Llamar a createUser para delegar la creación del usuario
        $this->createUser($mockRequest);
    }

    public function forgotPassword($request)
    {
        $email = $request->email ?? null;

        if (!$email) {
            $this->jsonResponse(['status' => 'error', 'message' => 'El correo electrónico es obligatorio'], 400);
            return;
        }

        try {
            $user = User::get(['email' => $email]);

            if (!$user) {
                $this->jsonResponse(['status' => 'error', 'message' => 'Usuario no encontrado'], 404);
                return;
            }

            // Generar un token único
            $token = base64_encode(json_encode([
                'email' => $email,
                'timestamp' => time(),
            ]));

            $resetLink = "http://localhost:8080/user/resetPassword?token={$token}";

            // Devolver los datos al frontend para que use EmailJS
            $this->jsonResponse([
                'status' => 'success',
                'data' => [
                    'to_email' => $email,
                    'reset_link' => $resetLink,
                ],
            ]);
        } catch (Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Ocurrió un error inesperado: ' . $e->getMessage()], 500);
        }
    }


    

    public function showResetPasswordForm()
    {
        $token = $_GET['token'] ?? null;

        if (!$token) {
            echo "Enlace inválido o faltante.";
            return;
        }

        // Validar que el token sea válido y no haya expirado
        $data = json_decode(base64_decode($token), true);

        if (!$data || !isset($data['email'], $data['timestamp']) || (time() - $data['timestamp']) > 3600) {
            echo "El enlace ha expirado o es inválido.";
            return;
        }

        // Renderizar la vista de cambio de contraseña
        parent::showView('reset_password.view.twig', ['token' => $token]);
    }


    
    public function resetPassword($request)
    {
        // Decodificar el JSON desde php://input manualmente
        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data || !isset($data['token'], $data['newPassword'])) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Token y nueva contraseña son obligatorios'], 400);
            return;
        }

        $token = $data['token'];
        $newPassword = $data['newPassword'];

        // Decodificar el token
        $tokenData = json_decode(base64_decode($token), true);

        if (!$tokenData || !isset($tokenData['email'], $tokenData['timestamp'])) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Token inválido'], 400);
            return;
        }

        // Validar que el token no haya expirado
        if ((time() - $tokenData['timestamp']) > 3600) { // 1 hora de validez
            $this->jsonResponse(['status' => 'error', 'message' => 'El token ha expirado'], 400);
            return;
        }

        try {
            // Buscar el usuario en la base de datos
            $user = User::getByEmail($tokenData['email']);
            if (!$user) {
                $this->jsonResponse(['status' => 'error', 'message' => 'Usuario no encontrado'], 404);
                return;
            }

            // Actualizar la contraseña del usuario
            $user->updatePassword($newPassword);

            // Respuesta de éxito
            $this->jsonResponse(['status' => 'success', 'message' => 'Contraseña actualizada correctamente']);
        } catch (Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Error inesperado: ' . $e->getMessage()], 500);
        }
    }



    
}
