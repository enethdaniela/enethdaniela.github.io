// Definición de los bloques de tiempo. Puedes agregar o quitar bloques aquí.
const bloques = [
    "07:00 - 08:20", "08:30 - 09:50", "10:00 - 11:20", 
    "11:30 - 12:50", "13:00 - 14:20", "14:30 - 15:50", 
    "16:00 - 17:20", "17:30 - 18:50"
];
const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

let datosHorarios = JSON.parse(localStorage.getItem('horariosPorBloque')) || {};

function inicializarTabla() {
    const tabla = document.getElementById('tabla-horario');
    let html = '<tr><th>Hora</th>';
    dias.forEach(dia => html += `<th>${dia}</th>`);
    html += '</tr>';

    bloques.forEach((bloque, filaIdx) => {
        html += `<tr><td class="td-hora">${bloque}</td>`;
        dias.forEach((dia, colIdx) => {
            html += `<td><input type="checkbox" class="slot-check" id="slot-${filaIdx}-${colIdx}"></td>`;
        });
        html += '</tr>';
    });
    tabla.innerHTML = html;
}

function guardarMiHorario() {
    const nombre = document.getElementById('nombre').value.trim();
    if (!nombre) {
        alert("Por favor ingresa tu nombre primero.");
        return;
    }

    const horarioOcupado = {};
    dias.forEach(dia => horarioOcupado[dia] = []);

    bloques.forEach((bloque, filaIdx) => {
        dias.forEach((dia, colIdx) => {
            const checkbox = document.getElementById(`slot-${filaIdx}-${colIdx}`);
            if (checkbox.checked) {
                horarioOcupado[dia].push(bloque); // Guardamos que está ocupado
            }
        });
    });

    datosHorarios[nombre] = horarioOcupado;
    localStorage.setItem('horariosPorBloque', JSON.stringify(datosHorarios));
    
    alert(`¡Horario de ${nombre} guardado exitosamente!`);
    document.getElementById('nombre').value = '';
    
    // Desmarcar todos los checkboxes para el siguiente usuario
    document.querySelectorAll('.slot-check').forEach(cb => cb.checked = false);
    actualizarUI();
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
        localStorage.setItem('horariosPorBloque', JSON.stringify(datosHorarios));
        document.getElementById('resultados').innerHTML = '';
        actualizarUI();
    }
}

function compararHorarios() {
    const checkboxes = document.querySelectorAll('#selector-comparacion input:checked');
    const seleccionadas = Array.from(checkboxes).map(cb => cb.value);

    if (seleccionadas.length < 1) {
        alert("Selecciona al menos una persona para comparar.");
        return;
    }

    const resultadosDiv = document.getElementById('resultados');
    resultadosDiv.innerHTML = `<h3>Huecos libres en común:</h3>`;

    let huboCoincidencias = false;

    dias.forEach(dia => {
        let bloquesLibresDelDia = [];

        // Evaluamos cada bloque de tiempo
        bloques.forEach(bloque => {
            let bloqueOcupadoPorAlguien = false;

            seleccionadas.forEach(nombre => {
                if (datosHorarios[nombre][dia].includes(bloque)) {
                    bloqueOcupadoPorAlguien = true;
                }
            });

            // Si nadie lo tiene ocupado, es un hueco libre para el grupo
            if (!bloqueOcupadoPorAlguien) {
                bloquesLibresDelDia.push(bloque);
            }
        });

        if (bloquesLibresDelDia.length > 0) {
            huboCoincidencias = true;
            let htmlBloques = bloquesLibresDelDia.map(b => `<span class="bloque-libre">${b}</span>`).join(' ');
            resultadosDiv.innerHTML += `
                <div class="dia-libre">
                    <strong>${dia}:</strong> <br> ${htmlBloques}
                </div>
            `;
        }
    });

    if (!huboCoincidencias) {
        resultadosDiv.innerHTML += `<p>No se encontraron horas libres en común con las personas seleccionadas. 😢</p>`;
    }
}

// Inicializar la tabla y la UI al cargar la página
inicializarTabla();
actualizarUI();
