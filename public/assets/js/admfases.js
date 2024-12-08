/*
{
    "status":"success",
    "data":{
        "12":{
            "id":12,
            "nombre":"Pasteurizaci\u00f3n",
            "tipo_producto_id":1,
            "atributos": {
                "Cant Leche (ml)":"",
                "Temperatura m\\u00ednima":{
                    "num_orden":"1",
                    "tipo":"float",
                    "valor":""
                }
            }
        },
        "20":{
            "id":20,
            "nombre":"Preparaci\u00f3n del fermento",
            "tipo_producto_id":1,
            "atributos":[]
        }
    }
}
*/
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
                    <button class="btn-editar" data-id="${fase.id}"></button>
                    <button class="btn-borrar btn-delete" data-id="${fase.id}"></button>
                </td>
            `;
            tabla_fases.appendChild(row);
        });
        agregarEventosAcciones(); // Reasignar los eventos después de refrescar la tabla
    });
}

function agregarEventosEditar(button) {
    button.addEventListener('click', function() {
        var faseId = this.getAttribute('data-id');

        console.log("Editar fase con ID:", faseId);
        var faseRow = this.closest('tr');
        let next = faseRow.nextElementSibling;

        if(next && !next.classList.contains("fase")) {
            if(next.classList.contains("collapsed")) {
                next.classList.remove("collapsed");
            } else {
                next.classList.add("collapsed");
            }
        } else {
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

                [
                    labelNuevoCampo,
                    input,
                    divNumeroOrdenCampo,
                    labelTipoCampo,
                    tipoCampoSelect,
                    okButton,
                    lineBreak,
                    labelCamposActuales,
                    camposContainer
                ].forEach(nodo => {
                    newCell.appendChild(nodo);
                });

                newRow.appendChild(newCell);
                faseRow.after(newRow);

                okButton.addEventListener('click', function() {
                    let nuevoCampo = input.value;
                    let nuevoOrdenCampo = ordenCampoInput.value;
                    let tipoCampo = tipoCampoSelect.value;

/*
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

*/
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
}

function agregarEventosBorrar(button) {
    button.addEventListener('click', function() {
        var faseId = this.getAttribute('data-id');
        console.log("Borrar fase con ID:", faseId);
        // Confirmar antes de borrar
        if (confirm("¿Estás seguro de que deseas eliminar esta fase?")) {
            // Hacer una solicitud de eliminación al backend
            Fases.delete({ fase_id: faseId }).then(function(ret) {
                if (ret.success) {
                    console.log("Fase eliminada correctamente:", faseId);
                    let tr = button.closest('tr');

                    tr.nextSibling.remove();
                    tr.remove();
                } else {
                    console.error("Error al eliminar la fase:", ret.message);
                }
            });
        }
    });
}

var fases = null;
let draggedRow = null;
let nextRow = null;
let tabla_fases = null;
let selectTipo_producto_id = null;

function actualizarFila(fila, nombre, tipo) {
    let campos = fila.querySelectorAll('td');

    campos[0].textContent = nombre;
    campos[1].textContent = tipo;
}

function agregarFilaEdicionAtributo(referenceNode, fase_id, atributos) {
    let campoRow = document.createElement('tr');

    campoRow.classList.add('hidden');
    let campoNombre = document.createElement('td');

    inputNombre = document.createElement('input');
    inputNombre.type = 'text';
    inputNombre.placeholder = atributos.nombre;
    inputNombre.value = ''; //atributos.nombre;

    campoNombre.appendChild(inputNombre);
    campoRow.appendChild(campoNombre);

    campoTipo = document.createElement('td');

    let tipoCampoActualSelect = document.createElement('select');
    tipoCampoActualSelect.classList.add('input-tipo-campo');
    ["entero", "string", "float", "boolean"].forEach(tipo => {
        let option = document.createElement('option');

        option.value = tipo;
        option.textContent = tipo;

        tipoCampoActualSelect.appendChild(option);
    });

    tipoCampoActualSelect.value = atributos.tipo;

    campoTipo.appendChild(tipoCampoActualSelect);
    campoRow.appendChild(campoTipo);

    let campoAcciones = document.createElement('td');
    let listaAcciones = document.createElement('ul');

    campoRow.appendChild(campoAcciones);

    listaAcciones.classList.add('lista-horizontal');

    let confirmarLi = document.createElement('li');
    let cancelLi = document.createElement('li');

    campoAcciones.appendChild(listaAcciones);
    
    let confirmButton = document.createElement('button');
    confirmButton.classList.add('btn-confirmar');

    // Botón de eliminar
    let cancelButton = document.createElement('button');
    cancelButton.classList.add('btn-delete');

    confirmarLi.appendChild(confirmButton);
    cancelLi.appendChild(cancelButton);

    listaAcciones.appendChild(confirmarLi);
    listaAcciones.appendChild(cancelLi);

    referenceNode.after(campoRow);

    confirmButton.addEventListener('click', function() {
        const filas = Array.from(confirmButton.closest('tbody').querySelectorAll('tr'));
        const currentRow = confirmButton.closest('tr');
        const attrIndex = filas.indexOf(currentRow) * 0.5;
        const nombre = currentRow.querySelector('input[type=text]').value;
        const tipo = tipoCampoActualSelect.value;

        Fases.updateAttribute({
            fase_id: fase_id,
            attrIndex: attrIndex,
            nombre: nombre,
            tipo: tipo
        }).then(function(ret) {
            if (ret.success) {
                actualizarFila(campoRow.previousSibling, nombre, tipo);
                campoRow.classList.add('hidden');
                campoRow.previousSibling.classList.remove('hidden');

                console.log('Campo actualizado correctamente');
            } else {
                console.error('Error al actualizar el campo:', ret.message);
            }
        });
    });

    cancelButton.addEventListener('click', function() {
        let tr = cancelButton.closest('tr');

        tr.previousSibling.classList.remove('hidden');
        tr.classList.add('hidden');

        tr.querySelector('input[type=text]').value = atributos.nombre;
        tr.querySelector('select').value = atributos.tipo;
    });
}

function agregarFilaAtributos(tabla_body, fase_id, atributos) {
    let campoRow = document.createElement('tr');
    campoRow.classList.add('attribute');

    let campoNombre = document.createElement('td');

    campoNombre.textContent = atributos.nombre;
    campoRow.appendChild(campoNombre);

    let campoTipo = document.createElement('td');
    campoTipo.textContent = atributos.tipo;
    campoRow.appendChild(campoTipo);

    let campoAcciones = document.createElement('td');
    let listaAcciones = document.createElement('ul');

    campoRow.appendChild(campoAcciones);

    listaAcciones.classList.add('lista-horizontal');

    let editLi = document.createElement('li');
    let deleteLi = document.createElement('li');

    campoAcciones.appendChild(listaAcciones);
    
    // Botón de editar
    let editButton = document.createElement('button');
    editButton.classList.add('btn-editar');

    // Botón de eliminar
    let deleteButton = document.createElement('button');
    deleteButton.classList.add('btn-delete');

    editLi.appendChild(editButton);
    deleteLi.appendChild(deleteButton);

    listaAcciones.appendChild(editLi);
    listaAcciones.appendChild(deleteLi);

    deleteButton.addEventListener('click', function() {
        const filas = Array.from(tabla_body.querySelectorAll('tr.attribute'));
        const attrIndex = filas.indexOf(deleteButton.closest('tr'));

        Fases.deleteCampo({
            fase_id: fase_id,
            attrIndex: attrIndex
        }).then(function(ret) {
            if (ret.success) {
                campoRow.remove();
                console.log('Campo eliminado correctamente');
            } else {
                console.error('Error al eliminar el campo:', ret.message);
            }
        });
    });

    tabla_body.appendChild(campoRow);

    agregarFilaEdicionAtributo(campoRow, fase_id, atributos);

    editButton.addEventListener('click', function() {
        editButton.closest('tr').classList.add('hidden');
        editButton.closest('tr').nextSibling.classList.remove('hidden');
    });    
}

function addFase(fase) {
    let row = document.createElement('tr');

    row.classList.add('fase');
    row.draggable = true;
    row.dataset.id = fase.id;
    row.innerHTML = `
        <td>${fase.nombre}</td>
        <td>
            <button class="btn-editar" data-id="${fase.id}"></button>
            <button class="btn-borrar btn-delete" data-id="${fase.id}"></button>
        </td>
    `;
    tabla_fases.appendChild(row);

    agregarEventosEditar(row.querySelector('.btn-editar'));
    agregarEventosBorrar(row.querySelector('.btn-borrar'));

    row.addEventListener('dragstart', (e) => {
        draggedRow = row;
        nextRow = row.nextSibling;
        row.classList.add('dragging');
        nextRow.classList.add('dragging');
    });

    row.addEventListener('dragend', () => {
        draggedRow.classList.remove('dragging');
        nextRow.classList.remove('dragging');
        draggedRow = null;
        newRow = null;

        const filas = Array.from(tabla_fases.querySelectorAll('tr.fase'));
        const targetIndex = filas.indexOf(row);

        //actualizarOrden(row.dataset.id, targetIndex + 1);
        Fases.update({
            fase_id: row.dataset.id,
            numero_orden: targetIndex + 1
        });
    });

    row.addEventListener('dragover', (e) => {
        e.preventDefault(); // Necesario para permitir el drop
        e.dataTransfer.dropEffect = 'move';
    });

    row.addEventListener('dragenter', (e) => {
        e.preventDefault();

        const filas = Array.from(tabla_fases.querySelectorAll('tr'));
        const draggedIndex = filas.indexOf(draggedRow);
        const targetIndex = filas.indexOf(row);

        if (draggedIndex < targetIndex) {
            row.parentNode.insertBefore(nextRow, row.nextSibling.nextSibling);
            row.parentNode.insertBefore(draggedRow, row.nextSibling.nextSibling);
            
        } else {
            row.parentNode.insertBefore(draggedRow, row);
            row.parentNode.insertBefore(nextRow, row.nextSibling)
        }
    });

    let labelCamposActuales = document.createElement('label');
    labelCamposActuales.textContent = 'Campos actuales';

    let campos_table = document.createElement('table');
    campos_table.classList.add('max-content');
    
    let campos_body = document.createElement('tbody');
    campos_table.appendChild(campos_body);

    let atributos = JSON.parse(fase.atributos);

    if (atributos.length > 0) {
        atributos.forEach(function(attr) {
            agregarFilaAtributos(campos_body, fase.id, attr);
        });
    };

    // Añadir elementos a la fila de edición
    let newRow = document.createElement('tr');
    let newCell = document.createElement('td');
    newCell.colSpan = 2;

    let agregarAttr = document.createElement('button');
    agregarAttr.textContent = 'Agregar atributo';
    agregarAttr.classList.add('btn');

    agregarAttr.addEventListener('click', function() {
        let campoRow = document.createElement('tr');
        let campoNombre = document.createElement('td');

        inputNombre = document.createElement('input');
        inputNombre.type = 'text';
        inputNombre.placeholder = "Nuevo Campo";

        campoNombre.appendChild(inputNombre);
        campoRow.appendChild(campoNombre);

        campoTipo = document.createElement('td');

        let tipoCampoActualSelect = document.createElement('select');
        tipoCampoActualSelect.classList.add('input-tipo-campo');
        ["entero", "string", "float", "boolean"].forEach(tipo => {
            let option = document.createElement('option');
            option.value = tipo;
            option.textContent = tipo;

            tipoCampoActualSelect.appendChild(option);
        });

        campoTipo.appendChild(tipoCampoActualSelect);
        campoRow.appendChild(campoTipo);

        let campoAcciones = document.createElement('td');
        let listaAcciones = document.createElement('ul');

        campoRow.appendChild(campoAcciones);

        listaAcciones.classList.add('lista-horizontal');

        let confirmarLi = document.createElement('li');
        let deleteLi = document.createElement('li');

        campoAcciones.appendChild(listaAcciones);
        
        let confirmButton = document.createElement('button');
        confirmButton.classList.add('btn-confirmar');

        // Botón de eliminar
        let deleteButton = document.createElement('button');
        deleteButton.classList.add('btn-delete');

        confirmarLi.appendChild(confirmButton);
        deleteLi.appendChild(deleteButton);

        listaAcciones.appendChild(confirmarLi);
        listaAcciones.appendChild(deleteLi);

        // Evento para eliminar el campo
        deleteButton.addEventListener('click', function() {
            deleteButton.closest('tr').remove();
        });

        confirmButton.addEventListener('click', function() {
            Fases.addAttribute({
                fase_id: fase.id,
                nombre: inputNombre.value,
                tipo: tipoCampoActualSelect.value
            })
            .then(function(ret) {
                campoRow.remove();

                agregarFilaAtributos(campos_body, fase.id, ret.atributos)
            })
        });

        campos_body.appendChild(campoRow);
    });

    [
        labelCamposActuales,
        campos_table,
        agregarAttr
    ].forEach(nodo => {
        newCell.appendChild(nodo);
    });

    newRow.classList.add("collapsed");
    newRow.appendChild(newCell);
    row.after(newRow);
}

document.addEventListener('DOMContentLoaded', function() {
    tabla_fases = document.querySelector('.tabla-fases > tbody');
    selectTipo_producto_id = document.querySelector('#tipo_producto_id');

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
                fases = ret.data;

                tabla_fases.innerHTML = '';

                Object.values(ret.data).forEach(fase => {
                    addFase(fase);
                });
            });
        });
    }

    var addFasesButton = document.querySelector('.btn-agregar-fase');
    if (addFasesButton) {
        addFasesButton.addEventListener('click', function() {
            var fase_nombre = document.querySelector('#fase-nombre').value;
            var tipo_producto_id = document.querySelector('#tipo_producto_id').value;

            Fases.create({
                fase_nombre: fase_nombre,
                tipo_producto_id: tipo_producto_id
            }).then(function(ret) {
                addFase(ret.data);

                fase_nombre.value = '';
            });
        });
    }
});
