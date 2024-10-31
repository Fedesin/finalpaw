<?php

namespace Paw\App\Controllers;

use Paw\App\Models\Producto;
use Paw\App\Models\TipoProducto;

class ProductoController extends BaseController
{
    public function __construct()
    {
        parent::__construct();
    }

    // Método para mostrar la vista de gestión de productos
    public function index($request) {
        $tipoproductos = TipoProducto::getAll();
        
        parent::showView('admproductos.view.twig', [
            'tipoproductos' => $tipoproductos
        ]);
    }

    // Método para obtener la lista de productos según el tipo de producto
    public function getProductos() {
        $productos = Producto::getAll();
        $ret = [];
    
        foreach($productos as $producto) {
            $tipoProducto = TipoProducto::getById($producto->tipo_producto_id); // Cargar el tipo de producto
            
            $ret[] = [
                "id" => $producto->id,
                "nombre" => $producto->nombre,
                "tipo_producto" => [
                    "id" => $tipoProducto->id,
                    "nombre" => $tipoProducto->nombre
                ]
            ];
        }
        
        echo json_encode(['status' => 'success', 'productos' => $ret]);
    }
    

    // Método para crear un nuevo producto
    public function createProducto($request) {
        try {
            $nombre = $request->nombre ?? null;
            $tipo_producto_id = $request->tipo_producto_id ?? null;
    
            if ($nombre === null || $tipo_producto_id === null) {
                echo json_encode(['status' => 'error', 'message' => 'Nombre o Tipo de producto no pueden estar vacíos']);
                return;
            }
    
            $producto = Producto::create($nombre, $tipo_producto_id);
    
            if ($producto) {
                $ret = [
                    "id" => $producto->id,
                    "nombre" => $producto->nombre,
                    "tipo_producto_id" => $producto->tipo_producto_id
                ];
                echo json_encode(['status' => 'success', 'data' => $ret]);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'No se pudo crear el producto']);
            }
        } catch (Exception $e) {
            error_log($e->getMessage());
            echo json_encode(['status' => 'error', 'message' => 'Error del servidor']);
        }
    }
    
    

    // Método para eliminar un producto
    public function deleteProducto($request)
    {
        $productoId = $request->producto_id;
        $producto = Producto::getById($productoId);

        if ($producto) {
            $producto->delete();
            echo json_encode(['success' => true, 'message' => 'Producto eliminado correctamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Producto no encontrado']);
        }
    }

    // Método para actualizar un producto
    public function updateProducto($request)
    {
        $producto = Producto::getById($request->producto_id);

        if ($producto) {
            if (isset($request->nombre)) {
                $producto->nombre = $request->nombre;
            }
            
            if (isset($request->tipo_producto_id)) {
                $producto->tipo_producto_id = $request->tipo_producto_id;
            }

            $producto->save();
            echo json_encode(['success' => true, 'message' => 'Producto actualizado correctamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Producto no encontrado']);
        }
    }
}
