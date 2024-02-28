<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class SchemaCreation extends AbstractMigration
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
		/*
		Phinx automatically creates an auto-incrementing primary key column called id for every table.
		*/

		/*
		CREATE TYPE public.roles AS ENUM (
			'usuario',
			'supervisor',
			'administrador'
		);
		*/

		$table = $this->table('roles');
		$table->addColumn('nombre', 'string', ['null' => false, 'limit' => 20])
			->create();

				/*
		CREATE TABLE public.tipo_producto (
			id integer NOT NULL,
			nombre character varying(50) NOT NULL
		);
		*/

		$table = $this->table('tipo_producto');
		$table->addColumn('nombre', 'string', ['null' => false, 'limit' => 50])
			->create();

		/*
		CREATE TABLE public.usuario (
			id integer NOT NULL,
			email character varying(255) NOT NULL,
			password character varying(64) NOT NULL,
			rol public.roles NOT NULL,
			created_at timestamp without time zone DEFAULT now() NOT NULL,
			last_login timestamp without time zone
		);
		*/

		$table = $this->table('usuarios', ['null' => false]);
		$table->addColumn('email', 'string', ['null' => false, 'limit' => 100])
			->addColumn('password', 'string', ['null' => false, 'limit' => 64])
			->addColumn('rol_id', 'integer', ['null' => false])
			->addColumn('last_login', 'timestamp', ['null' => false])
			->addTimestamps(null, false)
			->addForeignKey('rol_id', 'roles', 'id', ['delete' => 'NO_ACTION'])
			->create();

		/*
		CREATE TABLE public.fase (
			id integer NOT NULL,
			nombre character varying(50) NOT NULL,
			tipo_producto_id integer NOT NULL,
			atributos json
		);
		*/

		$table = $this->table('fases');
		$table->addColumn('nombre', 'string', ['limit' => 50])
			->addColumn('tipo_producto_id', 'integer', ['null' => false])
			->addColumn('atributos', 'json')
			->addForeignKey('tipo_producto_id', 'tipo_producto', 'id', ['delete' => 'NO_ACTION'])
			->create();

		/*
		CREATE TABLE public.lote (
			id integer NOT NULL,
			nro integer NOT NULL,
			fecha date NOT NULL,
			supervisor integer NOT NULL,
			enc_de_prod integer NOT NULL,
			enc_de_limp integer NOT NULL,
			fase integer NOT NULL
		);
		*/

		$table = $this->table('lotes');
		$table->addColumn('numero', 'integer', ['null' => false])
			->addColumn('fecha', 'date', ['null' => false])
			->addColumn('fase_actual', 'integer', ['null' => false])
			->addColumn('supervisor_id', 'integer', ['null' => false])
			->addColumn('encargado_produccion_id', 'integer', ['null' => false])
			->addColumn('encargado_limpieza_id', 'integer', ['null' => false])
			->addForeignKey('fase_actual', 'fases', 'id', ['delete' => 'NO_ACTION'])
			->addForeignKey('supervisor_id', 'usuarios', 'id', ['delete' => 'NO_ACTION'])
			->addForeignKey('encargado_produccion_id', 'usuarios', 'id', ['delete' => 'NO_ACTION'])
			->addForeignKey('encargado_limpieza_id', 'usuarios', 'id', ['delete' => 'NO_ACTION'])
			->create();

		/*
		CREATE TABLE public.producto (
			id integer NOT NULL,
			nombre character varying(50) NOT NULL,
			tipo_producto_id integer NOT NULL,
			lote_id integer NOT NULL
		);
		*/

		$table = $this->table('productos');
		$table->addColumn('nombre', 'string', ['null' => false, 'limit' => 50])
			->addColumn('tipo_producto_id', 'integer', ['null' => false])
			->addColumn('lote_id', 'integer', ['null' => false])
			->addForeignKey('tipo_producto_id', 'tipo_producto', 'id', ['delete' => 'NO_ACTION'])
			->addForeignKey('lote_id', 'lotes', 'id', ['delete' => 'NO_ACTION'])
			->create();



/*
COPY public.usuario (id, email, password, rol, created_at, last_login) FROM stdin;
1   admin@admin.com $2y$10$iJIxxQQMlPB/iPGjHd2JyOieit/5NyDCpUwYeaXBLgcl5UzFQEo9u    administrador   2024-02-22 14:36:45.71932   \N
\.
*/
	}
}
