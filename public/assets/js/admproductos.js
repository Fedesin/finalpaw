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
                if (response.success) {
                    refrescarTablaProductos();
                } else {
                    console.error('Error al agregar producto:', response.message);
                }
            });
        });
    }

    if (document.querySelector('#tablaProductos')) {
        refrescarTablaProductos();
    }
});

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