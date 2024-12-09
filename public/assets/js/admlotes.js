document.addEventListener('DOMContentLoaded', function() {
    var selectTipoProducto = document.querySelector('.selectTipoProducto');
    var numeroProduccionInput = document.querySelector('#numeroProduccion');
    if(selectTipoProducto){
        Productos.tipos().then(data => {
            Object.values(data.data).forEach(tipo => {
                let option = document.createElement('option');
                option.value = tipo.id;
                option.textContent = tipo.nombre;
                selectTipoProducto.appendChild(option);
            })

            if(selectTipoProducto.dataset.value)
                selectTipoProducto.value = selectTipoProducto.dataset.value;
        })
    }else{
        console.log('No se encontro el select Tipo de Producto');
    }

    var selectProducto = document.querySelector('.selectProducto');
    if(selectProducto){
        // Agregar opción inicial deshabilitada
        let defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = "Escoja un producto";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        selectProducto.appendChild(defaultOption);
        Productos.list().then(data => {
            Object.values(data.productos).forEach(producto => {
                let option = document.createElement('option');
                option.value = producto.id;
                option.textContent = producto.nombre;
                selectProducto.appendChild(option);
            })

            if(selectProducto.dataset.value)
                selectProducto.value = selectProducto.dataset.value;
                
             // Evento change para el select de Producto
            selectProducto.addEventListener('change', function () {
                var productoId = selectProducto.value;
                console.log('Producto seleccionado ID:', productoId); // Log para verificar selección

                if (productoId) {
                    fetch(`/api/lotes/ultima-produccion?producto_id=${productoId}`)
                        .then(response => {
                            console.log('Respuesta de la API:', response); // Log de la respuesta
                            return response.json();
                        })
                        .then(data => {
                            console.log('Datos del endpoint:', data); // Log de los datos
                            // Asignar el número de producción +1 al input
                            numeroProduccionInput.value = (data.ultimo_numero || 0) + 1;
                        })
                        .catch(error => console.error('Error al obtener la última producción:', error));
                } else {
                    console.warn('No se seleccionó un producto.');
                }
            });
        })
    }else{
        console.log('No se encontro el select Producto');
    }
    

});
