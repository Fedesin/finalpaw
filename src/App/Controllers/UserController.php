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
				"status"=>$error
			]);
		}
	}


	public function register()
	{
		$data = $_POST;		
		$email = $data['username'];
		$password = $data['password'];
		$repeatPassword = $data['repeat-password'];

		try {
			if ($password !== $repeatPassword){
				$passverify = 'Las contraseñas no coinciden';
				parent::showView('register.view.twig', [
					"status" => $passverify
				]);
			}
		} catch(ModelNotFoundException $e) {
			$error = 'Error al registrar usuario';
			parent::showView('register.view.twig', [
				"status"=>$error
			]);
		}

		try {
			$user = User::register($email, $password);
			$success = 'Usuario registrado con exito';
			parent::showView('register.view.twig', [
				"status"=>$success
			]);
			
		} catch(ModelNotFoundException $e) {
			$error = 'Error al registrar usuario: ' . $e->getMessage();
			parent::showView('register.view.twig', [
				"status"=>$error
			]);
		}
	}

}