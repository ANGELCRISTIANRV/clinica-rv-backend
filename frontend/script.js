document.addEventListener("DOMContentLoaded", () => {
    const inputFecha = document.getElementById("fecha");
    const selectHora = document.getElementById("hora");

    // Bloquear días pasados para que no elijan fechas viejas
    const hoy = new Date().toISOString().split("T")[0];
    inputFecha.setAttribute("min", hoy);

    // Cuando el usuario elige una fecha...
    inputFecha.addEventListener("change", async () => {
        const fechaSeleccionada = inputFecha.value;
        if (!fechaSeleccionada) return;

        const horarioClinica = ["09:00", "10:00", "11:00", "12:00", "15:00", "16:00", "17:00", "18:00"];

        try {
            // Buscamos las horas ocupadas en tu backend
            const response = await fetch(`http://localhost:8081/api/citas/ocupadas?fecha=${fechaSeleccionada}`);
            const horasOcupadas = await response.json();

            // Limpiamos el selector
            selectHora.innerHTML = '<option value="" disabled selected>Seleccione una hora</option>';

            // Agregamos las horas que están libres
            horarioClinica.forEach(hora => {
                if (!horasOcupadas.includes(hora)) {
                    const option = document.createElement("option");
                    option.value = hora;
                    option.textContent = `⏰ ${hora}`;
                    selectHora.appendChild(option);
                }
            });

        } catch (error) {
            console.error("Error cargando horas:", error);
        }
    });
});

// Función para el botón Reservar
async function reservar(event) {
    if (event) event.preventDefault(); 

    const nombre = document.getElementById("nombre").value;
    const telefono = document.getElementById("telefono").value;
    const fecha = document.getElementById("fecha").value;
    const hora = document.getElementById("hora").value;

    if (!nombre || !telefono || !fecha || !hora) {
        alert("⚠️ Por favor, completa todos los campos.");
        return;
    }

    try {
        const res = await fetch("http://localhost:8081/api/citas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombrePaciente: nombre, telefono, fecha, hora })
        });

        if (res.ok) {
            // 1. Preparamos el mensaje de WhatsApp
            const mensaje = `*Clínica RV* 🦶%0A*Paciente:* ${nombre}%0A*Fecha:* ${fecha}%0A*Hora:* ${hora}`;
            
            // 2. Abrimos WhatsApp ANTES de limpiar el formulario
            window.open(`https://wa.me/936351286?text=${mensaje}`, "_blank");

            // 3. Ahora sí, limpiamos el formulario
            const formulario = document.getElementById("reserva-form");
            if (formulario) {
                formulario.reset();
            }

            // 4. Avisamos al usuario
            alert("✨ ¡Cita agendada con éxito!");
            
        } else {
            alert("🚫 Lo sentimos, este horario ya está ocupado.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("❌ Error al conectar con el servidor.");
    }
}