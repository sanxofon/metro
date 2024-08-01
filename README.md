# Metrónomo Web Personalizable

Este es un metrónomo web sencillo pero potente que te permite crear y practicar ritmos con facilidad.

## Características

* Interfaz de usuario limpia y fácil de usar.
* Ajusta el BPM (o CPM) de 1 a 1000.
* Crea patrones rítmicos personalizados usando números (1-9) para los golpes y 0 para los silencios.
* Silencia golpes específicos dentro de un patrón.
* Guarda un historial de los patrones utilizados.
* Cambia entre el modo claro y oscuro.
* Funciona offline gracias a la caché del Service Worker.

## Cómo usar

1. Abre `index.html` en tu navegador web.
2. Ajusta el BPM (o CPM) usando el control deslizante o el campo de entrada numérica.
3. Ingresa un patrón rítmico en el campo de texto. Por ejemplo, "1020" creará un patrón con un golpe en el primer y tercer tiempo y un silencio en el segundo y cuarto tiempo.
4. Para silenciar un golpe específico, haz clic en su número correspondiente debajo del reloj circular.
5. Presiona el botón "Reproducir" para iniciar el metrónomo.
6. Presiona el botón "Detener" para detener el metrónomo.
7. Usa el ícono de configuración (⏳) para acceder al historial de patrones y al botón para vaciar el historial.
8. Puedes cambiar entre el modo claro y oscuro usando el interruptor en la parte superior izquierda.

## Personalización

Puedes personalizar la apariencia del metrónomo editando el archivo `metro.css`.

## Contribuciones

Las contribuciones son bienvenidas. Por favor, crea un fork del repositorio y envía una solicitud de extracción con tus cambios.

## Licencia

Este proyecto está licenciado bajo la Licencia MIT.


-----

## Extras:

### _grabCode.php

Este código PHP es una herramienta útil para desarrolladores que quieren analizar su código fuente con una IA. 

**Función:**
El script recorre un directorio específico (por defecto el actual './') y busca todos los archivos con extensiones `.html`, `.css` y `.js`. Luego, combina el contenido de estos archivos en un único archivo de texto llamado `_codigo_completo.txt`. 

**Excepción:**
El script tiene una excepción incorporada para ignorar un archivo llamado `beats.js`. Se asume que este archivo es muy grande y su inclusión podría dificultar el análisis por parte de la IA. 

**Uso:**
Para usar el script, simplemente se debe guardar como `grabCode.php` en el directorio raíz del proyecto y ejecutarlo desde la línea de comandos con `php grabCode.php`.

**En resumen:** El script automatiza la tarea de recopilar código fuente de diferentes archivos y lo prepara para ser analizado por una IA, lo que facilita la identificación de patrones, errores o áreas de mejora.

### _sonidos/mp32base64.php

Este script PHP tiene como objetivo preparar archivos de audio MP3 para ser utilizados en JavaScript.

**Función:**

1. **Codificación Base64:** El script toma una lista de nombres de archivos MP3 (en este caso, `sonido1.mp3` a `sonido9.mp3`). Luego, lee cada archivo y lo codifica en Base64. La codificación Base64 convierte datos binarios, como archivos de audio, a un formato de texto que se puede integrar fácilmente en código.

2. **Creación del archivo `beats.js`:** El script genera un archivo JavaScript llamado `beats.js`. Este archivo contiene una variable de arreglo llamada `base64Beat`. Cada elemento de este arreglo es una cadena de texto que representa un archivo MP3 codificado en Base64.

**Uso:**

1. **Reemplazar nombres de archivo:** Editar el script para incluir los nombres de los archivos MP3 que se desea utilizar.
2. **Ejecutar el script:** Ejecutar el script PHP. Esto generará el archivo `beats.js` en el mismo directorio.

**Propósito:**

El propósito principal de este script es facilitar la utilización de archivos de audio MP3 en código JavaScript. 

- **Integración directa:** Al codificar los archivos MP3 en Base64 y colocarlos en un archivo JavaScript, se pueden reproducir directamente en un navegador web sin depender de solicitudes HTTP adicionales.
- **Mejor rendimiento:** Integrar archivos de audio directamente en el código puede mejorar el rendimiento, especialmente en casos donde los archivos son pequeños y se utilizan con frecuencia.

En resumen, este script simplifica el proceso de inclusión de archivos de audio MP3 en proyectos web al convertirlos a un formato compatible con JavaScript y listo para usar.

