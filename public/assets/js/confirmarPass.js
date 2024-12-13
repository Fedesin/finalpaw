document.addEventListener('DOMContentLoaded', function () {
    const emailInput = document.querySelector('#username');
    const newPassword = document.querySelector('#password');
    const repeatPassword = document.querySelector('#retype-Password');

    if (newPassword !== repeatPassword) {
        const messageElement = document.getElementById('message');
        messageElement.textContent = 'Las contraseñas no coinciden.';
        messageElement.classList.remove('hidden'); 
        return;
    }
    
    

    //llamar a la funcion del back para que actualice la contraseña
   
});