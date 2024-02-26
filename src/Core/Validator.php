<?php

namespace Paw\Core;

class Validator 
{

    private static function get_mime_type($file)
    {
        $mtype = false;

        if (function_exists('finfo_open')) {
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mtype = finfo_file($finfo, $file);
            finfo_close($finfo);
        } elseif (function_exists('mime_content_type')) {
            $mtype = mime_content_type($file);
        }

        return $mtype;
    }

    public static function validar_nombre_apellido($nombreApellido)
    {
        $errors = [];

        $eles = explode(" ", $nombreApellido);
        if(count($eles) < 2) {
            $errors[] = "Debe haber al menos un nombre y un apellido";
        }

        return $errors;
    }

    public static function validar_dni($dni)
    {
        $errors = [];
        if(!is_numeric($dni)) {
            $errors[] = "El DNI sólo puede contener números";
        }

        if(strlen($dni) != 8) {
            $errors[] = "El DNI debe tener 8 caracteres";
        }

        return $errors;
    }

    public static function validar_telefono($tel)
    {
        $errors = [];
        if(!is_numeric($tel)) {
            $errors[] = "El número de teléfono sólo puede contener números";
        }

        return $errors;
    }

    public static function validar_fecha($fecha, $notBefore = false, $notAfter = false)
    {
        $errors = [];

        $regex = '/^\d{4}-\d{2}-\d{2}$/';
        if (!preg_match($regex, $fecha)) {
            $errors[] = 'Formato de fecha inválido';
        } else {
            $valores = explode('-', $fecha);
            if (!checkdate($valores[1], $valores[2], $valores[0]))
                $errors[] = 'Fecha inválida';

            if($notBefore) {
                $date = strtotime(date('Y-m-d', strtotime($fecha)));
                $currentDate = strtotime(date('Y-m-d'));

                if($date < $currentDate)
                    $errors[] = 'La fecha ingresada debe ser posterior a la fecha actual';
            }

            if($notAfter) {
                $date = strtotime(date('Y-m-d', strtotime($fecha)));
                $currentDate = strtotime(date('Y-m-d'));

                if($date > $currentDate)
                    $errors[] = 'La fecha ingresada debe ser previa a la fecha actual';
            }
        }

        return $errors;
    }

    public static function validar_hora($hora)
    {
        $errors = [];

        $pattern = "/^([0-1][0-9]|2[0-3])\:([0-5][0-9])$/";
        if(!preg_match($pattern, $hora))
            $errors[] = "Hora inválida";

        return $errors;
    }

    public static function validar_email($email)
    {
        $errors = [];

        if (!filter_var($email, FILTER_VALIDATE_EMAIL))
            $errors[] = 'E-mail inválido';

        return $errors;
    }

    public static function validar_imagen($file)
    {
        $errors = [];
        $allowed_image_extension = array(
            "png",
            "jpg",
            "jpeg",
            "pdf"
        );
        
        $file_extension = pathinfo($file["name"], PATHINFO_EXTENSION);

        if (!in_array($file_extension, $allowed_image_extension))
            $errors[] = 'Formato no soportado, la imagen sólo puede ser '.implode(", ", $allowed_image_extension);

        $allowed_mime_types = array(
            "image/png",
            "image/jpeg",
            "application/pdf",
            "application/x-bzpdf",
            "application/x-gzpdf"
        );
        
        $mime_type = Validator::get_mime_type($file['tmp_name']);

        if (!in_array($mime_type, $allowed_mime_types))
            $errors[] = 'Formato no soportado, la imagen sólo puede ser '.implode(", ", $allowed_image_extension);

        return $errors;
    }

    public static function remover_specialchar($data)
    {
        $escapedData = array();
        foreach ($data as $key => $value) {
            $escapedData[$key] = trim(filter_var($value, FILTER_SANITIZE_SPECIAL_CHARS));
        }
        
        return $escapedData;
    }

    public static function limpiar_espacios($data)
    {
        $eles = explode(" ", trim($data));
        $ret = "";
        foreach($eles as $ele)
            if(strlen($ele) > 0)
                $ret .= " " . $ele;

        return ltrim($ret);
    }
}