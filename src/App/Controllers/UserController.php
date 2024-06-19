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
			parent::showView('login.view.twig', [
				"status"=>"Success"
			]);
			
		} catch(ModelNotFoundException $e) {
			$error = 'Usuario o contraseña incorrecto';
			parent::showView('login.view.twig', [
				"status"=>$error
			]);
		}
	}
}