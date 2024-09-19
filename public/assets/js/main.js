// main.js
function toggleStatus(button, userId, newStatus) {
    console.log('Sending request to toggle user status for userId:', userId, 'with newStatus:', newStatus);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/admuser/toggleStatus', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            console.log('Response received with status:', xhr.status);
            if (xhr.status === 200) {
                console.log('User status updated successfully');
                if (newStatus === 0) {
                    button.classList.remove('up');
                    button.classList.add('down');
                } else {
                    button.classList.remove('down');
                    button.classList.add('up');
                }
                button.dataset.status = newStatus;
                console.log(newStatus);
            } else {
                console.error('Error in the request:', xhr.status);
            }
        }
    };

    xhr.send("userid=" + userId + "&status=" + newStatus);
}


var roles = [];

function getRoles(){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/roles', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function (data) {
        if (xhr.readyState === 4) {
            console.log('Response received with status:', xhr.status);
            if (xhr.status === 200) {
                console.log(data);
            } else {
                console.error('Error in the request:', xhr.status);
            }
        }
    };
    xhr.send();
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
            var userId = this.getAttribute('data-id');
            var newStatus = this.getAttribute('data-status');
            
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