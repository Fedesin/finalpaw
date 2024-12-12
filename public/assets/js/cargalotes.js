function validarEntero(e) {
    var key = e.charCode;

    if((e.target.value == '') && (key == 45))
        return true;

    return (key >= 48 && key <= 57);
}

function editarLote(event) {
    const loteId = event.target.getAttribute("data-id");
    const row = event.target.closest("tr");

    if (row.nextElementSibling && row.nextElementSibling.classList.contains("fase-form")) {
        row.nextElementSibling.remove();
        return;
    }

    Fases.getAttributes({ lote_id: loteId })
        .then(data => {
            if (data.success) {
                mostrarFormularioFase(row, data.atributos, loteId);
            } else {
                console.error("Error al obtener los atributos de la fase:", data.message);
            }
        })
        .catch(error => console.error("Error en la solicitud para obtener los atributos de la fase:", error));
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.attribute-input[type=number].entero').forEach(function(input) {
        input.addEventListener('keypress', function(e) {
            if(!validarEntero(e))
                e.preventDefault();
        });
    });

    document.querySelectorAll('input[type=checkbox]').forEach(function(input) {
        input.addEventListener('change', function(e) {
            e.target.value = e.target.checked ? 1 : 0;
        });
    });

    const forms = document.querySelectorAll(".form-pasar-fase");

    forms.forEach(form => {
        form.addEventListener("submit", function(event) {
            event.preventDefault();  // Evita la acción predeterminada del formulario

            const formData = new FormData(form);

            // Hacer la solicitud AJAX con el método POST
            fetch('/lotes/pasarFase', {
                method: 'POST',
                body: formData
            }).then(() => {
                // Recargar la página después de que la solicitud haya sido completada
                window.location.reload();
            })
        });
    });
});

const forms = document.getElementsByClassName('updateForm');
const mensaje = document.querySelector('.mensaje');
Array.from(forms).forEach(form => {
    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        const formData = new FormData(form);

        try {
            const response = await fetch('/update_attributes', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                mostrarMensaje('Datos actualizados correctamente', 'success');
                console.log(result);
            } else {
                const errorData = await response.json();
                mostrarMensaje('Error al actualizar los datos', 'error');
                console.log(errorData);
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            mostrarMensaje('Error en la solicitud', 'error');
        }
    });
});


