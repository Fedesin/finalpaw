<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class ProductosLotes extends AbstractMigration
{
    public function change(): void
    {
        $this->table('productos')->removeColumn('lote_id')->update();

        // Agregar la columna producto_id a la tabla lotes
        $table = $this->table('lotes');
        $table->addColumn('producto_id', 'integer', ['null' => true]) // Permite nulos inicialmente
              ->addForeignKey('producto_id', 'productos', 'id', [
                  'delete' => 'SET_NULL', // Si se elimina un producto, establece producto_id en NULL
                  'update' => 'CASCADE'   // Si se actualiza un producto, actualiza producto_id en lotes
              ])
              ->update();
    }
}
