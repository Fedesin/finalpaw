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
}