<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class AddConstraints extends AbstractMigration
{
    /**
     * Change Method.
     *
     * Write your reversible migrations using this method.
     *
     * More information on writing migrations is available here:
     * https://book.cakephp.org/phinx/0/en/migrations.html#the-change-method
     *
     * Remember to call "create()" or "update()" and NOT "save()" when working
     * with the Table class.
     */
    public function change(): void
    {
        $table = $this->table('usuarios');
        $table->addIndex('email', array('unique' => true))
            ->update();

        $table = $this->table('lotes');
        $table->addIndex(['numero', 'producto_id'], array('unique' => true))
            ->update();

        $table = $this->table('productos');
        $table->addIndex('nombre', array('unique' => true))
            ->update();

        $table = $this->table('roles');
        $table->addIndex('nombre', array('unique' => true))
            ->update();

        $table = $this->table('tipo_producto');
        $table->addIndex('nombre', array('unique' => true))
            ->update();

        $table = $this->table('fases');
        $table->addIndex('nombre', array('unique' => true))
            ->update();
    }
}
