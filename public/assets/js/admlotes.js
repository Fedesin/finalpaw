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
    });

});
