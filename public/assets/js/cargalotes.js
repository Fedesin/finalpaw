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

refrescarTablaLotes();