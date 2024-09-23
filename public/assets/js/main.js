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
    Users.update({
        userid: user_id,
        rol_id: rol_id
    })
    .then(function(data) {
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
    Users.create({
        username: email,
        password: password,
        rol_id: rolId
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

function getRolById(rol_id)
{
    for(let i = 0; i < roles.length; i++) {
        if(parseInt(roles[i].id) == rol_id)
            return roles[i].nombre;
    };
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
        console.log(data);
        console.log(roles);
        
        // Crear un mapa de roles
        const rolesMap = roles.reduce((acc, rol) => {
            acc[rol.id] = rol.nombre;
            return acc;
        }, {});

        const tbody = document.querySelector('.tabla-body');
        tbody.innerHTML = ''; // Limpiar la tabla existente

        data.forEach(user => {
            const rolNombre = (rolesMap[user.rol_id] || 'Sin rol').charAt(0).toUpperCase() + (rolesMap[user.rol_id] || 'Sin rol').slice(1);

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.email}</td>
                <td class="no-padding">
                    <ul class="lista-horizontal">
                        <li>${rolNombre}</li> <!-- Mostrar el nombre del rol -->
                        <li>
                            <a href="#" 
                                class="modify modifyRoleButton"  
                                data-id="${user.id}" 
                                rol-nombre="${rolNombre}">
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

    registerButton.addEventListener('click', function() {
        var email = document.querySelector('.email-input').value;
        var rolId = document.querySelector('.rol-select').value;
        var randomPassword = generateRandomPassword(12);

        console.log('Email: ' + email);
        console.log('Rol ID: ' + rolId);
        console.log('Contraseña generada: ' + randomPassword);

        // Llamar a la función que hace el registro
        registerUser(email, rolId, randomPassword);
        
        // Vacio la lista
        tabla_usuarios.querySelectorAll('tr').forEach((tr) => {
            tr.remove();
        });

        // Devuelvo la lista actualizada y rearmo la tabla, hay que automagizarlo un poco, es demasiado manual
        Users.list().then(function(ret) {
            Object.keys(ret).forEach(key => {
                let tr = document.createElement('tr');
                let id = document.createElement('td');
                let email = document.createElement('td');
                let rol = document.createElement('td');
                let status = document.createElement('td');

                tr.appendChild(id);
                tr.appendChild(email);
                tr.appendChild(rol);
                tr.appendChild(status);

                id.textContent = key;
                email.textContent = ret[key].email;

                rol.classList.add('no-padding');
                let ul = document.createElement('ul');
                ul.classList.add('lista-horizontal');
                rol.appendChild(ul);
                let li = document.createElement('li');

                li.textContent = capitalizeFirstLetter(getRolById(ret[key].rol_id));
                ul.appendChild(li);

                li = document.createElement('li');
                ul.appendChild(li);

                let a = document.createElement('a');
                li.appendChild(a);

                a.href = "#";
                a.classList.add('modify');
                a.classList.add('modifyRoleButton');
                a.dataset.id = key;
                a.dataset.rolNombre = getRolById(ret[key].rol_id);

                let img = document.createElement('img');
                a.appendChild(img);

                ul = document.createElement('ul');
                ul.classList.add('lista-horizontal');
                status.appendChild(ul);
                li = document.createElement('li');
                ul.appendChild(li);

                a = document.createElement('a');
                li.appendChild(a);

                a.href = "#";
                a.classList.add('toggleStatusButton');
                a.classList.add(ret[key].deshabilitado ? 'up' : 'down');
                a.dataset.id = key;
                a.dataset.status = ret[key].deshabilitado;

                img = document.createElement('img');
                a.appendChild(img);

                tabla_usuarios.appendChild(tr);
            });

            agregarManejadoresDeEventos();
        });
    });
    
    getRoles();
});