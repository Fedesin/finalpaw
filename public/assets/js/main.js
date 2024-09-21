// main.js
//variables globales
var roles = [];
function toggleStatus(button, userId, newStatus) {
    fetch("/api/users/status", {
        method: "POST",
        body: JSON.stringify({
            userid: userId,
            status: newStatus
        }),
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json; charset=UTF-8"
        }
    })
    .then(function(ret) {
        if (ret.status === 200) {
            if (newStatus === 0) {
                button.classList.remove('up');
                button.classList.add('down');
            } else {
                button.classList.remove('down');
                button.classList.add('up');
            }
            button.dataset.status = newStatus;
        }
    });
}




function getRoles() {
    return fetch('/api/roles', {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json; charset=UTF-8"
        }
    })
    .then(function(response) {
        if (response.ok) {
            return response.json();  // Asegúrate de convertir la respuesta a JSON
        } else {
            throw new Error('Error al obtener los roles');
        }
    })
    .then(function(data) {
        // La respuesta es un objeto con las claves como IDs y nombres como valores
        roles = Object.keys(data).map(function(key) {
            return { id: key, nombre: data[key] };  // Transformar a un formato más adecuado
        });
        console.log("Roles cargados:", roles);
        return roles;
    })
    .catch(function(error) {
        console.error("Error al obtener roles:", error);
        return [];
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function changeAnchorToOptions(button) {
    var parent = button.closest('ul').querySelector('li');
    var userId = button.getAttribute('data-id');
    var currentRoleName = button.getAttribute('rol-nombre');
    // Verificar si ya se ha cambiado a opciones
    if (parent.querySelector('select')) {
        // Si hay un select, significa que ya está en modo de cambio de rol, así que volvemos a la vista original
        parent.innerHTML = capitalizeFirstLetter(currentRoleName); // Restablece el contenido original
        return; // Sale de la función
    }
    // Obtener el rol actual
    var select = document.createElement('select');

    // Llenar el select con roles
    roles.forEach(function(role) {
        var option = document.createElement('option');
        option.value = role.id;
        option.textContent = role.nombre;
        select.appendChild(option);
    });

    // Crear el botón para cambiar el rol
    var changeButton = document.createElement('button');
    changeButton.textContent = 'Cambiar Rol';
    changeButton.classList.add('changeRolePressed');

    // Obtener el ID del usuario desde el botón
    var userId = button.getAttribute('data-id');

    // Asignar el evento de clic al botón
    changeButton.addEventListener('click', function() {
        var selectedRoleId = select.value;
        changeRole(selectedRoleId, userId); // Asegúrate de que userId se esté pasando correctamente
    });

    // Reemplazar el contenido del <li>
    parent.innerHTML = ''; // Limpiar el contenido actual
    parent.appendChild(select);
    parent.appendChild(changeButton);
}

function changeRole(rol_id, user_id) {
    fetch("/api/users/change-role", {
        method: "POST",
        body: JSON.stringify({
            user_id: user_id,
            rol_id: rol_id
        }),
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json; charset=UTF-8"
        }
    })
    .then(function(ret) {
        if (ret.status === 200) {
            return ret.json();
        }
    }).then(function(data) {
        // Aquí actualizas el texto del rol en la vista
        var parent = document.querySelector(`[data-id='${user_id}']`).closest('ul').querySelector('li');
        roles.filter(function(role) {
            if (role.id === rol_id) {
                parent.innerHTML = capitalizeFirstLetter(role.nombre);
            }
        });
    })
    .catch(function(error) {
        console.error(error);
    });
}

function generateRandomPassword(length) {
    var charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var password = "";
    for (var i = 0; i < length; i++) {
        var randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
}

function registerUser(email, rolId, password) {
    fetch("/register", {
        method: "POST",
        body: JSON.stringify({
            username: email,
            rol_id: rolId,
            password: password
        }),
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json; charset=UTF-8"
        }
    })
    .then(function(ret) {
        console.log('Response:', ret);
        return ret.text().then(text => {
            console.log('Response Text:', text);
            try {
                const json = JSON.parse(text);
                if (!ret.ok) {
                    document.querySelector('.login-error').innerText = json.message || 'Error desconocido';
                    throw new Error(json.message);
                }
                document.querySelector('.login-error').innerText = 'Usuario registrado correctamente';
            } catch (error) {
                document.querySelector('.login-error').innerText = 'Error de formato en la respuesta.';
            }
        });
    })
}

// Asignar los eventos de clic a los botones
document.addEventListener('DOMContentLoaded', function() {
    // Evento para el boton de habilitar o desahabilitar un usuario
    var buttons = document.querySelectorAll('.toggleStatusButton');
    
    buttons.forEach(function(button) {
        button.addEventListener('click', function() {
            var userId = parseInt(this.getAttribute('data-id'));
            var newStatus = parseInt(this.getAttribute('data-status'));
            
            toggleStatus(button, userId, 1 - newStatus);

        });
    });

    // Evento para el botón de cambiar rol
    var buttons = document.querySelectorAll('.modifyRoleButton');
    
    buttons.forEach(function(button) {
        button.addEventListener('click', function() {
            changeAnchorToOptions(button);
        });
    });

    // Evento para el botón de registrar
    var registerButton = document.querySelector('.btn-registrar');
    registerButton.addEventListener('click', function() {
        var email = document.querySelector('.email-input').value;
        var rolId = document.querySelector('.rol-select').value;
        var randomPassword = generateRandomPassword(8);

        console.log('Email: ' + email);
        console.log('Rol ID: ' + rolId);
        console.log('Contraseña generada: ' + randomPassword);

        // Llamar a la función que hace el registro
        registerUser(email, rolId, randomPassword);
        
    });
    

    getRoles();
});