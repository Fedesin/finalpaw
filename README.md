## Instalación y ejecución local

# Clonar el repositorio
* git clone https://github.com/Fedesin/grupo3-PAW.git PAW

# Instalar dependencias
* cd PAW
* composer install

# Configurar variables
* cp .env.example .env
* nano .env

Instalar y habilitar las extensiones de pgsql para php y luego ejecutar los siguientes comandos:
* ./vendor/bin/phinx migrate [-e <environment>]
* php -S localhost:8080 -t public/

Finalmente ingresas a la dirección http://localhost:8080/ y ualá!


## *Integrantes*
 - Simone Federico
 - Torres Patricio
 
## *Demo*
 [Demo de prueba del sitio web](https://finalpaw.onrender.com/)

