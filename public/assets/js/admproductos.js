function refrescarTablaProductos() {
    Productos.list().then(data => {
        const tbody = document.querySelector("#tablaProductos tbody");
        tbody.innerHTML = ''; // Limpiar contenido previo
        data.productos.forEach(producto => {
            agregarElementoTablaProductos(producto);
        });
    }).catch(error => console.error("Error al listar productos:", error));
}

function agregarElementoTablaProductos(producto) {
    const tbody = document.querySelector("#tablaProductos tbody");
    const row = document.createElement("tr");

    row.setAttribute("data-id", producto.id);
    row.innerHTML = `
        <td class="nombretipoProducto capitalize">${producto.tipo_producto.nombre}</td>
        <td class="nombreProducto">${producto.nombre}</td>
        <td>
            <ul class="lista-horizontal">
                <li><button class="btnEditarProducto">✏️</button></li>
                <li><button class="btnEliminarProducto">❌</button></li>
            </ul>
        </td>
    `;
    tbody.appendChild(row);

    row.querySelector(".btnEditarProducto").addEventListener("click", editarProducto);
    row.querySelector(".btnEliminarProducto").addEventListener("click", eliminarProducto);
}

document.addEventListener('DOMContentLoaded', function() {
    var btnAgregarProducto = document.querySelector('#btnAgregarProducto');
    if (btnAgregarProducto) {
        btnAgregarProducto.addEventListener('click', function() {
            var nombreProducto = document.querySelector('#agregarProducto').value;
            var tipoProductoId = document.querySelector('#tipoprod').value;
            
            Productos.create({
                nombre: nombreProducto,
                tipo_producto_id: tipoProductoId
            }).then(function(response) {
                if (response.status == "success") {
                    agregarElementoTablaProductos(response.data);
                    document.getElementById("agregarProducto").value = ""; // Limpiar el campo de nombre
                } else {
                    console.error('Error al agregar producto:', response.message);
                    alert(data.message);
                }
            });
        });
    }

    refrescarTablaProductos();
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