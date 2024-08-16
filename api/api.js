function fechaMexico(timestamp) {
    // Validar si el timestamp es un número válido
    if (isNaN(timestamp) || timestamp <= 0) {
      return "-fecha inválida-";
    }
    let fechaMexico = new Date(timestamp * 1000);
    let opciones = { day: 'numeric', month: 'numeric', year: 'numeric' };
    return fechaMexico.toLocaleDateString('es-MX', opciones);
  }

function enviarPatron() {
  // Obtener el elemento input del patrón rítmico
  var inputPatron = document.getElementById("patronRitmico");
  var patronRitmico = inputPatron.value;

  // Preguntar al usuario por el nombre de la clave
  var nombreClave = prompt("Introduce un nombre para este patrón:");

  // Validaciones y reemplazos regex para asegurar compatibilidad con la API
  nombreClave = nombreClave.replace(/[^a-z0-9\-_ ,.áéíóúüñ]/ig, '') // Eliminar caracteres inválidos
                            .trim() // Eliminar espacios al inicio y final
                            .substring(0, 50); // Limitar a 50 caracteres

  patronRitmico = patronRitmico.toUpperCase() // Convertir a mayúsculas
                               .replace(/[^A-I0]/g, '') // Eliminar caracteres inválidos
                               .substring(0, 100); // Limitar a 100 caracteres

  //Reemplaza el valor del input
  inputPatron.value = patronRitmico;

  // Verificar si se obtuvieron valores válidos
  if (nombreClave.length >= 5 && patronRitmico.length >= 4) {
    // Crear un objeto FormData para enviar los datos
    var formData = new FormData();
    formData.append("n", nombreClave);
    formData.append("p", patronRitmico);

    // Enviar la solicitud POST a la API
    fetch("/metro/api/api.php", {
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
    })
    .catch(error => {
      // Manejar errores de la solicitud
      console.error('Error:', error);
      document.getElementById('resultado').innerText = 'Hubo un error. Inténtelo de nuevo en unos segundos.';
    });
  } else {
    // Mostrar un mensaje de error si los valores no son válidos
    alert("Nombre de clave o patrón rítmico inválidos. Revise su formato.");
  }
}
function cargarPatrones(pag) {
  // Realizar la petición GET a la API con el número de página
  fetch(`/metro/api/api.php?i=${pag}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Error en la solicitud.');
      }
      return response.json();
    })
    .then(patrones => {
      // Obtener el elemento select del contenedor
      var contenedor = document.getElementById("contenedor");

      // Limpiar cualquier opción previa en el contenedor
      contenedor.innerHTML = '<option value=""> - PATRONES DE LOS USUARIOS - </option>';

      // Iterar sobre la lista de patrones recibidos
      patrones.forEach(patron => {
        // Crear un nuevo elemento option
        var opcion = document.createElement("option");
        opcion.value = patron[2]; // El valor es el patrón rítmico
        opcion.text = patron[1]+' ['+patron[2].length+': '+patron[2]+'] ('+fechaMexico(patron[0])+')'; // El texto es el nombre del patrón

        // Agregar la opción al contenedor select
        contenedor.add(opcion);
      });
    })
    .catch(error => {
      // Manejar errores de la solicitud
    //   console.error('Error:', error);
      document.getElementById('resultado').innerText = error;
    //   alert("Hubo un error al cargar los patrones. Por favor, inténtalo de nuevo.");
    });
}