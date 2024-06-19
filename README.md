## Instalación y ejecución local

# Clonar el repositorio
* git clone https://github.com/Fedesin/finalpaw

# Instalar dependencias
* cd finalpaw
* composer install

# Crear una base de datos

# Configurar variables
* cp .env.example .env
* nano .env

# Ejecución local
Instalar y habilitar las extensiones de pgsql para php y luego ejecutar los siguientes comandos:
* ./vendor/bin/phinx migrate [-e \<environment\>]
* php -S localhost:8080 -t public/

Finalmente ingresas a la dirección http://localhost:8080/ y ualá!


## *Integrantes*
 - Simone Federico
 - Torres Patricio
 
## *Demo*
 [Demo de prueba del sitio web](https://finalpaw.onrender.com/)

