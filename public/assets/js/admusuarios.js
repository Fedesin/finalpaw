//variables globales
var roles = [];

let currentPage = 0;
let itemsPerPage = 10;
var total_pages = 0;
var spinner = null;
var tabla_usuarios = null;

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

function cargarPagina(pagina, force = false) {
    if((pagina == currentPage) && (force === false))
        return;

    currentPage = pagina;

    let filtro = document.querySelector('#filtro').value;
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
        let overlay = tabla_usuarios.parentElement.querySelector('.overlay');

        if(overlay)
            overlay.remove();
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
        let parent = button.parentNode;

        parent.textContent = newStatus ? 'deshabilitado' : 'habilitado';
        parent.appendChild(button);
    });
}

function changeAnchorToOptions(button) {
    var parent = button.closest('td')
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
    changeButton.classList.add('btn');
    changeButton.addEventListener('click', function() {
        var selectedRoleId = select.value;
        changeRole(parent, selectedRoleId, userId);
    });
    parent.innerHTML = ''; 
    parent.appendChild(select);
    parent.appendChild(changeButton);
}

function changeRole(td, rol_id, user_id) {
    Users.update({
        userid: user_id,
        rol_id: rol_id
    })
    .then(function(data) {
        td.innerHTML = `<p class="capitalize">${roles[rol_id]}
                    <a href="#" 
                        class="modify modifyRoleButton btn-editarver"  
                        data-id="${user_id}">
                    </a>
                </p>`;
    })
    .catch(function(error) {
        console.error(error);
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
                <p class="capitalize">${roles[user.rol_id]}
                    <a href="#"
                        title="Modificar rol"
                        class="modify modifyRoleButton btn-editarver"  
                        data-id="${user.id}">
                    </a>
                </p>
            </td>
            <td data-label="Estado" class="capitalize">
                ${user.deshabilitado ? 'deshabilitado' : 'habilitado'}
                <a href="#"
                    title="Cambiar estado habilitado/deshabilitado"
                    class="toggleStatusButton btn-editarflecha ${user.deshabilitado ? 'up' : 'down'}"
                    data-id="${user.id}"
                    data-status="${user.deshabilitado}">
                </a>
            </td>
        `;
        tabla_usuarios.appendChild(row);
    });

    agregarManejadoresDeEventos();
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
    let searchTimer = null;

    
    document.querySelector('#filtro').addEventListener('keyup', function(e) {
        if(searchTimer)
            clearTimeout(searchTimer);

        searchTimer = setTimeout(function() {
            cargarPagina(1, true);
            searchTimer = null;
        }, 800);
    });

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
            let email = document.querySelector('.email-input').value;
            let rolId = document.querySelector('.rol-select').value;
            let messageElement = document.querySelector('.status-message');

            messageElement.textContent = '';
            messageElement.classList.remove('success-message');
            messageElement.classList.add('error-message');

            if(!validateEmail(email)) {
                messageElement.textContent = 'El campo email debe ser un mail válido';
            } else if(rolId == 0) {
                messageElement.textContent = 'Debe seleccionar un rol';
            } else {
                enviarCorreoVerificacion(email, rolId);
            }
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
    })
    .then(function() {
        cargarPagina(1);
    });
});

function enviarCorreoVerificacion(email, rol_id) {
    const token = btoa(JSON.stringify({ email, rol_id, timestamp: Math.floor(Date.now() / 1000) }));
    const domainWithPort = `${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}`;
    const isLocalhost = window.location.hostname === 'localhost';
    const protocol = isLocalhost ? 'http' : 'https';
    const verificationLink = `${protocol}://${domainWithPort}/verify?token=${token}`;

    const params = {
        to_email: email,
        verification_link: verificationLink,
    };

    let messageElement = document.querySelector('.status-message');
    messageElement.classList.remove('success-message', 'error-message');

    emailjs.send('service_ixstcji', 'template_uyoal4l', params)
        .then(response => {
            console.log('Correo enviado:', response.status, response.text);
            messageElement.classList.add('success-message');
            messageElement.textContent = 'Correo de verificación enviado';
        })
        .catch(error => {
            console.error('Error al enviar correo:', error);
            messageElement.classList.add('error-message');
            messageElement.textContent = 'Ocurrió un error al enviar el correo';
        });
}

