<?php

namespace Paw\App\Controllers;

use Paw\App\Models\Fases;
use Paw\App\Models\TipoProducto;

class FasesController extends BaseController
{
    public function __construct()
    {
        parent::__construct();
    }

    public function index($request)
    {
        $tipo_producto = TipoProducto::getAll();

        parent::showView('admfases.view.twig', [
            'tipo_producto' => $tipo_producto
        ]);
    }
}