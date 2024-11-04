document.addEventListener('DOMContentLoaded', function() {
    var selectTipoProducto = document.querySelector('.selectTipoProducto');
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
        Productos.list().then(data => {
            Object.values(data.productos).forEach(producto => {
                let option = document.createElement('option');
                option.value = producto.id;
                option.textContent = producto.nombre;
                selectProducto.appendChild(option);
            })

            if(selectProducto.dataset.value)
                selectProducto.value = selectProducto.dataset.value;
        })
    }else{
        console.log('No se encontro el select Producto');
    }
    

    var selectSupervisor = document.querySelector('.supervisor');
    var selectEncargadoProduccion = document.querySelector('.encargadoProduccion');
    var selectEncargadoLimpieza = document.querySelector('.encargadoLimpieza');
    Users.list().then(data => {
        Object.values(data).forEach(usuario => {
            let option = document.createElement('option');
            option.value = usuario.id;
            option.textContent = usuario.email;
            selectSupervisor.appendChild(option);
            selectEncargadoProduccion.appendChild(option.cloneNode(true));
            selectEncargadoLimpieza.appendChild(option.cloneNode(true));
        })

        if(selectSupervisor.dataset.value)
            selectSupervisor.value = selectSupervisor.dataset.value;

        if(selectEncargadoProduccion.dataset.value)
            selectEncargadoProduccion.value = selectEncargadoProduccion.dataset.value;

        if(selectEncargadoLimpieza.dataset.value)
            selectEncargadoLimpieza.value = selectEncargadoLimpieza.dataset.value;
    });

});
