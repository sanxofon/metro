<?php
/** 
 * API para guardar y leer la base de datos colectiva y anónima de patrones rítmicos.
 * La API acepta POST y GET
 * POST: 
 *      Recibe: ?n=Nombre%20de%20la%20Clave&p=CAA00AGHE0
 *      Devuelve: Mensaje JSON
 * GET:
 *      Recibe: ?i=1 dónde i es la paginación default para las primeras 100 entradas
 *      Devuelve:   [
 *                      [124234345,"Bla bla bla", "CHCC00I"],
 *                      [123589008,"Bla bla bla 2", "ABAB"]
 *                  ]
 * **/

$db = 'db.json';
// Base de datos de patrones rítmicos (puedes reemplazar esto con una base de datos real)
$database = json_decode(file_get_contents($db), true);

// Validación de expresiones regulares
$nombreClaveRegex = '/^[a-z0-9\-_ ,.áéíóúüñ]{5,50}$/iu';
$patronRitmicoRegex = '/^[A-I0]{4,100}$/';

// Límite de tiempo para agregar patrones (1 minuto en segundos)
$limiteTiempo = 60;

// Función para agregar un nuevo patrón
function agregarPatron($ip, $nombreClave, $patronRitmico) {
  global $database, $nombreClaveRegex, $patronRitmicoRegex, $limiteTiempo, $db;

  // Validar nombre de la clave
  if (!preg_match($nombreClaveRegex, $nombreClave)) {
    http_response_code(400);
    echo json_encode(['error' => 'Nombre de la clave inválido.']);
    return;
  }

  // Validar patrón rítmico
  if (!preg_match($patronRitmicoRegex, $patronRitmico)) {
    http_response_code(400);
    echo json_encode(['error' => 'Patrón rítmico inválido.']);
    return;
  }

  // Verificar límite de tiempo por IP
  $ultimoTimestamp = isset($database[$ip]) ? end($database[$ip])[0] : 0;
  if (time() - $ultimoTimestamp < $limiteTiempo) {
    http_response_code(429);
    echo json_encode(['error' => 'Límite de solicitudes alcanzado. Intente de nuevo más tarde.']);
    return;
  }

  // Agregar el nuevo patrón a la base de datos
  $database[$ip][] = [time(), $nombreClave, $patronRitmico];

  // Guardar la base de datos actualizada
  file_put_contents($db, json_encode($database));

  echo json_encode(['mensaje' => 'Patrón agregado con éxito.']);
}

// Función para obtener la lista de patrones
function obtenerPatrones($pagina = 1) {
  global $database;

  // Número de entradas por página
  $entradasPorPagina = 100;

  // Calcular el índice de inicio para la paginación
  $inicio = ($pagina - 1) * $entradasPorPagina;

  // Combinar y ordenar patrones de todas las IPs
  $patronesCombinados = [];
  foreach ($database as $ip => $patrones) {
    $patronesCombinados = array_merge($patronesCombinados, $patrones);
  }
  // Comparación normal
  usort($patronesCombinados, function($a, $b) {
    // return  strnatcasecmp($a[1],$b[1]); // Orden alfabético natural 
    // return $a[0] - $b[0]; // el más viejo primero
    return $b[0] - $a[0]; // el más reciente primero
  });

  // Obtener la porción de datos para la página actual
  $patronesPaginados = array_slice($patronesCombinados, $inicio, $entradasPorPagina);

  echo json_encode($patronesPaginados);
}

// Manejar solicitudes POST y GET
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  // Obtener datos del cuerpo de la solicitud
  $nombreClave = $_POST['n'] ?? null;
  $patronRitmico = $_POST['p'] ?? null;

  // Validar datos de entrada
  if (empty($nombreClave) || empty($patronRitmico)) {
    http_response_code(400);
    echo json_encode(['error' => 'Faltan datos.']);
    exit;
  }

  // Obtener la dirección IP del cliente
  $ip = $_SERVER['REMOTE_ADDR'];

  // Agregar el nuevo patrón
  agregarPatron($ip, $nombreClave, $patronRitmico);

} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
  // Obtener el número de página de la solicitud
  $pagina = $_GET['i'] ?? 1;

  // Obtener la lista de patrones paginados
  obtenerPatrones($pagina);

} else {
  // Método no permitido
  http_response_code(405);
  echo json_encode(['error' => 'Método no permitido.']);
}

?>