// main.js
function toggleStatus(userId, newStatus) {
    console.log('Sending request to toggle user status for userId:', userId, 'with newStatus:', newStatus);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/admuser/toggleStatus', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            console.log('Response received with status:', xhr.status);
            if (xhr.status === 200) {
                console.log('User status updated successfully');
            } else {
                console.error('Error in the request:', xhr.status);
            }
        }
    };

    xhr.send("userid=" + userId + "&status=" + newStatus);
}


// Asignar los eventos de clic a los botones
document.addEventListener('DOMContentLoaded', function() {
    var buttons = document.querySelectorAll('.toggleStatusButton');
    
    buttons.forEach(function(button) {
        button.addEventListener('click', function() {
            var userId = this.getAttribute('data-id');
            var newStatus = this.getAttribute('data-status');
            
            toggleStatus(userId, newStatus);
        });
    });
});