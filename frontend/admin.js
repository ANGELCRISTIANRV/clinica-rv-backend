document.addEventListener("DOMContentLoaded", () => {
    cargarCitas();
});

/* Carga los datos de la API */
function cargarCitas() {
    fetch("http://localhost:8081/api/citas")
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById("tabla-citas");
            if (!tbody) return;
            
            tbody.innerHTML = "";

            data.forEach(c => {
                // Definimos una clase CSS según el estado para el color del texto/badge
                const claseEstado = `estado-${c.estado.toLowerCase()}`;
                
                const fila = document.createElement("tr");
                // Verificamos si hay diagnóstico; si no, ponemos un texto sutil
const textoDiagnostico = c.diagnostico ? c.diagnostico : '<span style="color: #ccc;">Sin notas</span>';
                fila.innerHTML = `  
                    <td>${c.nombrePaciente}</td>
                    <td>${c.telefono}</td>
                    <td>${c.fecha}</td>
                    <td>${c.hora}</td>
                    <td><span class="badge ${claseEstado}">${c.estado}</span></td>
                    <td class="acciones">
                        ${c.estado === "PENDIENTE" ? `
                            <button class="btn-confirmar" onclick="confirmar(${c.id}, '${c.nombrePaciente}', '${c.telefono}')">
                                ✅ Confirmar
                            </button>
                            <button class="btn-cancelar" onclick="cancelar(${c.id}, '${c.nombrePaciente}', '${c.telefono}')">
                                ❌ Cancelar
                            </button>

<button class="btn-notas" title="Ficha Clínica" onclick="abrirFicha(${c.id}, '${c.diagnostico || ""}')">
    📝
</button>

                        ` : ""}
                        <button class="btn-eliminar" onclick="eliminar(${c.id})">
                            🗑 Eliminar
                        </button>
                    </td>
                `;
                tbody.appendChild(fila);
            });
        })
        .catch(error => console.error("Error:", error));
}

/* Funciones de acción (se mantienen igual en lógica, mejoradas en flujo) */
function confirmar(id, nombre, telefono) {
    fetch(`http://localhost:8081/api/citas/${id}/confirmar`, { method: "PUT" })
    .then(response => {
        if (response.status === 409) return alert("⛔ Horario ya ocupado por otra cita confirmada");
        if (!response.ok) return alert("Error al confirmar");

        enviarWhatsApp(nombre, telefono, "CONFIRMADA ✅");
        location.reload();
    });
}

function cancelar(id, nombre, telefono) {
    if (!confirm("¿Cancelar esta cita?")) return;

    fetch(`http://localhost:8081/api/citas/${id}/cancelar`, { method: "PUT" })
    .then(response => {
        if (!response.ok) return alert("Error al cancelar");
        
        enviarWhatsApp(nombre, telefono, "CANCELADA ❌. Para reprogramar escríbanos por favor.");
        location.reload();
    });
}

function eliminar(id) {
    if (!confirm("¿Eliminar definitivamente de la base de datos?")) return;
    fetch(`http://localhost:8081/api/citas/${id}`, { method: "DELETE" })
    .then(res => res.ok ? location.reload() : alert("Error al eliminar"));
}

function enviarWhatsApp(nombre, telefono, estadoTexto) {
    const mensaje = `Hola ${nombre}, su cita en Clínica RV ha sido ${estadoTexto}`;
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
}

async function abrirFicha(id, notaActual) {
    const nuevaNota = prompt("Notas médicas / Diagnóstico:", notaActual);
    
    if (nuevaNota !== null) {
        try {
            const res = await fetch(`http://localhost:8081/api/citas/${id}/diagnostico`, {
                method: "PUT",
                headers: { "Content-Type": "text/plain" },
                body: nuevaNota
            });

            if (res.ok) {
                alert("✅ Ficha actualizada correctamente");
                location.reload(); // Recargar para ver los cambios
            }
        } catch (error) {
            alert("Error al guardar la nota médica");
        }
    }
}