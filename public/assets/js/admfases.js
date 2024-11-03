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

                    [
                        labelNumeroOrdenFase,
                        ordenFaseInput,
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

document.addEventListener('DOMContentLoaded', function() {
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
});
