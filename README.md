# Sistema de gestion de produccion para la Planta piloto de la UNLu

Este proyecto es el trabajo final para la materia de **Programación en Ambiente Web (PAW)** de la Universidad Nacional de Luján. Desarrollamos un sistema que permite llevar el control de la producción de productos, como los quesos elaborados en la planta piloto de la universidad. 


## 🚀 Instalación y ejecución local

# Clonar el repositorio
* git clone https://github.com/Fedesin/finalpaw

# Instalar dependencias
* cd finalpaw
* composer install

# Crear una base de datos

# Configurar variables
* cp .env.example .env
* nano .env

# Ejecución local 🖥️
Instalar y habilitar las extensiones de pgsql para php y luego ejecutar los siguientes comandos:
* ./vendor/bin/phinx migrate [-e \<environment\>]
* php -S localhost:8080 -t public/

Finalmente ingresas a la dirección http://localhost:8080/ y ualá! 🎉


## 👥 *Integrantes*
 - Simone Federico
 - Torres Patricio
 
## 🌐 *Demo*
 [Demo de prueba del sitio web](https://finalpaw.onrender.com/)

