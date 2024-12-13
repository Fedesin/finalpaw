document.addEventListener('DOMContentLoaded', function () {
    const changePasswordButton = document.querySelector('.change-password-button');
    const newPasswordInput = document.querySelector('.new-password');
    const repeatPasswordInput = document.querySelector('.repeat-password');
    const messageElement = document.querySelector('.reset-password-message');

    if (!changePasswordButton || !newPasswordInput || !repeatPasswordInput || !messageElement) {
        console.error('Elementos del DOM faltantes. Verifica que la clase esté correctamente aplicada.');
        return;
    }

    changePasswordButton.addEventListener('click', function () {
        const newPassword = newPasswordInput.value.trim();
        const repeatPassword = repeatPasswordInput.value.trim();

        // Limpiar mensajes previos
        messageElement.textContent = '';
        messageElement.classList.remove('error-message', 'success-message');

        // Validar que ambas contraseñas coincidan
        if (newPassword !== repeatPassword) {
            messageElement.textContent = 'Las contraseñas no coinciden. Inténtalo de nuevo.';
            messageElement.classList.add('error-message');
            return;
        }

        // Validar que la contraseña no esté vacía
        if (!newPassword) {
            messageElement.textContent = 'Por favor, completa todos los campos.';
            messageElement.classList.add('error-message');
            return;
        }

        // Obtener el token desde la URL
        const token = new URLSearchParams(window.location.search).get('token');
        if (!token) {
            messageElement.textContent = 'Enlace inválido o expirado. Por favor, solicita otro enlace.';
            messageElement.classList.add('error-message');
            return;
        }

        // Enviar la solicitud al backend para restablecer la contraseña
        fetch('/user/resetPassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token, newPassword }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json(); // Ahora esto no debería fallar
            })
            .then(data => {
                console.log('Respuesta del servidor:', data);
                if (data.status === 'success') {
                    messageElement.textContent = '¡Contraseña cambiada con éxito! Ahora puedes iniciar sesión.';
                    messageElement.classList.add('success-message');

                    setTimeout(function() {
                        window.location = '/';
                    }, 3000);
                } else {
                    messageElement.textContent = `Error: ${data.message}`;
                    messageElement.classList.add('error-message');
                }
            })
            .catch(error => {
                console.error('Error en el fetch:', error);
                messageElement.textContent = 'Ocurrió un error al cambiar la contraseña. Inténtalo más tarde.';
                messageElement.classList.add('error-message');
            });
    });
});
