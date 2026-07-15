// Estructura de datos almacenada en localStorage
let datosHorarios = JSON.parse(localStorage.getItem('horarios')) || {};
const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

// Rango universitario estándar (7:00 a 20:00 en minutos)
const HORA_INICIO_DIA = 7 * 60; 
const HORA_FIN_DIA = 20 * 60; 

function guardarDatos() {
    localStorage.setItem('horarios', JSON.stringify(datosHorarios));
    actualizarUI();
}

function convertirAMinutos(horaStr) {
    const [horas, minutos] = horaStr.split(':').map(Number);
    return horas * 60 + minutos;
}

function convertirAHora(minutosTotales) {
    const horas = Math.floor(minutosTotales / 60);
    const mins = minutosTotales % 60;
    return `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

function agregarClase() {
    const nombre = document.getElementById('nombre').value.trim();
    const dia = document.getElementById('dia').value;
    const inicio = document.getElementById('hora-inicio').value;
    const fin = document.getElementById('hora-fin').value;

    if (!nombre || !inicio || !fin) {
        alert("Por favor llena todos los campos.");
        return;
    }

    if (!datosHorarios[nombre]) {
        datosHorarios[nombre] = {};
        diasSemana.forEach(d => datosHorarios[nombre][d] = []);
    }

    const minInicio = convertirAMinutos(inicio);
    const minFin = convertirAMinutos(fin);

    if (minInicio >= minFin) {
        alert("La hora de inicio debe ser menor a la hora de fin.");
        return;
    }

    datosHorarios[nombre][dia].push({ inicio: minInicio, fin: minFin });
    guardarDatos();
    document.getElementById('hora-inicio').value = '';
    document.getElementById('hora-fin').value = '';
}

function actualizarUI() {
    const listaUsuarios = document.getElementById('lista-usuarios');
    const selector = document.getElementById('selector-comparacion');
    
    listaUsuarios.innerHTML = '';
    selector.innerHTML = '';

    Object.keys(datosHorarios).forEach(nombre => {
        // Mostrar en lista
        const badge = document.createElement('span');
        badge.className = 'badge';
        badge.innerText = nombre;
        listaUsuarios.appendChild(badge);

        // Agregar al selector
        const label = document.createElement('label');
        label.innerHTML = `<input type="checkbox" value="${nombre}" checked> ${nombre}`;
        selector.appendChild(label);
    });
}

function limpiarDatos() {
    if(confirm("¿Estás segura de borrar todos los horarios?")) {
        datosHorarios = {};
        guardarDatos();
        document.getElementById('resultados').innerHTML = '';
    }
}

function compararHorarios() {
    const checkboxes = document.querySelectorAll('#selector-comparacion input:checked');
    const seleccionadas = Array.from(checkboxes).map(cb => cb.value);

    if (seleccionadas.length < 1) {
        alert("Selecciona al menos una persona para ver sus huecos libres.");
        return;
    }

    const resultadosDiv = document.getElementById('resultados');
    resultadosDiv.innerHTML = `<h3>Huecos libres para: ${seleccionadas.join(', ')}</h3>`;

    diasSemana.forEach(dia => {
        // Crear una línea de tiempo (array) para el día, marcando todo como libre (false)
        let lineaDeTiempo = new Array(HORA_FIN_DIA - HORA_INICIO_DIA).fill(false);

        // Marcar los minutos ocupados de las personas seleccionadas
        seleccionadas.forEach(nombre => {
            const clases = datosHorarios[nombre][dia];
            clases.forEach(clase => {
                for (let i = clase.inicio; i < clase.fin; i++) {
                    if (i >= HORA_INICIO_DIA && i < HORA_FIN_DIA) {
                        lineaDeTiempo[i - HORA_INICIO_DIA] = true; // true = ocupado
                    }
                }
            });
        });

        // Buscar bloques de tiempo libre continuos
        let bloquesLibres = [];
        let inicioLibre = null;

        for (let i = 0; i <= lineaDeTiempo.length; i++) {
            const minutoActualOcupado = lineaDeTiempo[i] || i === lineaDeTiempo.length;
            
            if (!minutoActualOcupado && inicioLibre === null) {
                inicioLibre = i; 
            } else if (minutoActualOcupado && inicioLibre !== null) {
                const duracion = i - inicioLibre;
                if (duracion >= 30) { // Mostrar solo huecos de al menos 30 min
                    bloquesLibres.push({
                        inicio: inicioLibre + HORA_INICIO_DIA,
                        fin: i + HORA_INICIO_DIA
                    });
                }
                inicioLibre = null;
            }
        }

        // Imprimir resultados
        if (bloquesLibres.length > 0) {
            let htmlBloques = bloquesLibres.map(b => 
                `<strong>${convertirAHora(b.inicio)} - ${convertirAHora(b.fin)}</strong>`
            ).join(' | ');
            
            resultadosDiv.innerHTML += `
                <div class="dia-libre">
                    <strong>${dia}:</strong> ${htmlBloques}
                </div>
            `;
        }
    });
}

// Inicializar interfaz
actualizarUI();