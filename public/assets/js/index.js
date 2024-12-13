function sendMailPasswordChange(actualPassword, newPassword) {
    const token = btoa(JSON.stringify({ actual_password: actualPassword, new_password: newPassword, email: userEmail, timestamp: Math.floor(Date.now() / 1000) }));
    const domainWithPort = `${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}`;
    const isLocalhost = window.location.hostname === 'localhost';
    const protocol = isLocalhost ? 'http' : 'https';
    const verificationLink = `${protocol}://${domainWithPort}/verify-password-change?token=${token}`;

    const params = {
        to_email: userEmail,
        verification_link: verificationLink,
    };

    emailjs.send('service_ixstcji', 'template_e3i7gwm', params) // Cambia `template_password_change` al ID de tu plantilla en EmailJS
        .then(response => {
            console.log('Correo enviado:', response.status, response.text);
            const messageElement = document.getElementById('message');
            messageElement.textContent = 'Correo de verificación enviado. Revisa tu bandeja de entrada.';
            messageElement.classList.remove('hidden');
        })
        .catch(error => {
            console.error('Error al enviar correo:', error);
            const messageElement = document.getElementById('message');
            messageElement.textContent = 'Error al enviar el correo de verificación.';
            messageElement.classList.remove('hidden');
        });
}


document.addEventListener('DOMContentLoaded', function() {
    const changepasswordbutton = document.querySelector('.change-password-button');

    changepasswordbutton.addEventListener('click', async function() {
        const actualPassword = document.querySelector('.actual-password').value;
        const newPassword = document.querySelector('.new-password').value;
        const repeatPassword = document.querySelector('.repeat-password').value;
        const messageElement = document.getElementById('message');
        if (newPassword !== repeatPassword) {
            const messageElement = document.getElementById('message');
            messageElement.textContent = 'Las contraseñas no coinciden.';
            messageElement.classList.remove('hidden'); 
            return;
        }
        if (!actualPassword || !newPassword || !repeatPassword) {
            const messageElement = document.getElementById('message');
            messageElement.textContent = 'Por favor, complete todos los campos.';
            messageElement.classList.remove('hidden'); 
            return;
        }
        
        try {
            const response = await Users.changePassword({
                email: userEmail,
                actualPassword: actualPassword,
                newPassword: newPassword,
            });

            messageElement.textContent = response.message || 'Contraseña actualizada correctamente.';
            messageElement.classList.remove('hidden');
        } catch (error) {
            console.error('Error en la solicitud:', error);
            messageElement.textContent = error.message || 'Error al conectar con el servidor.';
            messageElement.classList.remove('hidden');
        }

    });
});