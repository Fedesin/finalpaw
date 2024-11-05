function refrescarTablaLotes() {
    Lotes.list().then(data => {
        const tbody = document.querySelector(".tabla-lotes tbody"); 
        tbody.innerHTML = ''; // Limpiar contenido previo
        data.lotes.forEach(lote => {
            agregarElementoTablaLotes(lote);
        });
    }).catch(error => {
        console.error("Error al cargar lotes:", error);
        Lotes.list().then(data => {
            const tbody = document.querySelector(".tabla-lotes tbody"); 
            tbody.innerHTML = ''; // Limpiar contenido previo
            data.lotes.forEach(lote => {
                agregarElementoTablaLotes(lote);
                agregarEventosAcciones();
            });
        })
    });
}


function agregarElementoTablaLotes(lote) {
    const row = document.createElement("tr");
    row.setAttribute("data-id", lote.id);
    row.innerHTML = `
        <td>${lote.producto.nombre}</td>
        <td>${lote.numero}</td>
        <td>
            <button class="btn-editar" data-id="${lote.id}">✏️</button>
        </td>
    `;
    const tbody = document.querySelector(".tabla-lotes tbody");
    tbody.appendChild(row);
}


function agregarEventosAcciones() {
    const botonesEditar = document.querySelectorAll(".btn-editar");
    botonesEditar.forEach(boton => {
        boton.addEventListener("click", editarLote);
    });
}

function editarLote(event) {
    const loteId = event.target.getAttribute("data-id");
    const row = event.target.closest("tr");

    if (row.nextElementSibling && row.nextElementSibling.classList.contains("fase-form")) {
        row.nextElementSibling.remove();
        return;
    }

    Fases.getAttributes({ lote_id: loteId })
        .then(data => {
            if (data.success) {
                mostrarFormularioFase(row, data.atributos, loteId);
            } else {
                console.error("Error al obtener los atributos de la fase:", data.message);
            }
        })
        .catch(error => console.error("Error en la solicitud para obtener los atributos de la fase:", error));
}

function mostrarFormularioFase(row, atributos, loteId) {
    // Crear una fila nueva debajo de la fila seleccionada para mostrar los atributos
    const faseRow = document.createElement("tr");
    faseRow.classList.add("fase-form");

    // Generar campos de entrada para cada atributo
    faseRow.innerHTML = `
        <td colspan="3">
            <div>
                <h3>Atributos de la Fase Actual</h3>
                ${atributos.map(attr => `
                    <label>${attr.nombre}:
                        <input type="text" data-attr-id="${attr.id}" value="${attr.valor || ''}">
                    </label>
                `).join('')}
                <button class="btn-terminar-fase" data-lote-id="${loteId}">Terminar Fase</button>
            </div>
        </td>
    `;

    // Insertar la fila de edición justo debajo de la fila actual
    row.parentNode.insertBefore(faseRow, row.nextSibling);

    // Agregar evento para el botón "Terminar Fase"
    faseRow.querySelector(".btn-terminar-fase").addEventListener("click", () => terminarFase(faseRow, loteId));
}


refrescarTablaLotes();