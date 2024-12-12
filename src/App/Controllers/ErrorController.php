<?php

namespace Paw\App\Controllers;

class ErrorController extends BaseController
{
    public function __construct()
    {
        parent::__construct();
    }

    public function notFound($request)
    {
        http_response_code(404);

        if($request->accept() == 'application/json') {
            echo json_encode(['success' => false, 'message' => 'Modelo no encontrado']);
        } else {
            parent::showView('not-found.view.twig');
        }
    }

    public function internalError()
    {
        http_response_code(500);
        parent::showView('internal-error.view.twig');
    }
}