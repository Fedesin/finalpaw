// main.js
//variables globales
var roles = [];

var Users = {
    list: function(args) {
        params = new URLSearchParams(args);

        return fetch("/api/users" + params.size ? ('?' + params.toString()) : '', {
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

var Fases = {
    list: function(args) {
        params = new URLSearchParams(args);

        return fetch("/api/fases" + (params.size ? ('?' + params.toString()) : ''), {
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
        return fetch("/api/fases", {
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
        return fetch("/api/fases", {
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
        parent.innerHTML = currentRoleName; // Restablece el contenido original
        return;
    }
    var select = document.createElement('select');
    select.classList.add('capitalize');
    Object.keys(roles).forEach(key => {
        var option = document.createElement('option');
        option.value = key;
        option.textContent = roles[key];
        select.appendChild(option);
    });
    var changeButton = document.createElement('button');
    changeButton.textContent = 'Cambiar Rol';
    changeButton.classList.add('changeRolePressed');
    changeButton.addEventListener('click', function() {
        var selectedRoleId = select.value;
        changeRole(selectedRoleId, userId);
    });
    parent.innerHTML = ''; 
    parent.appendChild(select);
    parent.appendChild(changeButton);
}

function changeRole(rol_id, user_id) {
    Users.update({
        userid: user_id,
        rol_id: rol_id
    })
    .then(function(data) {
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
        const errorContainer = document.querySelector('.login-error');
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
        const messageElement = document.getElementById('message');
        if (data.success) {
            messageElement.textContent = 'Contraseña cambiada con éxito.';
        } else {
            messageElement.textContent = data.message;
        }
        messageElement.classList.remove('hidden');
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
        tbody.innerHTML = ''; 
        Object.keys(data).forEach(key => {
            let user = data[key];
            let row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.email}</td>
                <td class="no-padding">
                    <ul class="lista-horizontal">
                        <li class="capitalize">${roles[user.rol_id]}</li>
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
        agregarManejadoresDeEventos();
    })
    .catch(error => {
        console.error('Error al filtrar usuarios:', error);
    });
}

function agregarManejadoresDeEventos() {
     var buttons = document.querySelectorAll('.toggleStatusButton');
     buttons.forEach(function(button) {
         button.addEventListener('click', function() {
             var userId = parseInt(this.getAttribute('data-id'));
             var newStatus = parseInt(this.getAttribute('data-status'));
             toggleStatus(button, userId, 1 - newStatus);
         });
     });
     var buttons = document.querySelectorAll('.modifyRoleButton');
     buttons.forEach(function(button) {
         button.addEventListener('click', function() {
             changeAnchorToOptions(button);
         });
     });
}

document.addEventListener('DOMContentLoaded', function() {
    agregarManejadoresDeEventos();

    var registerButton = document.querySelector('.btn-registrar');
    var tabla_usuarios = document.querySelector('.tabla-usuarios > tbody');
    var changePasswordButton = document.querySelector('.change-password-button');

    if (registerButton){
        registerButton.addEventListener('click', function() {
            var email = document.querySelector('.email-input').value;
            var rolId = document.querySelector('.rol-select').value;
            var randomPassword = generateRandomPassword(12);
            registerUser(email, rolId, randomPassword);
            Users.list().then(function(ret) {
                tabla_usuarios.innerHTML = ''; 
                Object.keys(ret).forEach(key => {
                    let user = ret[key];
                    let row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${user.id}</td>
                        <td>${user.email}</td>
                        <td class="no-padding">
                            <ul class="lista-horizontal">
                                <li class="capitalize">${roles[user.rol_id]}</li>
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
                const messageElement = document.getElementById('message');
                messageElement.textContent = 'Las contraseñas no coinciden.';
                messageElement.classList.remove('hidden'); 
                return;
            }
            if (!actualPassword || !newPassword || !repeatPassword) {
                const messageElement = document.getElementById('message');
                messageElement.textContent = 'Por favor, complete todos los campos.';
                messageElement.classList.remove('hidden'); 
                return;
            }
            changePassword(actualPassword, newPassword);
        });    
    }
    
    var selectTipo_producto_id = document.querySelector('#tipo_producto_id');
    selectTipo_producto_id.addEventListener('change', function() {
        var tipo_producto_id = document.querySelector('#tipo_producto_id').value;
        document.querySelector('.tabla-fases').classList.remove('hidden');
        document.querySelector('#fase-nombre').classList.remove('hidden');
        document.querySelector('.btn-agregar-fase').classList.remove('hidden');
        document.querySelector('#formularioFases').style.display = 'grid';

        Fases.list({
            "tipo_producto_id": tipo_producto_id
        })
        .then(function(ret) {
            var tabla_fases = document.querySelector('.tabla-fases > tbody');
            var listaFase = document.getElementById('lista_fase');
            tabla_fases.innerHTML = '';
            listaFase.innerHTML = '';
            Object.values(ret.data).forEach(fase => {
                let row = document.createElement('tr');
                row.innerHTML = `
                    <td>${fase.nombre}</td>
                    <td>
                        <button class="btn-editar" data-id="${fase.id}">✏️</button>
                        <button class="btn-borrar" data-id="${fase.id}">❌</button>
                    </td>
                `;
                tabla_fases.appendChild(row);
                let option = document.createElement('option');
                option.value = fase.id;
                option.textContent = fase.nombre;
                listaFase.appendChild(option);
            });
            agregarEventosAcciones();
        });
    });

    var addFasesButton = document.querySelector('.btn-agregar-fase');
    addFasesButton.addEventListener('click', function() {
        var fase_nombre = document.querySelector('#fase-nombre').value;
        var tipo_producto_id = document.querySelector('#tipo_producto_id').value;
        Fases.create({
            fase_nombre: fase_nombre,
            tipo_producto_id: tipo_producto_id
        }).then(function(ret) {
            console.log(ret.data);
        });
    });

    getRoles().then(function(ret) {
        roles = ret;
    });
});

function agregarEventosAcciones() {
    document.querySelectorAll('.btn-editar').forEach(button => {
        button.addEventListener('click', function() {
            var faseId = this.getAttribute('data-id');
            console.log("Editar fase con ID:", faseId);
        });
    });
    document.querySelectorAll('.btn-borrar').forEach(button => {
        button.addEventListener('click', function() {
            var faseId = this.getAttribute('data-id');
            console.log("Borrar fase con ID:", faseId);
        });
    });
}
