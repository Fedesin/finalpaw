<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class AddInitialData extends AbstractMigration
{
	/**
	 * Migrate Up.
	**/
	public function up(): void
	{
		$admin_id = $this->getInsertBuilder()
			->insert(['nombre'])
			->into('roles')
			->values(['nombre' => 'usuario'])
			->values(['nombre' => 'supervisor'])
			->values(['nombre' => 'administrador'])
			->execute()
			->lastInsertId();

		/*
		1   admin@admin.com $2y$10$iJIxxQQMlPB/iPGjHd2JyOieit/5NyDCpUwYeaXBLgcl5UzFQEo9u    administrador   2024-02-22 14:36:45.71932   \N
		*/

		$this->getInsertBuilder()
			->insert(['email', 'password', 'rol_id', 'last_login'])
			->into('usuarios')
			->values([
				'email' => 'admin@admin.com',
				'password' => password_hash('123456', PASSWORD_BCRYPT),
				'rol_id' => $admin_id,
				'last_login' => 'NOW()'
			])
			->execute();
	}

	/**
	 * Migrate Down.
	**/
	public function down(): void
	{
		$this->getDeleteBuilder()
			->from('usuarios')
			->where(['email' => 'admin@admin.com'])
			->execute();

		$roles = [
			'usuario',
			'supervisor',
			'administrador'
		];

		$this->getDeleteBuilder()
			->from('roles')
			->whereInList('nombre', $roles)
			->execute();
	}
}
