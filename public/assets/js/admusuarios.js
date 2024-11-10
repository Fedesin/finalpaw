//variables globales
var roles = [];

let currentPage = 1;
let itemsPerPage = 5;
var totalPages = 0;

function cargarPagina(pagina) {
    const filtro = document.querySelector('.filtro').value;

    Users.list(
        Object.assign(
            {},
            {'email': filtro},
            {
                'limit': itemsPerPage,
                'offset': (pagina - 1) * itemsPerPage
            }
        )
    )
    .then(data => {
        listarUsuarios(data.usuarios, data.total);
        actualizarPaginacion(currentPage, Math.ceil(data.total / itemsPerPage));
    })
    .catch(error => {
        console.error('Error al cargar pagina:', filtro, pagina, error);
    });
}

// Función para actualizar los botones de paginación (habilitar/deshabilitar botones)
function actualizarPaginacion(curPage, totalPages) {
    const pageNumbersContainer = document.querySelector('.paginator .page-numbers');

    // Limpiar los números de página anteriores
    pageNumbersContainer.innerHTML = '';

    // Generar números de página dinámicamente
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('li');
        pageButton.classList.add('button');
        pageButton.textContent = i;
        pageButton.dataset.page = i;

        // Marcar el número de página actual
        if (i === curPage) {
            console.log(i, curPage);
            pageButton.classList.add('pag-current');
        }

        // Agregar evento de clic para cambiar de página
        pageButton.addEventListener('click', function() {
            currentPage = i;  // Cambiar a la página seleccionada
            cargarPagina(i);
        });

        pageNumbersContainer.appendChild(pageButton);
    }
}

document.querySelectorAll('.paginator .button').forEach(button => {
    button.addEventListener('click', function() {
        if (this.dataset.page === 'prev' && currentPage > 1) {
            currentPage--;  // Decrementar la página si es "anterior"
        } else if (this.dataset.page === 'next') {
            currentPage++;  // Incrementar la página si es "siguiente"
        }

        cargarPagina(currentPage);
    });
});

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

function listarUsuarios(usuarios, cantUsers) {
    let tbody = document.querySelector('.tabla-usuarios > tbody');
    tbody.innerHTML = ''; 
    Object.keys(usuarios).forEach(key => {
        let user = usuarios[key];
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
}

function filtrarUsuarios() {
    const filtro = document.querySelector('.filtro').value;

    cargarPagina(1);
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
    
    totalPages = Math.ceil(document.querySelector('.tabla-usuarios').dataset.cantUsers / itemsPerPage);

    if (registerButton) {
        registerButton.addEventListener('click', function() {
            var email = document.querySelector('.email-input').value;
            var rolId = document.querySelector('.rol-select').value;
            var randomPassword = generateRandomPassword(12);
            registerUser(email, rolId, randomPassword);
            
            cargarPagina(currentPage);
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

    cargarPagina(1);
});