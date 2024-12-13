document.addEventListener('DOMContentLoaded', function () {
    const passwordField = document.getElementById('password');
    const retypePasswordField = document.getElementById('retype-password');
    const messageElement = document.querySelector('.status-message'); 
    const submitButton = document.querySelector('.btn'); 
    function validatePasswords() {
        const password = passwordField.value;
        const retypePassword = retypePasswordField.value;

        if (password !== retypePassword) {
            messageElement.textContent = 'Las contraseñas no coinciden.';
            submitButton.disabled = true; 
        } else {
            messageElement.textContent = ''; 
            submitButton.disabled = false; 
        }
    }

    passwordField.addEventListener('input', validatePasswords);
    retypePasswordField.addEventListener('input', validatePasswords);
});