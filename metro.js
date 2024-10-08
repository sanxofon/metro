// metro.js
// Autor: Santiago Chávez Novaro
// Código Libre: Haz lo que quieras

// Elementos del DOM --------------------------------------------

// Botón Play
const startButton = document.getElementById('startButton');
// Botón Stop
const stopButton = document.getElementById('stopButton');
// Cuadro de texto del Patrón
const beatPatternInput = document.getElementById('beatPattern');
// Select entet Beats o Compases por minuto
const bpmcpm = document.getElementById('BPM-CPM');
// Input numérico de los BPM o CPM
const bpmInput = document.getElementById('bpmInput');
// Slider de Velocidad (Cambia los BPM o CPM)
const bpmSlider = document.getElementById('bpmSlider');
// Muestra el pulso actual
const beatCounter = document.querySelector('.beat-counter');
// El "reloj" circular
const clock = document.querySelector('.clock');
// "Manecilla" del círculo
const hourHand = document.querySelector('.hour-hand');
// Slider de volumen
const volumeSlider = document.getElementById('volumen');
// Grid del Mute de Golpes
const grid = document.getElementById('numberGrid');
// Div del ícono de Mutear Todos
const muteIcon = document.getElementById('mute-icon');
//  Elemento para mostrar la longitud del patrón
const patternLenDiv = document.getElementById('patternLen'); 
// Botón para vaciar el historial de patrones
const vaciarHistorial = document.getElementById('vaciarHistorial'); 
// Select de presets
const presetsSelect = document.getElementById('presets');

// TECLADO
const teclas = document.querySelectorAll('.teclado .boton');
// Botonera
const botonera = document.querySelectorAll('.botonera button');


// SETTINGS
//  Modal de configuración:  obtener los elementos
const settingsIcon = document.querySelector('.settings-icon');
const modal = document.getElementById("settingsModal");
const spanClose = document.getElementsByClassName("close")[0];

//  DARK/LIGHT MODE SWITCH
const darkModeSwitch = document.getElementById('darkModeSwitch');
const body = document.body;

// variables ---------------------------------------------------------

// Valores por defecto de la UI
let beatPattern = localStorage.getItem('beatPattern') || 'ABA0'; // Default Patrón de golpes
let bpm = parseInt(localStorage.getItem('bpm')) || 100; // Default BPM/CPM
let isCPM = parseInt(localStorage.getItem('isCPM')) || 0; // Estamos en Compases Por Minuto? Default: 0
let volumen = parseFloat(localStorage.getItem('volumen')) || 1; // Volumen. Default 1=Max.
let selectedNumbers = JSON.parse(localStorage.getItem('selectedNumbers')) || []; // Números silenciados. Default: ninguno.
let darkMode = parseInt(localStorage.getItem('darkMode')) || 0; // Modo oscuro DARK MODE

// Variables globales
let bitperbeat = 1; // El estándar sería 4 para corchea
let beatsPerMeasure = beatPattern.length; // Beats por compás (calculado inicialmente del patrón por defecto)
let millisecondsPerBeat = 60000/(bpm*bitperbeat); // Milisegundos por beat (calculado inicialmente del BPM por defecto)
let isplaying = false; // Estado del metrónomo (iniciado o detenido)
let currentBeat = 0; // Índice del beat actual dentro del patrón
let intervalId; // ID del intervalo para controlarlo
let soundAllowed = false; // Está permitido el sonido ya? Maldito IPhone

// Esta es la API que monté que acepta POST y GET de cualquier servidor para guardar las claves colectivamente.
// Obvio me reservo el derecho a borrar repeticiones y basura.
const APIURL = "https://"+"lengua.la/metro/api/api.php";

// Actualiza la UI con los valores por defecto
bpmInput.value = bpm;
bpmSlider.value = bpm;
beatPatternInput.value = beatPattern;
bpmcpm.value = isCPM;
volumeSlider.value = volumen;
setSliderBPMMax();

//  DARK/LIGHT MODE SWITCH
if (darkMode>0) {
  body.classList.add('dark-mode');
  darkModeSwitch.checked = true; 
}

// Traducciones entre LETRAS (cadena) y números (lista)
const traduccionN2T = {
  0:'0',
  1:'A',
  2:'B',
  3:'C',
  4:'D',
  5:'E',
  6:'F',
  7:'G',
  8:'H',
  9:'I',
};
const traduccionT2N = {
  '0':0,
  'A':1,
  'B':2,
  'C':3,
  'D':4,
  'E':5,
  'F':6,
  'G':7,
  'H':8,
  'I':9,
};
function transN2T(n) { // Recibe una lista de números
  console.log("N:",n);
  let t = [];
  for (let i = 0; i < n.length; i++) {
    t.push(traduccionN2T[n[i]]);
  }
  console.log("T:",t);
  return t.join(''); // Regresa una cadena de mayúsculas
}
function transT2N(s) { // Recibe una cadena de mayúsculas
  let n = [];
  const t = s.toUpperCase().replace(/[^A-I0]/g, '').split('');
  for (let i = 0; i < t.length; i++) {
    n.push(traduccionT2N[t[i]]);
  }
  return n; // regresa una lista de números
}
let listPattern = transT2N(beatPattern); // Default lista de golpes en números

// ---------------------------------------------------
// Funciones -----------------------------------------

// Guarda la configuración actual en localStorage
function saveSettings() {
  localStorage.setItem('beatPattern', beatPattern);
  localStorage.setItem('bpm', bpm);
  localStorage.setItem('isCPM', isCPM);
  localStorage.setItem('volumen',volumen);
  localStorage.setItem('selectedNumbers', JSON.stringify(selectedNumbers));
  localStorage.setItem('darkMode', darkMode);
}

// Crea las marcas de hora en el reloj circular
function createHourMarks(beatsPerMeasure) {
  // Borra las marcas existentes
  const elementsToDelete = document.querySelectorAll('.hour-mark');
  elementsToDelete.forEach(element => element.remove());
  
  // Crea nuevas marcas según el número de beats por compás
  for (let i = 0; i < beatsPerMeasure; i++) {
    const hourMark = document.createElement('div');
    hourMark.classList.add('hour-mark');
    // Asigna color según el tipo de beat (del patrón)
    if(listPattern[i]>0 && !selectedNumbers.includes(listPattern[i])) {
      hourMark.classList.add('beat'+listPattern[i]);
    }
    
    // Calcula el ángulo y rota la marca
    const angle = (i / beatsPerMeasure) * 360;
    hourMark.style.transform = `rotate(${angle}deg)`;
    clock.appendChild(hourMark);
  }
}

// Actualiza la posición de la manecilla del reloj y el contador de beat
function updateClock(beatsPerMeasure) {
  const hourAngle = (currentBeat / beatsPerMeasure) * 360; // Ángulo basado en el beat actual
  beatCounter.innerText = currentBeat+1; // Actualiza el contador de beat en la UI
  hourHand.style.transform = `rotate(${hourAngle}deg)`; // Rota la manecilla
}

// Carga los sonidos usando Howler.js
let sound = [];
for(var i = 0 ; i<base64Beat.length;i++){
  sound.push(new Howl({
    src: base64Beat[i],
    preload: true 
    //src: ['https://s3-us-west-2.amazonaws.com/s.cdpn.io/3/success.mp3']
  }));
}

// Reproduce un sonido según el beat (si no está silenciado)
function playBeat(beat) {
  if(beat>0 && !selectedNumbers.includes(beat)) {
    sound[beat-1].play();
  }
}

// Inicia el metrónomo
function startMetronome() {
  isplaying = true; // Actualiza el estado del metrónomo
  beatPattern = beatPatternInput.value.toUpperCase().replace(/[^A-I0]/g, '');
  listPattern = transT2N(beatPattern);
  beatsPerMeasure = beatPattern.length; //  Recalcula beats por compás
  patternLenDiv.innerHTML = beatsPerMeasure; //  Actualiza el div con la longitud
  createHourMarks(beatsPerMeasure);
  // Ajusta ms por beat si estamos en CPM
  if(isCPM>0) { // CPM
    millisecondsPerBeat = 60000/(bpm*beatsPerMeasure); // Calcula ms por beat
  } else { // BPM
    millisecondsPerBeat = 60000/(bpm*bitperbeat); // 4/4 standard
  }
  saveSettings(); // Guarda la configuración actual
  
  // createHourMarks(beatsPerMeasure); // Crea las marcas de hora en el reloj
  
  
  // Inicia el intervalo para la reproducción de los beats
  intervalId = setInterval(() => {
    playBeat(listPattern[currentBeat]); // Reproduce el sonido del beat actual
    
    updateClock(beatsPerMeasure); // Actualiza el reloj
    
    currentBeat = (currentBeat + 1) % beatsPerMeasure; // Avanza al siguiente beat
  }, millisecondsPerBeat);
  
  // Actualiza el estado de los botones
  startButton.disabled = true;
  stopButton.disabled = false;
}

// Detiene el metrónomo
function stopMetronome() {
  clearInterval(intervalId); // Detiene el intervalo
  isplaying = false; // Actualiza el estado del metrónomo
  startButton.disabled = false; // Actualiza el estado de los botones
  stopButton.disabled = true;
  currentBeat = 0; // Reinicia el índice del beat actual
}

// Reinicia el metrónomo si hay un intervalo activo
function startIfIntervalId() {
  if (intervalId) {
    clearInterval(intervalId); // Detiene el intervalo actual
    if(isplaying) {
      startMetronome(); // Reinicia el metrónomo si estaba en reproducción
    }
  }  
}

// Función para silenciar/desilenciar un número
function toggleSelect(event) {
  const square = event.target;
  const number = traduccionT2N[square.textContent];
  // Actualiza el estado del número y el array de números silenciados
  if (square.classList.contains('selected')) {
    square.classList.remove('selected');
    selectedNumbers = selectedNumbers.filter(n => n !== number);
  } else {
    square.classList.add('selected');
    selectedNumbers.push(number);
  }
  createHourMarks(beatsPerMeasure); // Crea las marcas de hora en el reloj
  saveSettings(); // Guarda la configuración
}

// Función para seleccionar/deseleccionar todos los números
function toggleSelectAll() {
  const squares = document.querySelectorAll('.square'); 
  const firstSquare = squares[0]; // Obtiene el primer cuadrado
  
  // Comprueba si el primer cuadrado está seleccionado
  if (firstSquare.classList.contains('selected')) {
    // Deselecciona todos
    squares.forEach(square => {
      square.classList.remove('selected');
      const number = traduccionT2N[square.textContent];
      selectedNumbers = selectedNumbers.filter(n => n !== number);
    });
  } else {
    // Selecciona todos
    squares.forEach(square => {
      square.classList.add('selected');
      const number = traduccionT2N[square.textContent];
      if (!selectedNumbers.includes(number)) { //  Evita duplicados
        selectedNumbers.push(number);
      }
    });
  }
  createHourMarks(beatsPerMeasure); // Crea las marcas de hora en el reloj
  saveSettings(); // Guarda la configuración
}

// Actualiza el historial de patrones en localStorage
function updateHistoryPattern(pattern) {
  // Obtiene el historial actual (o crea uno nuevo si no existe)
  let historyPattern = localStorage.getItem('historyPattern');
  if (historyPattern) {
    historyPattern = JSON.parse(historyPattern); 
  } else {
    historyPattern = []; 
  }
  
  // Elimina duplicados y agrega el nuevo patrón al inicio
  const existingIndex = historyPattern.indexOf(pattern);
  if (existingIndex !== -1) {
    historyPattern.splice(existingIndex, 1); 
  }
  historyPattern.unshift(pattern); 
  
  // Guarda el historial actualizado
  localStorage.setItem('historyPattern', JSON.stringify(historyPattern));
}

// Obtiene el siguiente (o anterior) patrón del historial
function getHistoryNext(rev=0) {
  let historyPattern = localStorage.getItem('historyPattern');
  if (historyPattern) {
    historyPattern = JSON.parse(historyPattern);
    let currentIndex = parseInt(localStorage.getItem('historyIndex')) || 0; 
    
    if (rev!=0) {
      // Retrocede el índice, volviendo al final del historial al llegar a 0
      currentIndex = (currentIndex - 1 + historyPattern.length) % historyPattern.length; 
      localStorage.setItem('historyIndex', currentIndex); 
    } else {
      // Avanza el índice, volviendo a 0 al final del historial
      currentIndex = (currentIndex + 1) % historyPattern.length;
      localStorage.setItem('historyIndex', currentIndex);
    }
    return historyPattern[currentIndex]; 
  } 
  return null; 
}

//  Función para actualizar el select "historial" con los patrones
/* function updateHistorySelect() {
const historialSelect = document.getElementById('historial');
historialSelect.innerHTML = ''; //  Limpia las opciones existentes

let historyPattern = localStorage.getItem('historyPattern');
if (historyPattern) {
historyPattern = JSON.parse(historyPattern);

//  Trunca el historial a 100 elementos si es más largo
if (historyPattern.length > 100) {
historyPattern = historyPattern.slice(0, 100);
}

//  Crea las opciones del select
historyPattern.forEach(pattern => {
  const option = document.createElement('option');
option.value = pattern;
option.textContent = (pattern.length<10 ? " "+pattern.length:pattern.length) + ': ' + pattern;
historialSelect.appendChild(option);
});
}
} */
function updateHistoryDiv() {
  const historialDiv = document.getElementById('historial');
  historialDiv.innerHTML = ''; // Limpia los enlaces existentes
  
  let historyPattern = localStorage.getItem('historyPattern');
  if (historyPattern) {
    historyPattern = JSON.parse(historyPattern);
    
    // Trunca el historial a 100 elementos si es más largo
    if (historyPattern.length > 100) {
      historyPattern = historyPattern.slice(0, 100);
    }
    
    // Crea los enlaces dentro del div
    historyPattern.forEach(pattern => {
      const link = document.createElement('div');
      link.textContent = (pattern.length<10 ? " "+pattern.length:pattern.length) + ': ' + pattern;
      
      // Agrega la clase 'history-link' para estilizar 
      link.classList.add('patron'); 
      
      // Agrega un evento click a cada enlace
      link.addEventListener('click', () => {
        // Lógica que se ejecutaba al seleccionar una opción del select
        // Aquí debes reemplazar con tu código específico 
        setPatron(pattern,true);
      });
      
      historialDiv.appendChild(link);
    });
  }
}

function setPatron(pattern,setInput=true) {
  beatPattern = pattern.toUpperCase().replace(/[^A-I0]/g, '');  //  Actualiza la variable beatPattern
  if(setInput) beatPatternInput.value = pattern; //  Inserta el patrón en el input
  listPattern = transT2N(beatPattern);
  beatsPerMeasure = beatPattern.length; //  Recalcula beats por compás
  patternLenDiv.innerHTML = beatsPerMeasure; //  Actualiza el div con la longitud
  updateHistoryPattern(beatPattern); // Actualiza el historial de patrones
  // updateHistorySelect(); // Actualiza el select del historial
  updateHistoryDiv(); // Actualiza la lista del historial
  createHourMarks(beatsPerMeasure);
  startIfIntervalId(); // Reinicia el metrónomo
}

// Revuelve una cadena al azar
function shuffleString(str) {
  const arr = str.split(''); // Split into an array of characters
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Random index
    [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap elements
  }
  return arr.join(''); // Join back into a string
}
// Genera un patrón azaroso entre min y max con una proporción de ceros
function generateRandomPattern(minLength, maxLength, zeroProportion) {
  const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
  const numZeros = Math.floor(length * zeroProportion);
  let pattern = '';
  let zerosAdded = 0;
  for (let i = 0; i < length; i++) {
    if (zerosAdded < numZeros && Math.random() < 0.9) {
      pattern += '0';
      zerosAdded++;
    } else {
      pattern += String.fromCharCode(Math.floor(Math.random() * 9) + 65); // A-I
    }
  }
  return shuffleString(pattern);
}


function updatePatternLen() {
  beatPattern = beatPatternInput.value.toUpperCase().replace(/[^A-I0]/g, '');
  listPattern = transT2N(beatPattern);
  beatsPerMeasure = beatPattern.length;
  patternLenDiv.innerHTML = beatsPerMeasure; //  Actualiza el div con la longitud
}

// API
function fechaMexico(timestamp) {
  // Validar si el timestamp es un número válido
  if (isNaN(timestamp) || timestamp <= 0) {
    return "-fecha inválida-";
  }
  let fechaMexico = new Date(timestamp * 1000);
  let opciones = { day: 'numeric', month: 'numeric', year: 'numeric' };
  return fechaMexico.toLocaleDateString('es-MX', opciones);
}
function enviarPatron(patronRitmico) {
  // Preguntar al usuario por el nombre de la clave
  var nombreClave = prompt("Introduce un nombre para este patrón:");
  if(nombreClave==undefined) return;
  // Validaciones y reemplazos regex para asegurar compatibilidad con la API
  nombreClave = nombreClave.replace(/[^a-z0-9\-_ ,.áéíóúüñ]/ig, '') // Eliminar caracteres inválidos
  .trim() // Eliminar espacios al inicio y final
  .substring(0, 50); // Limitar a 50 caracteres
  
  patronRitmico = patronRitmico.toUpperCase() // Convertir a mayúsculas
  .replace(/[^A-I0]/g, '') // Eliminar caracteres inválidos
  .substring(0, 100); // Limitar a 100 caracteres
  
  // Verificar si se obtuvieron valores válidos
  if (nombreClave.length >= 5 && patronRitmico.length >= 4) {
    // Crear un objeto FormData para enviar los datos
    var formData = new FormData();
    formData.append("n", nombreClave);
    formData.append("p", patronRitmico);
    
    // Enviar la solicitud POST a la API
    fetch(APIURL, {
      method: "POST",
      body: formData
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(response.error);
      }
      return response.json();
    })
    .then(data => {
      // Manejar la respuesta de la API (por ejemplo, mostrar un mensaje de éxito)
      document.getElementById('resultado').innerText = data['mensaje'];
      setTimeout(function(){
        document.getElementById('resultado').innerText='';
        // cargarPatrones(1);
      },5000);
    })
    .catch(error => {
      // Manejar errores de la solicitud
      console.error('Error:', error);
      document.getElementById('resultado').innerText = 'Hubo un error. Inténtelo de nuevo en unos segundos.';
      setTimeout("document.getElementById('resultado').innerText=''",3000);
    });
  } else {
    // Mostrar un mensaje de error si los valores no son válidos
    alert("Nombre de clave o patrón rítmico inválidos. Revise su formato.");
  }
}
function agregarPatronesMemoria(patrones) {
  // Obtener el elemento select del contenedor
  var contenedor = document.getElementById("memoria");
  // Limpiar cualquier opción previa en el contenedor
  contenedor.innerHTML = '';
  // Iterar sobre la lista de patrones recibidos
  patrones.forEach(patron => {
    // Crea los enlaces dentro del div
    const link = document.createElement('div');
    link.textContent = patron[1]+' ['+patron[2].length+': '+patron[2]+'] ('+fechaMexico(patron[0])+')';
    // Agrega la clase 'history-link' para estilizar 
    link.classList.add('patron');
    // Agrega un evento click a cada enlace
    link.addEventListener('click', () => {
      setPatron(patron[2],true);
      modal.style.display = "none";
    });
    contenedor.appendChild(link);
  });
}
function cargarPatrones(pag=1) {
  // Realizar la petición GET a la API con el número de página
  fetch(APIURL+`?i=${pag}`)
  .then(response => {
    if (!response.ok) {
      const patrones = localStorage.getItem('patrones');
      if (patrones) {
        agregarPatronesMemoria(JSON.parse(memoriaPatrones));
      }
      throw new Error('Error en la solicitud.');
    }
    return response.json();
  })
  .then(patrones => {
    agregarPatronesMemoria(patrones);
    localStorage.setItem('memoriaPatrones', JSON.stringify(patrones));
  })
  .catch(error => {
    // Manejar errores de la solicitud
    console.error('Error:', error);
    document.getElementById('resultado').innerText = 'Hubo un error al cargar los patrones. Por favor, inténtalo de nuevo.';
    // alert("Hubo un error al cargar los patrones. Por favor, inténtalo de nuevo.");
  });
}

// BOTONERA
function recorrerPatron(dir = 0) {
  if (dir === 0) { // Izquierda
    beatPattern = beatPattern.slice(1) + beatPattern[0];
  } else { // Derecha
    beatPattern = beatPattern.slice(-1) + beatPattern.slice(0, -1);
  }
  setPatron(beatPattern,true);
}

// Abrir modal de Memoria e Historial
function showSettings() {
  cargarPatrones(1);
  modal.style.display = "block";
}

// -----------------------------------------------------------
// AQUÍ VIENEN LOS LISTENERS ---------------------------------

// Listeners DE LOS BOTONES PRINCIPALES

// Actualiza el BPM cuando se cambia el input de texto
bpmInput.addEventListener('input', () => {
  const testBPM = parseInt(bpmInput.value);
  if (bpmInput.value=='' || testBPM<=0) {
    bpm = 1;
  } else {
    bpm = testBPM;
  }
  bpmSlider.value = bpm;
  startIfIntervalId(); // Reinicia el metrónomo
});

// Actualiza el BPM cuando se cambia el slider
bpmSlider.addEventListener('input', () => {
  bpm = parseInt(bpmSlider.value);
  bpmInput.value = bpm;
  startIfIntervalId(); // Reinicia el metrónomo
});
function setSliderBPMMax() {
  bpmSlider.setAttribute('max',(isCPM ? '120':'1440')); // Modifica el máximo del slider para BPM/CPM
  bpmSlider.value = bpm; // Modifica el máximo del slider para BPM/CPM
} 

// Actualiza el modo BPM/CPM cuando se cambia el select
bpmcpm.addEventListener('input', () => {
  const tmpBC = parseInt(bpmcpm.value);
  if (tmpBC!=isCPM) {
    isCPM = tmpBC;
    bpmcpm.value = isCPM;
    bpm = parseInt(isCPM ? bpm/beatsPerMeasure:bpm*beatsPerMeasure);
    bpmInput.value = bpm;
    setSliderBPMMax();
    startIfIntervalId(); // Reinicia el metrónomo
  }
});

// Actualiza el volumen general cuando se cambia el slider
volumeSlider.addEventListener('input', () => {
  volumen = parseFloat(volumeSlider.value);
  sound.forEach(s => s.volume(volumen)); // Actualiza el volumen de todos los sonidos
  saveSettings(); // Guarda la configuración
});

// Inicia el metrónomo al hacer clic en el botón de inicio
startButton.addEventListener('click', () => {
  if (!soundAllowed) {
    // First time click, request permission and start metronome
    sound[0].play(); // This will trigger the browser's autoplay permission prompt
    soundAllowed = true; // Mark sound as allowed
  }
  startMetronome();
});

// Detiene el metrónomo al hacer clic en el botón de detener
stopButton.addEventListener('click', stopMetronome);

// Crea los Cuadros de Números de 1-9 (para silenciar)
for (let i = 1; i <= 9; i++) {
  const square = document.createElement('div');
  square.classList.add('square');
  square.classList.add('beat'+i);
  square.textContent = traduccionN2T[i];
  square.addEventListener('click', toggleSelect); // Agrega el listener para cambiar el estado de silenciado
  grid.appendChild(square);
  if (selectedNumbers.includes(i)) {
    square.classList.add('selected'); // Marca como silenciado si está en el array
  }
}

// Cuando hay cambios en el input de patrón
beatPatternInput.addEventListener('input', (event) => {
  setPatron(beatPatternInput.value.toUpperCase().replace(/[^A-I0]/g, ''),false);
});
beatPatternInput.addEventListener('change', (event) => {
  beatPatternInput.value = beatPatternInput.value.toUpperCase().replace(/[^A-I0 ]/g, '');
});
// Actualiza el patrón de beats cuando se cambia el input de texto
beatPatternInput.addEventListener('keyup', (event) => { 
  const allowedChars = /^[a-z0-9A-Z]$/i;
  // Navega por el historial de patrones con las flechas arriba/abajo
  if (event.key === 'ArrowUp') {
    event.preventDefault(); 
    const previousString = getHistoryNext(1); // Obtiene el patrón anterior
    if (previousString !== null) {
      setPatron(previousString);
    }
  } else if (event.key === 'ArrowDown') {
    event.preventDefault(); 
    const nextString = getHistoryNext(); // Obtiene el siguiente patrón
    if (nextString !== null) {
      setPatron(nextString);
    }
  } else if (allowedChars.test(event.key)) {
    // Filtra los caracteres válidos
    let inputValue = beatPatternInput.value.toUpperCase();
    let filteredValue = "";
    let ss = beatPatternInput.selectionStart;
    let se = beatPatternInput.selectionEnd;
    
    for (let i = 0; i < inputValue.length; i++) {
      let char = inputValue[i];
      if (/[A-I0 ]/.test(char)) {
        filteredValue += char; // Mantiene el carácter válido
      } else {
        ss = ss-1;
        se = ss-0;
      }
      // Si no es válido, no se agrega al filteredValue (se reemplaza con '')
    }
    beatPatternInput.value = filteredValue; // Actualiza el valor del input
    beatPatternInput.setSelectionRange(ss, se);
  }
});


//  Abrir el modal al hacer clic en el icono
settingsIcon.onclick = function() {
  // Abrir patrones
  showSettings();
}

//  Cerrar el modal al hacer clic en el botón de cierre
spanClose.onclick = function() {
  modal.style.display = "none";
}

//  Cerrar el modal al hacer clic fuera del contenido
modal.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

// mute-icon
muteIcon.addEventListener('click', () => {
  toggleSelectAll();
});

// Vaciar historial listener
vaciarHistorial.addEventListener('click', () => {
  if (confirm("¿Confirma que desea vaciar su historial de patrones?")) {
    localStorage.clear();
    window.location.reload(); // Refresh for update
  }
});

//  DARK/LIGHT MODE SWITCH
//  Toggle dark mode on switch change
darkModeSwitch.addEventListener('change', () => {
  darkMode = darkModeSwitch.checked ? 1:0;
  saveSettings();
  //  DARK/LIGHT MODE SWITCH
  if (darkMode>0) {
    body.classList.add('dark-mode');
  } else {
    body.classList.remove('dark-mode');
  }
});

// Listener para el selector de presets
presetsSelect.addEventListener('change', () => {
  setPatron(presetsSelect.value);
});

// Listener del randomizador
randomForm.addEventListener('click', (event) => {
  event.preventDefault(); // Prevent default form submission
  const minLength = parseInt(document.getElementById('minLength').value, 10);
  const maxLength = parseInt(document.getElementById('maxLength').value, 10);
  const zeroProportion = parseFloat(document.getElementById('zeroProportion').value);
  setPatron(generateRandomPattern(minLength, maxLength, zeroProportion));
});


// TECLADO
// const teclas = document.querySelectorAll('.teclado .boton');
teclas.forEach(boton => {
  boton.addEventListener('click', () => {
    const botonValue = boton.innerText;
    const cursorPosition = beatPatternInput.selectionStart;
    let siset = true;
    switch (boton.id) {
      case 'left':
        beatPatternInput.setSelectionRange(cursorPosition - 1, cursorPosition - 1);
        siset = false;
        break;
      case 'right':
        beatPatternInput.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
        siset = false;
        break;
      case 'backspace':
        beatPatternInput.value = beatPatternInput.value.substring(0, cursorPosition - 1) + beatPatternInput.value.substring(cursorPosition, beatPatternInput.value.length);
        beatPatternInput.setSelectionRange(cursorPosition - 1, cursorPosition - 1);
        break;
      case 'supr':
        beatPatternInput.value = beatPatternInput.value.substring(0, cursorPosition) + beatPatternInput.value.substring(cursorPosition + 1, beatPatternInput.value.length);
        beatPatternInput.setSelectionRange(cursorPosition, cursorPosition);
        break;
      case 'vaciar':
        beatPatternInput.value = '';
        break;
      default:
        beatPatternInput.value = beatPatternInput.value.substring(0, cursorPosition) + botonValue + beatPatternInput.value.substring(cursorPosition, beatPatternInput.value.length);
        beatPatternInput.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
    }
    if(siset)setPatron(beatPatternInput.value.toUpperCase().replace(/[^A-I0]/g, ''),false);
    beatPatternInput.focus();
  });
});

// BOTONERA
botonera.forEach(boton => {
  boton.addEventListener('click', () => {
    switch (boton.id) {
      case 'teclado-switch':
        const teclado = document.querySelectorAll('.teclado')[0];
        if(teclado.style.display === 'none') {
          teclado.style.display =  'grid';
          boton.classList.add('pressed');
          beatPatternInput.setAttribute('inputmode', 'none');
          beatPatternInput.focus();
        } else {
          teclado.style.display =  'none';
          boton.classList.remove('pressed');
          beatPatternInput.removeAttribute('inputmode');
        }
        break;
      case 'recorrer-left':
        recorrerPatron(0);
        beatPatternInput.focus();
        break;
      case 'recorrer-right':
        recorrerPatron(1);
        beatPatternInput.focus();
        break;
      case 'abrir-patrones':
        // Abrir patrones
        showSettings();
        break;
      case 'guardar-patron':
        // Guardar patrón
        enviarPatron(beatPattern);
        break;
      default:
        //No hace nada
    }
  });
});

// -----------------------------------------------------------
// EJECUCIÓN INICIAL -----------------------------------------
cargarPatrones(1); // Carga la lista de Patrones desde la API
// updateHistorySelect(); // Llena el select del historial
updateHistoryDiv(); // Actualiza la lista del historial
createHourMarks(beatsPerMeasure); // Dibuja los colores de la rayas del circulo al iniciar
updatePatternLen(); // Muestra la longitud del patrón al iniciar