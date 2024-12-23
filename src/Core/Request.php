<?php

namespace Paw\Core;

class Request
{
    private $post = null;
    private $get = null;
    private $body = null;

    public function __construct()
    {
        $this->post = $_POST;
        $this->get = $_GET;
        $this->body = json_decode(file_get_contents('php://input'), TRUE);
    }

    public function __get($name)
    {
        if(isset($this->body) && array_key_exists($name, $this->body))
            return $this->body[$name];

        if(isset($this->post) && array_key_exists($name, $this->post))
            return $this->post[$name];

        if(isset($this->get) && array_key_exists($name, $this->get))
            return $this->get[$name];
        
        return null;
    }

    public function __isset($name)
    {
        if(isset($this->body) && array_key_exists($name, $this->body))
            return true;

        if(isset($this->post) && array_key_exists($name, $this->post))
            return true;
        
        if(isset($this->get) && array_key_exists($name, $this->get))
            return true;
        
        return false;
    }

    public function uri()
    {
        return parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
    }

    public function method()
    {
        return $_SERVER['REQUEST_METHOD'];
    }

    public function accept()
    {
        return $_SERVER['HTTP_ACCEPT'];
    }

    public function route()
    {
        return[
            $this->uri(),
            $this->method(),
        ];
    }
}