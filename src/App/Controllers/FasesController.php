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
        $tipo_productos = TipoProducto::getAll();

        parent::showView('admfases.view.twig', [
            'tipo_productos' => $tipo_productos
        ]);
    }


    public function getFases($request) {
        $params = [];

        if (isset($request->tipo_producto_id))
            $params["tipo_producto_id"] = $request->tipo_producto_id;

        $fases = Fases::getAll($params);

        $ret = [];
        foreach($fases as $fase) {
            $ret[$fase->id] = [
                "id" => $fase->id,
                "nombre" => $fase->nombre,
                "tipo_producto_id" => $fase->tipo_producto_id,
                "atributos" => $fase->atributos
            ];
        }
        
        echo json_encode(['status' => 'success', 'data' => $ret]);
    }

    public function createFase($request) {
        $fase = Fases::create($request->fase_nombre, $request->tipo_producto_id);

        if ($fase) {
            $ret = [
                "id" => $fase->id,
                "nombre" => $fase->nombre,
                "tipo_producto_id" => $fase->tipo_producto_id,
                "atributos" => $fase->atributos
            ];
            echo json_encode(['status' => 'success', 'data' => $ret]);
        } else {
            echo json_encode(['status' => 'error']);
        }
    }
}