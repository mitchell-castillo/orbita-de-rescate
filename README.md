# Órbita de Rescate

Primer juego de **Un juego cada día**: un puzle espacial original de seis sectores. Tu nave se desliza hasta un asteroide o el borde. Rescata a todos los astronautas del sector y vuelve al portal de regreso.

- Jugar: https://mitchell-castillo.github.io/orbita-de-rescate/
- Catálogo: https://mitchell-castillo.github.io/daily-games/
- Repositorio independiente: https://github.com/mitchell-castillo/orbita-de-rescate

## Ejecutar y probar

Sin dependencias ni paso de compilación. Requiere Python 3 para servir y Node.js 24 para las pruebas.

```sh
npm start
# Abrir http://localhost:8081
npm run check
```

GitHub Pages: Deploy from a branch → main → / (root). Todas las rutas de los assets y módulos son relativas; el juego funciona en su propio subdirectorio sin depender del código del catálogo.

## Controles y reglas

- Flechas o WASD: un impulso en la dirección elegida.
- Botones en pantalla o deslizar: controles táctiles equivalentes.
- Z: deshacer. R: reiniciar el sector actual.
- La nave no se detiene en un astronauta: lo recoge al cruzar su casilla.
- El portal no detiene la nave hasta que todos están a bordo.
- Al completar un sector se desbloquea el siguiente.
- 3 estrellas: ruta óptima. 2 estrellas: hasta 3 impulsos adicionales. 1 estrella: misión completada.
- Sin tiempo límite, anuncios, descargas ni cuentas.

Los seis tableros tienen soluciones mínimas de 3, 5, 7, 9, 11 y 13 impulsos, verificadas con búsqueda en anchura. Deshacer mantiene la mejor marca anterior; reiniciar no borra sectores completados.

## Progreso local

La clave única es daily-games:orbita-de-rescate:v1. Guarda el sector actual, la secuencia de impulsos para reconstruir la partida y las mejores marcas. Se validan versión, límites y movimientos al recuperar una partida. Si el navegador impide escribir, el juego sigue disponible en memoria y avisa de que la sesión no se conservará. Los datos no salen del dispositivo; no se sincronizan entre navegadores ni equipos.

## Archivos

- engine.js: reglas puras y solver independiente de la interfaz.
- levels.js: seis diseños originales, dificultad y pistas.
- game.js: interacción, teclado/táctil, navegación de sectores y guardado.
- game.css / index.html: interfaz responsive en español, soporte de foco y movimiento reducido.
- assets/progress.js: formato versionado y almacenamiento tolerante a errores.
- tests/: lógica de movimientos, rescates, portales, solución óptima y persistencia.

Para modificar este juego se trabaja solo en este repositorio. Actualizar su ficha en daily-games/games.json únicamente cuando cambien los metadatos públicos, portada, URL o mecánica.
