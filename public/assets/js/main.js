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

var Productos = {
    list: function() {
        return fetch("/api/productos", {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        })
        .then(response => response.json());
    },
    create: function(args) {
        // Cambiar la URL a "/api/productos" para que coincida con la ruta en el backend
        return fetch("/api/productos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(args)
        })
        .then(response => response.json());
    },
    update: function(args) {
        // Cambiar la URL a "/api/productos" para actualizar (usando el método PUT)
        return fetch("/api/productos", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(args)
        })
        .then(response => response.json());
    },
    delete: function(args) {
        // Cambiar la URL a "/api/productos" para eliminar (usando el método DELETE)
        return fetch("/api/productos", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(args)
        })
        .then(response => response.json());
    }
};

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

    var selectTipo_producto_id = document.querySelector('#tipo_producto_id');
    if (selectTipo_producto_id) {
        selectTipo_producto_id.addEventListener('change', function() {
            var tipo_producto_id = document.querySelector('#tipo_producto_id').value;
            document.querySelector('.tabla-fases').classList.remove('hidden');
            document.querySelector('#fase-nombre').classList.remove('hidden');
            document.querySelector('.btn-agregar-fase').classList.remove('hidden');

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
                });
                agregarEventosAcciones();
            });
        });
    }

    var addFasesButton = document.querySelector('.btn-agregar-fase');
    if (addFasesButton) {
        addFasesButton.addEventListener('click', function() {
            var fase_nombre = document.querySelector('#fase-nombre').value;
            var tipo_producto_id = document.querySelector('#tipo_producto_id').value;
            var numero_orden_element = document.querySelector('#numero_orden');
            var numero_orden = (numero_orden_element && numero_orden_element.value) ? numero_orden_element.value : 1;

            Fases.create({
                fase_nombre: fase_nombre,
                tipo_producto_id: tipo_producto_id,
                numero_orden: numero_orden
            }).then(function(ret) {
                console.log(ret.data);
                refrescarTablaFases();
            });
        });
    }

    var btnAgregarProducto = document.querySelector('#btnAgregarProducto');
    if (btnAgregarProducto) {
        btnAgregarProducto.addEventListener('click', function() {
            var nombreProducto = document.querySelector('#agregarProducto').value;
            var tipoProductoId = document.querySelector('#tipoprod').value;
            
            Productos.create({
                nombre: nombreProducto,
                tipo_producto_id: tipoProductoId
            }).then(function(response) {
                if (response.success) {
                    refrescarTablaProductos();
                } else {
                    console.error('Error al agregar producto:', response.message);
                }
            });
        });
    }

    getRoles().then(function(ret) {
        roles = ret;
    });

    if (document.querySelector('#tablaProductos')) {
        refrescarTablaProductos();
    }
});





function agregarEventosAcciones() {
    document.querySelectorAll('.btn-editar').forEach(button => {
        button.addEventListener('click', function() {
            var faseId = this.getAttribute('data-id');
            console.log("Editar fase con ID:", faseId);
            var faseRow = this.closest('tr');

            if (!faseRow.querySelector('.input-editar')) {
                Fases.getAttributes({
                    fase_id: faseId
                }).then(function(ret) {
                    let atributos = ret.atributos || {};

                    // Crear elementos del formulario de edición
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

                    let input = document.createElement('input');
                    input.type = 'text';
                    input.classList.add('input-editar');
                    input.placeholder = 'Nuevo campo (nombre)';

                    let tipoCampoSelect = document.createElement('select'); 
                    tipoCampoSelect.classList.add('input-tipo-campo');
                    ["entero", "string", "float", "boolean"].forEach(tipo => {
                        let option = document.createElement('option');
                        option.value = tipo;
                        option.textContent = tipo.charAt(0).toUpperCase() + tipo.slice(1);
                        tipoCampoSelect.appendChild(option);
                    });

                    let ordenCampoInput = document.createElement('input');
                    ordenCampoInput.type = 'number';
                    ordenCampoInput.value = 1; 
                    ordenCampoInput.classList.add('input-orden');

                    let ordenFaseInput = document.createElement('input');
                    ordenFaseInput.type = 'number';
                    ordenFaseInput.value = ret.numero_orden || 1;
                    ordenFaseInput.classList.add('input-orden-fase');

                    let okButton = document.createElement('button');
                    okButton.textContent = 'Confirmar cambios';
                    okButton.classList.add('btn-ok');

                    let lineBreak = document.createElement('br');

                    let labelCamposActuales = document.createElement('label');
                    labelCamposActuales.textContent = 'Campos actuales:';
                    labelCamposActuales.classList.add('label-campo');

                    let camposContainer = document.createElement('div');
                    camposContainer.classList.add('campos-container');

                    // Iterar sobre los atributos y añadir los campos actuales con el botón para editar y eliminar
                    if (Object.keys(atributos).length > 0) {
                        Object.keys(atributos).forEach(function(campo) {
                            let campoRow = document.createElement('div');
                            campoRow.classList.add('campo-row');

                            let campoLabel = document.createElement('span');
                            campoLabel.textContent = campo; // Mostrar solo el nombre original del campo
                            
                            // Botón de editar
                            let editButton = document.createElement('button');
                            editButton.textContent = '✏️'; // Icono de lápiz
                            editButton.classList.add('btn-editar-campo');

                            // Botón de eliminar
                            let deleteButton = document.createElement('button');
                            deleteButton.textContent = '❌'; // Icono de cruz
                            deleteButton.classList.add('btn-delete-campo');

                            // Evento para eliminar el campo
                            deleteButton.addEventListener('click', function() {
                                Fases.deleteCampo({
                                    fase_id: faseId,
                                    campo: campo
                                }).then(function(ret) {
                                    if (ret.success) {
                                        campoRow.remove();
                                        console.log('Campo eliminado correctamente');
                                    } else {
                                        console.error('Error al eliminar el campo:', ret.message);
                                    }
                                });
                            });

                            // Evento para editar el campo
                            editButton.addEventListener('click', function() {
                                campoRow.innerHTML = ''; // Limpiar el contenido para desplegar las opciones de edición

                                let campoEditInput = document.createElement('input');
                                campoEditInput.type = 'text';
                                campoEditInput.classList.add('input-nombre-campo');
                                campoEditInput.value = campo; // Mostrar el nombre original del campo

                                let ordenCampoActualInput = document.createElement('input');
                                ordenCampoActualInput.type = 'number';
                                ordenCampoActualInput.value = atributos[campo].num_orden || 1;
                                ordenCampoActualInput.classList.add('input-orden-campo');

                                let tipoCampoActualSelect = document.createElement('select');
                                tipoCampoActualSelect.classList.add('input-tipo-campo');
                                ["entero", "string", "float", "boolean"].forEach(tipo => {
                                    let option = document.createElement('option');
                                    option.value = tipo;
                                    option.textContent = tipo.charAt(0).toUpperCase() + tipo.slice(1);
                                    if (tipo === atributos[campo].tipo) {
                                        option.selected = true;
                                    }
                                    tipoCampoActualSelect.appendChild(option);
                                });

                                let guardarButton = document.createElement('button');
                                guardarButton.textContent = 'Guardar cambios';
                                guardarButton.classList.add('btn-guardar-campo');

                                // Evento para guardar cambios
                                guardarButton.addEventListener('click', function() {
                                    const nuevoNombre = campoEditInput.value;
                                    const nuevoOrden = ordenCampoActualInput.value;
                                    const nuevoTipo = tipoCampoActualSelect.value;

                                    Fases.update({
                                        fase_id: faseId,
                                        editar_campo: {
                                            original: campo,
                                            nuevo_nombre: nuevoNombre,
                                            num_orden: nuevoOrden,
                                            tipo: nuevoTipo
                                        }
                                    }).then(function(ret) {
                                        if (ret.success) {
                                            console.log('Campo actualizado correctamente');
                                            refrescarTablaFases();
                                        } else {
                                            console.error('Error al actualizar el campo:', ret.message);
                                        }
                                    });
                                });

                                campoRow.appendChild(campoEditInput);
                                campoRow.appendChild(ordenCampoActualInput);
                                campoRow.appendChild(tipoCampoActualSelect);
                                campoRow.appendChild(guardarButton);
                            });

                            campoRow.appendChild(campoLabel);
                            campoRow.appendChild(editButton); // Añadir botón de editar
                            campoRow.appendChild(deleteButton); // Añadir botón de eliminar
                            camposContainer.appendChild(campoRow);
                        });
                    } else {
                        console.log("No hay atributos existentes para esta fase.");
                    }

                    // Añadir div para agrupar el label y el input del número de orden del campo
                    let divNumeroOrdenCampo = document.createElement('div');
                    divNumeroOrdenCampo.classList.add('campo-orden-container');
                    divNumeroOrdenCampo.appendChild(labelNumeroOrdenCampo);
                    divNumeroOrdenCampo.appendChild(ordenCampoInput);

                    // Añadir elementos a la fila de edición
                    let newRow = document.createElement('tr');
                    let newCell = document.createElement('td');
                    newCell.colSpan = 2;

                    newCell.appendChild(labelNumeroOrdenFase);
                    newCell.appendChild(ordenFaseInput);

                    newCell.appendChild(labelNuevoCampo);
                    newCell.appendChild(input);

                    newCell.appendChild(divNumeroOrdenCampo); // Ahora el número de orden del campo está en su propio div

                    newCell.appendChild(labelTipoCampo);
                    newCell.appendChild(tipoCampoSelect);

                    newCell.appendChild(okButton);
                    newCell.appendChild(lineBreak);
                    newCell.appendChild(labelCamposActuales);
                    newCell.appendChild(camposContainer);

                    newRow.appendChild(newCell);
                    faseRow.after(newRow);

                    okButton.addEventListener('click', function() {
                        let nuevoCampo = input.value;
                        let nuevoOrdenCampo = ordenCampoInput.value;
                        let tipoCampo = tipoCampoSelect.value;
                        let nuevoOrdenFase = ordenFaseInput.value;

                        Fases.update({
                            fase_id: faseId,
                            numero_orden: nuevoOrdenFase 
                        }).then(function(ret) {
                            if (ret.success) {
                                console.log('Número de orden de la fase actualizado correctamente');
                                refrescarTablaFases(); 
                            } else {
                                console.error('Error al actualizar número de orden de la fase:', ret.message);
                            }
                        });

                        if (nuevoCampo.trim() !== '') {
                            Fases.update({
                                fase_id: faseId,
                                nuevo_campo: {
                                    nombre: nuevoCampo,
                                    num_orden: nuevoOrdenCampo,
                                    tipo: tipoCampo
                                }
                            }).then(function(ret) {
                                if (ret.success) {
                                    console.log('Campo y número de orden del campo agregados correctamente');
                                    refrescarTablaFases();
                                } else {
                                    console.error('Error al agregar campo:', ret.message);
                                }
                            });
                        } else {
                            console.log('Campo nuevo está vacío, no se puede agregar.');
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
function refrescarTablaProductos() {
    Productos.list().then(data => {
        const tbody = document.querySelector("#tablaProductos tbody");
        tbody.innerHTML = ''; // Limpiar contenido previo
        data.productos.forEach(producto => {
            const row = document.createElement("tr");
            row.setAttribute("data-id", producto.id);
            row.innerHTML = `
                <td class="nombretipoProducto capitalize">${producto.tipo_producto.nombre}</td>
                <td class="nombreProducto">${producto.nombre}</td>
                <td>
                    <button class="btnEditarProducto">✏️</button>
                    <button class="btnEliminarProducto">❌</button>
                </td>
            `;
            tbody.appendChild(row);
        });
        agregarEventosProductos(); // Asegurarse de que los eventos se asignen aquí
    }).catch(error => console.error("Error al listar productos:", error));
}

// Función para agregar eventos a los botones de edición y eliminación de productos
function agregarEventosProductos() {
    document.querySelectorAll(".btnEditarProducto").forEach(button => {
        button.addEventListener("click", editarProducto);
    });
    document.querySelectorAll(".btnEliminarProducto").forEach(button => {
        button.addEventListener("click", eliminarProducto);
    });
}

// Función para agregar un nuevo producto
document.getElementById("btnAgregarProducto").addEventListener("click", () => {
    const nombre = document.getElementById("agregarProducto").value;
    const tipoprod_id = document.getElementById("tipoprod").value;

    Productos.create({ nombre, tipoprod_id }).then(data => {
        if (data.success) {
            refrescarTablaProductos();
            document.getElementById("agregarProducto").value = ""; // Limpiar el campo de nombre
        } else {
            alert(data.message);
        }
    });
});

// Función para editar un producto (usando la misma lógica que la edición en fases)
function editarProducto() {
    console.log("Edit button clicked");
    const row = this.closest("tr");
    const id = row.getAttribute("data-id");
    const nombreProducto = row.querySelector(".nombreProducto");

    // Verifica si ya hay un campo de edición para evitar duplicados
    if (!row.querySelector(".input-editar-producto")) {
        const inputEditar = document.createElement("input");
        inputEditar.type = "text";
        inputEditar.classList.add("input-editar-producto");
        inputEditar.value = nombreProducto.textContent;
        
        const guardarButton = document.createElement("button");
        guardarButton.textContent = "Guardar cambios";
        guardarButton.classList.add("btn-guardar-producto");

        // Reemplaza el contenido de la celda con el input y botón de guardar
        nombreProducto.innerHTML = '';
        nombreProducto.appendChild(inputEditar);
        nombreProducto.appendChild(guardarButton);

        // Evento para guardar los cambios
        guardarButton.addEventListener("click", function () {
            const nuevoNombre = inputEditar.value;
            if (nuevoNombre) {
                Productos.update({ producto_id: id, nombre: nuevoNombre }).then(data => {
                    if (data.success) {
                        refrescarTablaProductos();
                    } else {
                        alert(data.message);
                    }
                }).catch(error => console.error("Error al actualizar producto:", error));
            }
        });
    }
}

// Función para eliminar un producto
function eliminarProducto() {
    console.log("Delete button clicked"); // Verifica si se ejecuta al hacer clic
    const row = this.closest("tr");
    const id = row.getAttribute("data-id");
    console.log(id);
    Productos.delete({ producto_id: id }).then(data => {
        if (data.success) {
            refrescarTablaProductos();
        } else {
            alert(data.message || "Error al eliminar producto");
        }
    }).catch(error => console.error("Error al eliminar producto:", error));

}