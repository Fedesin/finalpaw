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



document.addEventListener("DOMContentLoaded", () => {
    const forms = document.querySelectorAll(".form-pasar-fase");

    forms.forEach(form => {
        form.addEventListener("submit", function(event) {
            event.preventDefault();  // Evita la acción predeterminada del formulario

            const formData = new FormData(form);

            // Hacer la solicitud AJAX con el método POST
            fetch('/lotes/pasarFase', {
                method: 'POST',
                body: formData
            }).then(() => {
                // Recargar la página después de que la solicitud haya sido completada
                window.location.reload();
            })
        });
    });
});
