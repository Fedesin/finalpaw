<?php

namespace Paw\App\Controllers;
use Paw\Core\Validator;
use Paw\Core\Session;
use Paw\Core\Config;
use Paw\App\Models\User;
use Paw\App\Models\Roles;
use Paw\Core\Exceptions\ModelNotFoundException;
use Paw\Core\Exceptions\ModelDuplicateException;
use function Paw\Core\getPublicKeyCaptcha;

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

    public function login($request)
    {
        // verifica el token de recaptcha v3
        $recaptchaToken = $request->{'g-recaptcha-response'};
        $secretKey = Config::getPrivateKeyCaptcha();
        $verifyUrl = Config::getUrlCaptcha();

        // realiza la solicitud a la API de reCAPTCHA
        $response = file_get_contents($verifyUrl . '?secret=' . $secretKey . '&response=' . $recaptchaToken);
        $responseKeys = json_decode($response, true);
        
        if (!$responseKeys['success'] || $responseKeys['score'] < 0.5) {
            $error = 'La verificación de reCAPTCHA falló. Por favor, inténtalo nuevamente.';

            http_response_code(401);

            parent::showView('login.view.twig', [
                "email" => $request->username,
                "status" => $error,
                "sitekey" => Config::getPublicKeyCaptcha()
            ]);
            return;
        }
        
        try {
            $user = User::valid($request->username, $request->password, true);

            // Iniciar la sesión y almacenar el email del usuario
            $session = Session::getInstance();
            $session->logged_in = true;
            $session->email = $user->email;
            $session->user_id = $user->id; // Guardar el ID del usuario

            $this->redirect("/");
        } catch(ModelNotFoundException $e) {
            http_response_code(403);
            $error = 'Usuario o contraseña incorrecto';

            parent::showView('login.view.twig', [
                "email" => $request->username,
                "status" => $error,
                "sitekey" => Config::getPublicKeyCaptcha()
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

    public function setStatus($request) {
        // Lógica para actualizar el estado del usuario en la base de datos.
        $user = User::getById($request->userid);
        $user->status = $request->status;

        // Enviar una respuesta exitosa al cliente
        echo json_encode(['status' => 'success']);
    }

    public function changeRole($request) {
        $user = User::getById($request->user_id);
        $user->rol = $request->rol_id;

        // Enviar una respuesta exitosa al cliente
        echo json_encode(['status' => 'success']);
    }

    public function getUsers($request) {
        $cantUsers = User::countUsersLikeEmail($request->email);
        $users = User::getUsersLikeEmail($request->email, limit: $request->limit, offset: $request->offset);

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
        // Obtener el token de la URL
        $token = $request->token;
    
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
    
        $email = $request->username;
        $password = $request->password;
        $rol_id = $decodedToken['rol_id'];
        $timestamp = $decodedToken['timestamp'];
    
        // Validar si el token no ha expirado
        $tokenLifetime = 3600; // 1 hora
        if ((time() - $timestamp) > $tokenLifetime) {
            http_response_code(400);
            echo "El enlace de verificación ha expirado.";
            return;
        }
        
        try {
            // Registrar el nuevo usuario
            $user = User::register($email, $password, $rol_id);

            // Respuesta exitosa
            $session = Session::getInstance();
            $session->logged_in = true;
            $session->email = $user->email;
            $session->user_id = $user->id; // Guardar el ID del usuario

            $this->redirect("/");
        } catch (\Exception $e) {
            // Captura cualquier otro error inesperado
            parent::showView('establecerPass.view.twig', [
                'email'=> $email,
                'token' => $token,
                'error' => $e->getMessage()
            ]);
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
        // mostrar pantalla la cual va a decir que la contraseña se ha cambiad
        parent::showView('passwordChange.view.twig');
    }

    public function verifyEmail($request){
        $token = $request->token;

        // Decodificar el token
        $data = json_decode(base64_decode($token), true);

        parent::showView('establecerPass.view.twig', [
            'email' => $data['email'],
            'token' => $token
        ]);

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
            
            // Devolver los datos al frontend para que use EmailJS
            $this->jsonResponse([
                'status' => 'success',
                'data' => [
                    'to_email' => $email,
                    'token' => $token,
                ],
            ]);
        } catch (Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Ocurrió un error inesperado: ' . $e->getMessage()], 500);
        }
    }

    public function showResetPasswordForm($request)
    {
        $token = $request->token;

        if (!$token) {
            echo "Enlace inválido o faltante.";
            return;
        }

        // Validar que el token sea válido y no haya expirado
        $data = json_decode(base64_decode($token), true);

        if (!$data || !isset($data['email'], $data['timestamp']) || (time() - $data['timestamp']) > 3600) {
            http_response_code(401);
            echo "El enlace ha expirado o es inválido.";
            return;
        }

        // Renderizar la vista de cambio de contraseña
        parent::showView('reset_password.view.twig', ['token' => $token]);
    }
    
    public function resetPassword($request)
    {
        if (!isset($request->token) || !isset($request->newPassword)) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Token y nueva contraseña son obligatorios'], 400);
            return;
        }

        // Decodificar el token
        $tokenData = json_decode(base64_decode($request->token), true);

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
            $user->updatePassword($request->newPassword);

            // Respuesta de éxito
            $this->jsonResponse(['status' => 'success', 'message' => 'Contraseña actualizada correctamente']);
        } catch (Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Error inesperado: ' . $e->getMessage()], 500);
        }
    } 


    public function changePassword($request)
    {
        if (!isset($request->newPassword)) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Nueva contraseña es obligatoria'], 400);
            return;
        }
        $email=$request->email;
        $actualPassword=$request->actualPassword;
        $newPassword=$request->newPassword;
        try {
            // Buscar el usuario en la base de datos
            $user = User::getByEmail($email);
            if (!$user) {
                $this->jsonResponse(['status' => 'error', 'message' => 'Usuario no encontrado'], 404);
                return;
            }

            if (!$user->verifyPassword($actualPassword)) {
                $this->jsonResponse(['status' => 'error', 'message' => 'Contraseña actual incorrecta'], 400);
                return;
            }else{
                // Actualizar la contraseña del usuario
                $user->updatePassword($newPassword);

                // Respuesta de éxito
                $this->jsonResponse(['status' => 'success', 'message' => 'Contraseña actualizada correctamente']);
            }
        } catch (Exception $e) {
            $this->jsonResponse(['status' => 'error', 'message' => 'Error inesperado: ' . $e->getMessage()], 500);
        }
    } 

}
