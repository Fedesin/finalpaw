<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class OrdenTablaFases extends AbstractMigration
{
    public function change(): void
    {
        $table = $this->table('fases', ['id' => false, 'primary_key' => 'id']);
        $table->addColumn('numero_orden', 'integer')->update();
    }
}
