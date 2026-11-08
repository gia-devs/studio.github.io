# G’IA — Plataforma de ideas, artistas y pensamiento

**G’IA** es una plataforma de ideas, artistas, escritores y pensamiento. **Aion** es el espacio de conversación y el guardián cósmico de la creatividad y el conocimiento.

## Cómo abrirla

Abre `index.html` directamente con doble clic. La app y Aion funcionan sin servidor, módulos ni conexión a internet. La instalación PWA requiere `localhost` o HTTPS.

## Qué incluye

- Catálogo de 61 figuras: 20 filósofos, 20 artistas y 21 escritores, entre ellos Sócrates, Descartes, Van Gogh, Picasso, Cervantes, Shakespeare, Virginia Woolf y Álvaro de Campos.
- Fichas con biografía, obras, influencias y cita
- Favoritos, valoraciones (1–5 estrellas) y reseñas (guardados en localStorage)
- Aion, conversación local basada en el catálogo de G’IA; no consulta fuentes externas ni usa una API
- Búsqueda global (atajo `/` en escritorio)
- Favoritos y reseñas locales sincronizados entre pestañas del mismo navegador
- Instalación como PWA y navegación offline tras cargar el sitio servido una vez
- Diseño responsive (sidebar + bottom bar móvil)

## Estructura

```
gia-studio/
├── index.html
├── css/          # tokens, base, layout, components, views
├── js/
│   ├── app.js
│   ├── core/     # utils, store, router
│   ├── components/
│   ├── data/     # figures.js
│   ├── views/
│   └── aion/     # normalización, datos, intenciones, memoria, motor, UI y pruebas
└── assets/
```

Proyecto de portafolio. No hay backend ni pagos.

## Datos locales

Aion es un motor de reglas y solo conoce lo que aparece en las fichas; las ideas, ejemplos, preguntas, curiosidades e importancia de cada obra aún necesitan datos editoriales. Prueba el motor en la consola del navegador con `GIA.Aion.test()`.

Los favoritos, las valoraciones y las reseñas se guardan localmente en este navegador; no hay cuentas ni registro. La instalación PWA requiere servir el sitio por HTTPS (o `localhost`);
la primera carga debe completarse con conexión para guardar los archivos de la app.
