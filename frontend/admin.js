document.addEventListener("DOMContentLoaded", () => {
    cargarCitas();
});
// Intenta mantener la pantalla "despierta" o el proceso activo


async function solicitarWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log("Pantalla bloqueada para que no se duerma el proceso");
        }
    } catch (err) {
        console.log("El sistema no permitió el Wake Lock");
    }
}

// Se activa cuando tocas la pantalla por primera vez
document.addEventListener('click', () => {
    solicitarWakeLock();
    // También activamos un sonido silencioso para que el sistema crea que es un reproductor de música
    const audioSilencioso = new Audio("https://raw.githubusercontent.com/anars/blank-audio/master/10-seconds-of-silence.mp3");
    audioSilencioso.loop = true;
    audioSilencioso.play();
}, { once: true });

// Modifica la parte donde suena la alerta para que también mande notificación de sistema
if (data.length > totalCitasAnterior) {
    sonarAlerta();
    if (Notification.permission === "granted") {
        new Notification("🦶 ¡Nueva Cita!", {
            body: "Un paciente se ha registrado en Podología RV",
            icon: "img/logo.png"
        });
    }
}
// FUNCIÓN DE SONIDO Y VIBRACIÓN
function sonarAlerta() {
    try {
        // 1. Crear el contexto de audio
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = 'sine'; // Sonido limpio
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // Tono agudo
        
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 1);

        // 2. Intentar vibración (solo funciona en celulares Android con Chrome)
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]); 
        }

        console.log("📢 Alerta de nuevo paciente ejecutada");
    } catch (e) {
        console.warn("El navegador bloqueó el audio. Recuerda tocar la pantalla al iniciar.");
    }
}

/* Carga los datos de la API */
// --- 1. CONFIGURACIÓN Y VARIABLES GLOBALES ---
// --- 1. CONFIGURACIÓN Y VARIABLES GLOBALES ---
let totalCitasAnterior = 0;
let wakeLock = null;

// --- 2. GESTIÓN DE NOTIFICACIONES Y SONIDO (CORREGIDO) ---
function sonarAlerta() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
        
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 1);

        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        console.log("📢 Alerta ejecutada");
    } catch (e) {
        console.warn("Audio bloqueado. Toca la pantalla.");
    }
}

async function solicitarWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log("Pantalla bloqueada para evitar suspensión.");
        }
    } catch (err) { console.log("WakeLock no permitido"); }
}

// --- 3. CARGA Y MONITOREO DE DATOS ---
function cargarCitas() {
    const tbody = document.getElementById("tabla-citas");
    if (!tbody) {
        console.error("No se encontró el elemento tabla-citas en el HTML.");
        return;
    }

    fetch("https://clinica-rv-backend-production.up.railway.app/")
        .then(response => response.json())
        .then(data => {
            // Lógica de detección de nuevos pacientes
            if (totalCitasAnterior !== 0 && data.length > totalCitasAnterior) {
                sonarAlerta();
                const ultimo = data[data.length - 1].nombrePaciente;
                
                // Notificación de sistema (globo)
                if (Notification.permission === "granted") {
                    new Notification("🦶 ¡Nueva Cita!", {
                        body: `Paciente: ${ultimo}`,
                        icon: "img/logo.png"
                    });
                }
                alert(`🔔 ¡NUEVA CITA! Paciente: ${ultimo}`);
            }
            totalCitasAnterior = data.length;

            // Renderizado de la tabla
            tbody.innerHTML = "";
            data.forEach(c => {
                const claseEstado = `estado-${c.estado.toLowerCase()}`;
                const fila = document.createElement("tr");
                fila.innerHTML = `  
                    <td>${c.nombrePaciente}</td>
                    <td>${c.telefono}</td>
                    <td>${c.fecha}</td>
                    <td>${c.hora}</td>
                    <td><span class="badge ${claseEstado}">${c.estado}</span></td>
                    <td class="acciones">
                        ${c.estado === "PENDIENTE" ? `
                            <button class="btn-confirmar" onclick="confirmar(${c.id})">✅</button>
                            <button class="btn-cancelar" onclick="cancelar(${c.id})">❌</button>
                            <button class="btn-notas" onclick="abrirFicha(${c.id}, '${c.diagnostico || ""}')">📝</button>
                        ` : ""}
                        <button class="btn-eliminar" onclick="eliminar(${c.id})">🗑</button>
                    </td>
                `;
                tbody.appendChild(fila);
            });
        })
        .catch(error => console.error("Error cargando citas:", error));
}

// --- 4. ACCIONES DEL ADMINISTRADOR ---
function verificarPass() {
    const passIngresada = document.getElementById("admin-pass").value;
    if (passIngresada === "170621") {
        document.getElementById("login-admin").style.display = "none";
        document.getElementById("contenido-admin").style.display = "block";
        cargarCitas();
    } else {
        alert("❌ Contraseña incorrecta");
    }
}

function confirmar(id) {
    fetch(`https://clinica-rv-backend-production.up.railway.app/api/citas/${id}/confirmar`, { method: "PUT" })
    .then(res => res.ok ? cargarCitas() : alert("Error al confirmar"));
}

function cancelar(id) {
    if (!confirm("¿Cancelar?")) return;
    fetch(`https://clinica-rv-backend-production.up.railway.app/api/citas/${id}/cancelar`, { method: "PUT" })
    .then(res => res.ok ? cargarCitas() : alert("Error al cancelar"));
}

function eliminar(id) {
    if (!confirm("¿Eliminar?")) return;
    fetch(`https://clinica-rv-backend-production.up.railway.app/api/citas/${id}`, { method: "DELETE" })
    .then(res => res.ok ? cargarCitas() : alert("Error al eliminar"));
}

async function abrirFicha(id, notaActual) {
    const nuevaNota = prompt("Notas médicas:", notaActual);
    if (nuevaNota !== null) {
        await fetch(`https://clinica-rv-backend-production.up.railway.app/api/citas/${id}/diagnostico`, {
            method: "PUT",
            headers: { "Content-Type": "text/plain" },
            body: nuevaNota
        });
        cargarCitas();
    }
}

// --- 5. INICIALIZACIÓN ---
document.addEventListener("DOMContentLoaded", () => {
    // Si ya estamos logueados o el login no es necesario, cargar citas
    // (Por ahora se activa tras verificarPass)
    
    // Pedir permiso notificaciones
    if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
    }
    
    // Desbloqueo de Audio y WakeLock al primer clic del usuario
    document.addEventListener('click', () => {
        solicitarWakeLock();
        // Truco del audio silencioso para evitar que el navegador suspenda la pestaña
        const audioSilencioso = new Audio("https://raw.githubusercontent.com/anars/blank-audio/master/10-seconds-of-silence.mp3");
        audioSilencioso.loop = true;
        audioSilencioso.play().catch(() => console.log("Audio de fondo esperando interacción"));
    }, { once: true });
});

// Intervalo único de actualización
setInterval(cargarCitas, 20000);