// main.js
//variables globales
var roles = [];


var Users = {
    list: function(args) {
        return fetch("/api/users", {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        })
        .then(function(ret) {
            return ret.json();
        })
    },
    create: function(args) {
        return fetch("/api/users", {
            method: "POST",
            body: JSON.stringify(args),
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json; charset=UTF-8"
            }
        })
        .then(function(ret) {
            return ret.json();
        })
    },
    update: function(args) {
        return fetch("/api/users", {
            method: "PUT",
            body: JSON.stringify(args),
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json; charset=UTF-8"
            }
        })
        .then(function(ret) {
            return ret.json();
        })
    }
}


function toggleStatus(button, userId, newStatus) {
    Users.update({
        userid: userId,
        deshabilitado: newStatus
    })
    .then(function(ret) {
        if (newStatus === 0) {
            button.classList.remove('up');
            button.classList.add('down');
        } else {
            button.classList.remove('down');
            button.classList.add('up');
        }
        button.dataset.status = newStatus;
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
        return data;
    })
    .catch(function(error) {
        console.error("Error al obtener roles:", error);
        return [];
    });
}

function changeAnchorToOptions(button) {
    var parent = button.closest('ul').querySelector('li');
    var userId = button.getAttribute('data-id');
    var currentRoleName = button.getAttribute('rol-nombre');
    // Verificar si ya se ha cambiado a opciones
    if (parent.querySelector('select')) {
        // Si hay un select, significa que ya está en modo de cambio de rol, así que volvemos a la vista original
        parent.innerHTML = currentRoleName; // Restablece el contenido original
        return; // Sale de la función
    }
    // Obtener el rol actual
    var select = document.createElement('select');

    select.classList.add('capitalize');

    // Llenar el select con roles
    Object.keys(roles).forEach(key => {
        var option = document.createElement('option');

        option.value = key;
        option.textContent = roles[key];
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
    Users.update({
        userid: user_id,
        rol_id: rol_id
    })
    .then(function(data) {
        // Aquí actualizas el texto del rol en la vista
        var parent = document.querySelector(`[data-id='${user_id}']`).closest('ul').querySelector('li');

        parent.innerHTML = roles[rol_id];
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


function registerUser(email, rol_id, password) {
    Users.create({
        username: email,
        password: password,
        rol_id: rol_id
    })
    .then(data => {
        const errorContainer = document.querySelector('.login-error'); // El contenedor de errores o mensajes

        if (data.status === 'success') {
            errorContainer.innerHTML = `<p class="success-message">${data.message}</p>`;
        } else if (data.status === 'error') {
            errorContainer.innerHTML = `<p class="error-message">${data.message}</p>`;
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function changePassword(actualPassword, newPassword) {
    // Enviar solicitud al backend para cambiar la contraseña
    fetch('/api/change-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            actual_password: actualPassword,
            new_password: newPassword
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Contraseña cambiada exitosamente');
            // Limpia los campos si es necesario
            document.querySelector('.actual-password').value = '';
            document.querySelector('.new-password').value = '';
            document.querySelector('.repeat-password').value = '';
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error al cambiar la contraseña:', error);
    });
}

function filtrarUsuarios() {
    const filtro = document.querySelector('.filtro').value;

    fetch('/api/users/filterViaEmail', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: filtro })
    })
    .then(response => response.json())
    .then(data => {
        let tbody = document.querySelector('.tabla-usuarios > tbody');
        tbody.innerHTML = ''; // Limpiar la tabla existente

        Object.keys(data).forEach(key => {
            let user = data[key];
            let row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.email}</td>
                <td class="no-padding">
                    <ul class="lista-horizontal">
                        <li class="capitalize">${roles[user.rol_id]}</li> <!-- Mostrar el nombre del rol -->
                        <li>
                            <a href="#" 
                                class="modify modifyRoleButton"  
                                data-id="${user.id}" 
                                rol-nombre="${roles[user.rol_id]}">
                                <img/>
                            </a>
                        </li>
                    </ul>
                </td>
                <td>
                    <ul class="lista-horizontal">
                        <li>
                            <a href="#" 
                                class="toggleStatusButton ${user.deshabilitado ? 'up' : 'down'}"
                                data-id="${user.id}"
                                data-status="${user.deshabilitado}">
                                <img/>
                            </a>
                        </li>  
                    </ul>
                </td>
            `;

            tbody.appendChild(row);
        });

        // Volver a agregar manejadores de eventos
        agregarManejadoresDeEventos()
    })
    .catch(error => {
        console.error('Error al filtrar usuarios:', error);
    });
}

function agregarManejadoresDeEventos() {
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
}

// Asignar los eventos de clic a los botones
document.addEventListener('DOMContentLoaded', function() {
    agregarManejadoresDeEventos();

    // Evento para el botón de registrar
    var registerButton = document.querySelector('.btn-registrar');
    var tabla_usuarios = document.querySelector('.tabla-usuarios > tbody');

    // evento para el boton de cambiar de contraseña
    var changePasswordButton = document.querySelector('.change-password-button');
    if (registerButton){
        registerButton.addEventListener('click', function() {
            var email = document.querySelector('.email-input').value;
            var rolId = document.querySelector('.rol-select').value;
            var randomPassword = generateRandomPassword(12);
    
            console.log('Email: ' + email);
            console.log('Rol ID: ' + rolId);
            console.log('Contraseña generada: ' + randomPassword);
    
            // Llamar a la función que hace el registro
            registerUser(email, rolId, randomPassword);
    
            // Acá habría que agregar un spinner
    
            // Devuelvo la lista actualizada y rearmo la tabla, hay que automagizarlo un poco, es demasiado manual
            Users.list().then(function(ret) {
                tabla_usuarios.innerHTML = ''; // Limpiar la tabla existente
    
                Object.keys(ret).forEach(key => {
                    let user = ret[key];
                    let row = document.createElement('tr');
    
                    row.innerHTML = `
                        <td>${user.id}</td>
                        <td>${user.email}</td>
                        <td class="no-padding">
                            <ul class="lista-horizontal">
                                <li class="capitalize">${roles[user.rol_id]}</li> <!-- Mostrar el nombre del rol -->
                                <li>
                                    <a href="#" 
                                        class="modify modifyRoleButton"  
                                        data-id="${user.id}" 
                                        rol-nombre="${roles[user.rol_id]}">
                                        <img/>
                                    </a>
                                </li>
                            </ul>
                        </td>
                        <td>
                            <ul class="lista-horizontal">
                                <li>
                                    <a href="#" 
                                        class="toggleStatusButton ${user.deshabilitado ? 'up' : 'down'}"
                                        data-id="${user.id}"
                                        data-status="${user.deshabilitado}">
                                        <img/>
                                    </a>
                                </li>  
                            </ul>
                        </td>
                    `;
    
                    tabla_usuarios.appendChild(row);
                });
    
                agregarManejadoresDeEventos();
            });
        });
    }
    
    if (changePasswordButton) {
        changePasswordButton.addEventListener('click', function() {
            const actualPassword = document.querySelector('.actual-password').value;
            const newPassword = document.querySelector('.new-password').value;
            const repeatPassword = document.querySelector('.repeat-password').value;
            if (newPassword !== repeatPassword) {
                alert('Las contraseñas no coinciden.');
                return;
            }
        
            if (!actualPassword || !newPassword || !repeatPassword) {
                alert('Por favor, complete todos los campos.');
                return;
            }
    
            changePassword(actualPassword, newPassword);
        });    
    }
    
    getRoles().then(function(ret) {
        roles = ret;
    });
});