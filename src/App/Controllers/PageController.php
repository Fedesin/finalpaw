<?php

namespace Paw\App\Controllers;
use Paw\Core\Validator;

class PageController extends BaseController
{
    public function __construct()
    {
        parent::__construct();
    }

    public function index()
    {
        parent::showView('index.view.twig');
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
        parent::showView('admtipopro.view.twig');
    }

    public function admlotes ()
    {
        parent::showView('admlotes.view.twig');
    }
}