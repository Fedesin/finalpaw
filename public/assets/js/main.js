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
    },
    delete: function(args) {
        return fetch("/api/fases", {
            method: "DELETE",
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
    getAttributes: function(args) {
        params = new URLSearchParams(args);

        return fetch("/api/fases/atributos" + (params.size ? ('?' + params.toString()) : ''), {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        })
        .then(function(ret) {
            return ret.json();
        });
    },
    deleteCampo: function(args) {
        return fetch("/api/fases/deleteCampo", {
            method: "DELETE",
            body: JSON.stringify(args),
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json; charset=UTF-8"
            }
        })
        .then(function(ret) {
            return ret.json();
        });
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
        //document.querySelector('#formularioFases').style.display = 'grid';

        Fases.list({
            "tipo_producto_id": tipo_producto_id
        })
        .then(function(ret) {
            var tabla_fases = document.querySelector('.tabla-fases > tbody');
            tabla_fases.innerHTML = '';
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
                //listaFase.appendChild(option);
            });
            agregarEventosAcciones();
        });
    });

    var addFasesButton = document.querySelector('.btn-agregar-fase');
    addFasesButton.addEventListener('click', function() {
        var fase_nombre = document.querySelector('#fase-nombre').value;
        var tipo_producto_id = document.querySelector('#tipo_producto_id').value;
        var numero_orden_element = document.querySelector('#numero_orden');
        var numero_orden = (numero_orden_element && numero_orden_element.value) ? numero_orden_element.value : 1; // Asignar 1 por defecto si no existe

        Fases.create({
            fase_nombre: fase_nombre,
            tipo_producto_id: tipo_producto_id,
            numero_orden: numero_orden // Enviar el número de orden
        }).then(function(ret) {
            console.log(ret.data);
            refrescarTablaFases(); // Refrescar la tabla automáticamente
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
            var faseRow = this.closest('tr');

            // Verificar si ya existe un campo de edición en la fila
            if (!faseRow.querySelector('.input-editar')) {
                // Obtener los atributos (campos) de la fase desde el servidor
                Fases.getAttributes({
                    fase_id: faseId
                }).then(function(ret) {
                    let atributos = ret.atributos || {}; // Asignar un objeto vacío si no hay atributos
                    
                    // Crear los labels
                    let labelNuevoCampo = document.createElement('label');
                    labelNuevoCampo.textContent = 'Rellene para agregar un campo nuevo:';
                    labelNuevoCampo.classList.add('label-campo');

                    let labelNumeroOrdenCampo = document.createElement('label');
                    labelNumeroOrdenCampo.textContent = 'Número de orden del campo:';
                    labelNumeroOrdenCampo.classList.add('label-campo');

                    let labelTipoCampo = document.createElement('label');
                    labelTipoCampo.textContent = 'Tipo de dato del campo:';
                    labelTipoCampo.classList.add('label-campo');

                    let labelNumeroOrdenFase = document.createElement('label');
                    labelNumeroOrdenFase.textContent = 'Número de orden de la fase:';
                    labelNumeroOrdenFase.classList.add('label-campo');

                    // Crear un nuevo input para agregar un atributo
                    let input = document.createElement('input');
                    input.type = 'text';
                    input.classList.add('input-editar');
                    input.placeholder = 'Nuevo campo (nombre)';

                    // Select para el tipo de campo
                    let tipoCampoSelect = document.createElement('select'); 
                    tipoCampoSelect.classList.add('input-tipo-campo');
                    ["entero", "string", "float", "boolean"].forEach(tipo => {
                        let option = document.createElement('option');
                        option.value = tipo;
                        option.textContent = tipo.charAt(0).toUpperCase() + tipo.slice(1);
                        tipoCampoSelect.appendChild(option);
                    });

                    let ordenCampoInput = document.createElement('input'); // Input para modificar el número de orden del campo
                    ordenCampoInput.type = 'number';
                    ordenCampoInput.value = 1; // Valor por defecto del número de orden del campo
                    ordenCampoInput.classList.add('input-orden');

                    let ordenFaseInput = document.createElement('input'); // Input para modificar el número de orden de la fase
                    ordenFaseInput.type = 'number';
                    ordenFaseInput.value = ret.numero_orden || 1; // El número de orden actual de la fase
                    ordenFaseInput.classList.add('input-orden-fase');

                    let okButton = document.createElement('button');
                    okButton.textContent = 'Confirmar cambios';
                    okButton.classList.add('btn-ok');

                    // Agregar un salto de línea después del botón de confirmar
                    let lineBreak = document.createElement('br');
                    
                    // Crear un contenedor para listar los campos ya existentes
                    let labelCamposActuales = document.createElement('label');
                    labelCamposActuales.textContent = 'Campos actuales:';
                    labelCamposActuales.classList.add('label-campo');

                    let camposContainer = document.createElement('div');
                    camposContainer.classList.add('campos-container');

                    // Si atributos no está vacío, mostrar los campos existentes
                    if (Object.keys(atributos).length > 0) {
                        Object.keys(atributos).forEach(function(campo) {
                            let campoRow = document.createElement('div');
                            campoRow.classList.add('campo-row');

                            let campoLabel = document.createElement('span');
                            campoLabel.textContent = campo;

                            let deleteButton = document.createElement('button');
                            deleteButton.textContent = '❌';
                            deleteButton.classList.add('btn-delete-campo');

                            deleteButton.addEventListener('click', function() {
                                Fases.deleteCampo({
                                    fase_id: faseId,
                                    campo: campo
                                }).then(function(ret) {
                                    if (ret.success) {
                                        campoRow.remove();
                                        console.log('Campo eliminado correctamente');
                                    } else {
                                        console.error('Error al eliminar campo:', ret.message);
                                    }
                                });
                            });

                            campoRow.appendChild(campoLabel);
                            campoRow.appendChild(deleteButton);
                            camposContainer.appendChild(campoRow);
                        });
                    } else {
                        console.log("No hay atributos existentes para esta fase.");
                    }

                    // Añadir los elementos a la fila
                    let newRow = document.createElement('tr');
                    let newCell = document.createElement('td');
                    newCell.colSpan = 2; 

                    // Elementos para editar la fase (número de orden de fase)
                    newCell.appendChild(labelNumeroOrdenFase); // Label para número de orden de la fase
                    newCell.appendChild(ordenFaseInput); // Input para número de orden de la fase

                    // Elementos para agregar un campo
                    newCell.appendChild(labelNuevoCampo); // Label para nuevo campo
                    newCell.appendChild(input);

                    newCell.appendChild(labelNumeroOrdenCampo); // Label para número de orden del campo
                    newCell.appendChild(ordenCampoInput); // Input para el número de orden del campo

                    newCell.appendChild(labelTipoCampo); // Label para tipo de campo
                    newCell.appendChild(tipoCampoSelect); // Select para tipo de campo

                    newCell.appendChild(okButton);
                    newCell.appendChild(lineBreak);
                    newCell.appendChild(labelCamposActuales); // Agregar label para campos actuales
                    newCell.appendChild(camposContainer); // Añadir lista de campos existentes

                    newRow.appendChild(newCell);
                    faseRow.after(newRow);

                    // Manejar el evento de clic en el botón Confirmar cambios
                    okButton.addEventListener('click', function() {
                        let nuevoCampo = input.value;
                        let nuevoOrdenCampo = ordenCampoInput.value;
                        let tipoCampo = tipoCampoSelect.value;
                        let nuevoOrdenFase = ordenFaseInput.value; // Capturar el nuevo orden de la fase

                        // Primero actualizamos el número de orden de la fase
                        Fases.update({
                            fase_id: faseId,
                            numero_orden: nuevoOrdenFase // Enviar el nuevo número de orden de la fase
                        }).then(function(ret) {
                            if (ret.success) {
                                console.log('Número de orden de la fase actualizado correctamente');
                                refrescarTablaFases(); // Refrescar la tabla automáticamente
                            } else {
                                console.error('Error al actualizar número de orden de la fase:', ret.message);
                            }
                        });

                        if (nuevoCampo.trim() !== '') {
                            // Si el campo no está vacío, agregarlo con sus datos
                            Fases.update({
                                fase_id: faseId,
                                nuevo_campo: {
                                    nombre: nuevoCampo,
                                    num_orden: nuevoOrdenCampo,
                                    tipo: tipoCampo
                                }
                            }).then(function(ret) {
                                if (ret.success) {
                                    console.log('Campo y número de orden del campo actualizados correctamente');
                                    refrescarTablaFases();
                                } else {
                                    console.error('Error al agregar campo:', ret.message);
                                }
                            });
                        }
                    });
                }).catch(function(error) {
                    console.error("Error al obtener los atributos:", error);
                });
            }
        });
    });



    document.querySelectorAll('.btn-borrar').forEach(button => {
        button.addEventListener('click', function() {
            var faseId = this.getAttribute('data-id');
            console.log("Borrar fase con ID:", faseId);
            // Confirmar antes de borrar
            if (confirm("¿Estás seguro de que deseas eliminar esta fase?")) {
                // Hacer una solicitud de eliminación al backend
                Fases.delete({ fase_id: faseId }).then(function(ret) {
                    if (ret.success) {
                        console.log("Fase eliminada correctamente:", faseId);
                        refrescarTablaFases(); // Refrescar la tabla automáticamente después de la eliminación
                    } else {
                        console.error("Error al eliminar la fase:", ret.message);
                    }
                });
            }
        });
    });
}

function refrescarTablaFases() {
    var tipo_producto_id = document.querySelector('#tipo_producto_id').value;
    Fases.list({
        "tipo_producto_id": tipo_producto_id
    })
    .then(function(ret) {
        var tabla_fases = document.querySelector('.tabla-fases > tbody');
        tabla_fases.innerHTML = '';
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
        });
        agregarEventosAcciones(); // Reasignar los eventos después de refrescar la tabla
    });
}
