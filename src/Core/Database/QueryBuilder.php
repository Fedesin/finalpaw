<?php

namespace Paw\Core\Database;

use PDO;
use Monolog\Logger;

class QueryBuilder
{
    private $pdo;
    private $logger;

    public function __construct(PDO $pdo, Logger $logger = null)
    {
        $this->pdo = $pdo;
        $this->logger = $logger;
    }

    public function count($table, $where = [])
    {
        $whereStr = "WHERE 1 = 1 ";
        $operators = ["=", "<", ">", "<=", ">=", "<>", "LIKE"];

        foreach ($where as $key => $value) {
            if(is_array($value)) {
                $op = $value[0];
                $val = $value[1];

                if(!in_array($op, $operators))
                    throw new \Exception($op . " comparador no implementado");
            } else {
                $op = "=";
                $val = $value;
            }

            $whereStr .= "AND {$key} {$op} :{$key} " ;
        }

        $query = "SELECT * FROM {$table} {$whereStr}";
        $sentencia = $this->pdo->prepare($query);

        foreach ($where as $key => $value) {
            $sentencia->bindValue(":{$key}", is_array($value) ? $value[1] : $value);
        }
        
        $sentencia->setFetchMode(PDO::FETCH_ASSOC);
        $sentencia->execute(); 
        
        return $sentencia->rowCount();
    }

    public function select($table, $where = [], $order_by = 'id', $direction = 'ASC', $limit = 'ALL', $offset = 0)
    {
        $whereStr = "WHERE 1 = 1 ";
        $operators = ["=", "<", ">", "<=", ">=", "<>", "LIKE"];

        foreach ($where as $key => $value) {
            if(is_array($value)) {
                $op = $value[0];
                $val = $value[1];

                if(!in_array($op, $operators))
                    throw new \Exception($op . " comparador no implementado");
            } else {
                $op = "=";
                $val = $value;
            }

            $whereStr .= "AND {$key} {$op} :{$key} " ;
        }

        // Incorporar order_by y direction (por defecto ASC)
        $query = "SELECT * FROM {$table} {$whereStr} ORDER BY {$order_by} {$direction} LIMIT {$limit} OFFSET {$offset}";

        $sentencia = $this->pdo->prepare($query);

        foreach ($where as $key => $value) {
            $sentencia->bindValue(":{$key}", is_array($value) ? $value[1] : $value);
        }
        
        $sentencia->setFetchMode(PDO::FETCH_ASSOC);
        $sentencia->execute(); 
        
        return $sentencia->fetchAll();
    }

    public function insert($table, $values)
    {
        $columns = implode(', ', array_keys($values));
        $placeholders = ':' . implode(', :', array_keys($values));

        $query = "INSERT INTO {$table} ({$columns}) VALUES ({$placeholders})";
        $statement = $this->pdo->prepare($query);

        foreach ($values as $key => $value) {
            $statement->bindValue(":{$key}", $value);
        }

        $statement->execute();

        return $this->pdo->lastInsertId();
    }

    public function update($table, $values, $where = [])
    {
        $setClause = [];
        foreach ($values as $key => $value) {
            $setClause[] = "{$key} = :set_{$key}";
        }

        $whereStr = "1 = 1 ";
        $operators = ["=", "<", ">", "<=", ">=", "<>", "LIKE"];

        foreach ($where as $key => $value) {
            if(is_array($value)) {
                $op = $value[0];
                $val = $value[1];

                if(!in_array($op, $operators))
                    throw new \Exception($op . " comparador no implementado");
            } else {
                $op = "=";
                $val = $value;
            }

            $whereStr .= "AND {$key} {$op} :{$key} " ;
        }

        $query = "UPDATE {$table} SET " . implode(', ', $setClause) . " WHERE {$whereStr}";
        $statement = $this->pdo->prepare($query);

        foreach ($values as $key => $value) {
            $statement->bindValue(":set_{$key}", $value);
        }

        foreach ($where as $key => $value) {
            $statement->bindValue(":{$key}", is_array($value) ? $value[1] : $value);
        }

        $statement->execute();

        return $statement->rowCount();
    }

    public function increment($table, $field, $where) {
        $whereStr = "1 = 1 ";
        $operators = ["=", "<", ">", "<=", ">=", "<>", "LIKE"];

        foreach ($where as $key => $value) {
            if(is_array($value)) {
                if(count($value) > 2) {
                    $attr = $value[0];
                    $op = $value[1];
                    $val = $value[2];
                } else {
                    $attr = $key;
                    $op = $value[0];
                    $val = $value[1];
                }

                if(!in_array($op, $operators))
                    throw new \Exception($op . " comparador no implementado");
            } else {
                $attr = $key;
                $op = "=";
                $val = $value;
            }

            $whereStr .= "AND {$attr} {$op} :{$key} " ;
        }

        $query = "UPDATE {$table} SET {$field} = {$field} + 1 WHERE {$whereStr}";
        $statement = $this->pdo->prepare($query);

        foreach ($where as $key => $value) {
            $statement->bindValue(":{$key}", is_array($value) ? end($value) : $value);
        }

        $statement->execute();

        return $statement->rowCount();
    }

    public function decrement($table, $field, $where) {
        $whereStr = "1 = 1 ";
        $operators = ["=", "<", ">", "<=", ">=", "<>", "LIKE"];

        foreach ($where as $key => $value) {
            if(is_array($value)) {
                if(count($value) > 2) {
                    $attr = $value[0];
                    $op = $value[1];
                    $val = $value[2];
                } else {
                    $attr = $key;
                    $op = $value[0];
                    $val = $value[1];
                }

                if(!in_array($op, $operators))
                    throw new \Exception($op . " comparador no implementado");
            } else {
                $attr = $key;
                $op = "=";
                $val = $value;
            }

            $whereStr .= "AND {$attr} {$op} :{$key} " ;
        }

        $query = "UPDATE {$table} SET {$field} = {$field} - 1 WHERE {$whereStr}";
        $statement = $this->pdo->prepare($query);

        foreach ($where as $key => $value) {
            $statement->bindValue(":{$key}", is_array($value) ? end($value) : $value);
        }

        $statement->execute();

        return $statement->rowCount();
    }

    public function delete($table, $where = [])
    {
        $whereStr = "";
        foreach ($where as $key => $value) {
            $whereStr .= "AND {$key} = :{$key} ";
        }
        $whereStr = trim($whereStr, "AND ");

        $query = "DELETE FROM {$table} WHERE {$whereStr}";
        $statement = $this->pdo->prepare($query);

        foreach ($where as $key => $value) {
            $statement->bindValue(":{$key}", $value);
        }

        $statement->execute();

        return $statement->rowCount();
    }
}
