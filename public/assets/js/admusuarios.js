//variables globales
var roles = [];

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

function changeAnchorToOptions(button) {
    var parent = button.closest('ul').querySelector('li');
    var userId = button.getAttribute('data-id');
    var currentRoleName = button.getAttribute('rol-nombre');
    if (parent.querySelector('select')) {
        parent.innerHTML = currentRoleName; 
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

    if (registerButton) {
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

    Roles.list().then(function(ret) {
        roles = ret;
    });
});