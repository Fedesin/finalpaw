// main.js
function toggleStatus(button, userId, newStatus) {
    fetch("/api/users/status", {
        method: "POST",
        body: JSON.stringify({
            userid: userId,
            status: newStatus
        }),
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json; charset=UTF-8"
        }
    })
    .then(function(ret) {
        if (ret.status === 200) {
            if (newStatus === 0) {
                button.classList.remove('up');
                button.classList.add('down');
            } else {
                button.classList.remove('down');
                button.classList.add('up');
            }
            button.dataset.status = newStatus;
        }
    });
}


var roles = [];

function getRoles(){
    fetch('/api/roles', {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json; charset=UTF-8"
        }
    })
    .then(function(ret) {
        if(ret.status === 200)
            roles = ret.roles;
    });
}

function changeAnchorToOptions() {
     // Obtener el contenedor del rol donde está el anchor
     var parent = button.closest('ul').querySelector('li');

     // Guardar el rol actual
     var currentRole = parent.innerText.trim();
     
     // Reemplazar el contenido del <li> por un <select> con las opciones
     var select = document.createElement('select');

}


// Asignar los eventos de clic a los botones
document.addEventListener('DOMContentLoaded', function() {
    var buttons = document.querySelectorAll('.toggleStatusButton');
    
    buttons.forEach(function(button) {
        button.addEventListener('click', function() {
            var userId = parseInt(this.getAttribute('data-id'));
            var newStatus = parseInt(this.getAttribute('data-status'));
            
            toggleStatus(button, userId, 1 - newStatus);

        });
    });

    var buttons = document.querySelectorAll('.modifyRoleButton');
    
    buttons.forEach(function(button) {
        button.addEventListener('click', function() {
            changeAnchorToOptions(button);
        });
    });

    getRoles();
});