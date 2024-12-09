document.addEventListener('DOMContentLoaded', function () {
    const forgotPasswordLink = document.querySelector('.forgot-password-link');
    const emailInput = document.querySelector('#username');
    const loginErrorElement = document.querySelector('.login-error');

    if (forgotPasswordLink && emailInput && loginErrorElement) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();

            const email = emailInput.value;

            if (!email) {
                loginErrorElement.textContent = 'Por favor, ingrese su correo electrónico antes de hacer clic en "Olvidé mi contraseña".';
                loginErrorElement.classList.add('error-message');
                return;
            }

            fetch('/user/forgotPassword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.status === 'success') {
                        const domainWithPort = `${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}`;
                        const urlParams = new URL(data.data.reset_link);
                        const token = urlParams.searchParams.get('token');
                        const isLocalhost = window.location.hostname === 'localhost';
                        const protocol = isLocalhost ? 'http' : 'https';
                        const resetLink = `${protocol}://${domainWithPort}/user/resetPassword?token=${token}`;
                        console.log(resetLink);
                        // Usar EmailJS para enviar el correo con el enlace
                        emailjs.send('service_ixstcji', 'template_e3i7gwm', {
                                to_email: data.data.to_email,
                                reset_link: resetLink,
                            })
                            .then(response => {
                                loginErrorElement.textContent = 'Se ha enviado un correo con el enlace para restablecer tu contraseña. Por favor, revisa tu bandeja de entrada.';
                                loginErrorElement.classList.remove('error-message');
                                loginErrorElement.classList.add('success-message');
                            })
                            .catch(error => {
                                console.error('Error al enviar el correo:', error);
                                loginErrorElement.textContent = 'Error al enviar el correo. Inténtalo nuevamente. ';
                                loginErrorElement.classList.add('error-message');
                            });
                    } else {
                        loginErrorElement.textContent = `Error: ${data.message}`;
                        loginErrorElement.classList.add('error-message');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    loginErrorElement.textContent = 'Ocurrió un error al procesar tu solicitud.';
                    loginErrorElement.classList.add('error-message');
                });            
        });
    }
});



emailjs.init('P2ymE0jXezSM_YMnM');
