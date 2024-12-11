//variables globales
var roles = [];

let currentPage = 0;
let itemsPerPage = 10;
var total_pages = 0;
var spinner = null;
var tabla_usuarios = null;

function cargarPagina(pagina, force = false) {
    if((pagina == currentPage) && (force === false))
        return;

    currentPage = pagina;

    let filtro = document.querySelector('.filtro').value;
    tabla_usuarios.parentElement.appendChild(spinner);

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
        actualizarPaginacion(pagina, Math.ceil(data.total / itemsPerPage));
    })
    .catch(error => {
        console.error('Error al cargar pagina:', filtro, pagina, error);
    })
    .finally(() => {
        tabla_usuarios.parentElement.querySelector('.overlay').remove();
    });
}

// Función para actualizar los botones de paginación (habilitar/deshabilitar botones)
function actualizarPaginacion(curPage, totalPages) {
    const pageNumbersContainer = document.querySelector('.paginator .page-numbers');

    total_pages = totalPages;

    // Limpiar los números de página anteriores
    pageNumbersContainer.innerHTML = '';

    // Generar números de página dinámicamente
    for (let i = Math.max(1, curPage - 3); i <= Math.min(curPage + 3, totalPages); i++) {
        let pageButton = document.createElement('li');

        pageButton.classList.add('button');
        pageButton.classList.add('btn');
        pageButton.textContent = i;
        pageButton.dataset.page = i;

        // Marcar el número de página actual
        if (i === curPage)
            pageButton.classList.add('pag-current');

        // Agregar evento de clic para cambiar de página
        pageButton.addEventListener('click', function() {
            cargarPagina(i);
        });

        pageNumbersContainer.appendChild(pageButton);
    }
}

document.querySelectorAll('.paginator .button').forEach(button => {
    button.addEventListener('click', function() {
        let pag = currentPage;

        if(this.dataset.page === 'first') {
            pag = 1;
        } else if(this.dataset.page === 'last') {
            pag = total_pages;
        } else if (this.dataset.page === 'prev' && pag > 1) {
            pag--;
        } else if (this.dataset.page === 'next' && pag < total_pages) {
            pag++;
        }

        cargarPagina(pag);
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

function sendMailPasswordChange(actualPassword, newPassword) {
    const token = btoa(JSON.stringify({ actual_password: actualPassword, new_password: newPassword, email: userEmail, timestamp: Date.now() }));
    const domainWithPort = `${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}`;
    const isLocalhost = window.location.hostname === 'localhost';
    const protocol = isLocalhost ? 'http' : 'https';
    const verificationLink = `${protocol}://${domainWithPort}/api/verify-password-change?token=${token}`;


    const params = {
        to_email: userEmail,
        verification_link: verificationLink,
    };

    emailjs.send('service_ixstcji', 'template_e3i7gwm', params) // Cambia `template_password_change` al ID de tu plantilla en EmailJS
        .then(response => {
            console.log('Correo enviado:', response.status, response.text);
            const messageElement = document.getElementById('message');
            messageElement.textContent = 'Correo de verificación enviado. Revisa tu bandeja de entrada.';
            messageElement.classList.remove('hidden');
        })
        .catch(error => {
            console.error('Error al enviar correo:', error);
            const messageElement = document.getElementById('message');
            messageElement.textContent = 'Error al enviar el correo de verificación.';
            messageElement.classList.remove('hidden');
        });
}

function listarUsuarios(usuarios, cantUsers) {
    tabla_usuarios.innerHTML = ''; 
    Object.keys(usuarios).forEach(key => {
        let user = usuarios[key];
        let row = document.createElement('tr');
        row.innerHTML = `
            <td data-label="ID">${user.id}</td>
            <td data-label="Email">${user.email}</td>
            <td data-label="Rol" class="no-padding">
                <ul class="lista-horizontal">
                    <li class="capitalize">${roles[user.rol_id]}</li>
                    <li>
                        <a href="#" 
                            class="modify modifyRoleButton btn-editarver"  
                            data-id="${user.id}" 
                            rol-nombre="${roles[user.rol_id]}">
                            <img/>
                        </a>
                    </li>
                </ul>
            </td>
            <td data-label="Estado">
                <ul class="lista-horizontal">
                    <li>
                        <a href="#" 
                            class="toggleStatusButton btn-editarflecha ${user.deshabilitado ? 'up' : 'down'}"
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
    tabla_usuarios = document.querySelector('.tabla-usuarios > tbody');

    spinner = document.createElement('div');
    spinner.classList.add('overlay');

    let loader = document.createElement('div');
    loader.classList.add('loader');

    spinner.appendChild(loader);

    agregarManejadoresDeEventos();
    
    var registerButton = document.querySelector('.btn-registrar');
    var changePasswordButton = document.querySelector('.change-password-button');

    if (registerButton) {
        registerButton.addEventListener('click', function() {
            var email = document.querySelector('.email-input').value;
            var rolId = document.querySelector('.rol-select').value;
            //aca tengo que llamar a la funcion enviar mail
            //luego tengo que registrar al usuario cuando este confirma el mail

            enviarCorreoVerificacion(email, rolId);
            //registerUser(email, rolId, generateRandomPassword(12));
            //cargarPagina(currentPage, true);
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
            sendMailPasswordChange(actualPassword, newPassword);
        });    
    }

    Roles.list().then(function(ret) {
        roles = ret;
    });

    cargarPagina(1);
});

function enviarCorreoVerificacion(email, rol_id) {
    const token = btoa(JSON.stringify({ email, rol_id, timestamp: Date.now() }));
    const domainWithPort = `${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}`;
    const isLocalhost = window.location.hostname === 'localhost';
    const protocol = isLocalhost ? 'http' : 'https';
    const verificationLink = `${protocol}://${domainWithPort}/api/verify?token=${token}`;

    const params = {
        to_email: email,
        verification_link: verificationLink,
    };

    emailjs.send('service_ixstcji', 'template_uyoal4l', params)
        .then(response => {
            console.log('Correo enviado:', response.status, response.text);
            document.querySelector('.login-error').innerHTML = `<p class="success-message">Correo de verificación enviado.</p>`;
        })
        .catch(error => {
            console.error('Error al enviar correo:', error);
            document.querySelector('.login-error').innerHTML = `<p class="error-message">Error al enviar el correo.</p>`;
        });
}

emailjs.init('P2ymE0jXezSM_YMnM');