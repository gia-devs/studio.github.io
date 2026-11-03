# G’IA — Plataforma de ideas, artistas y pensamiento

**G’IA** es una plataforma de ideas, artistas y pensamiento. **Aion** es el espacio de conversación y el guardián cósmico de la creatividad y el conocimiento.

## Cómo abrirla

Abre `index.html` con un servidor local (necesario por los módulos ES):

```bash
# Python
python -m http.server 8080

# Node
npx serve .
```

Luego visita `http://localhost:8080`.

## Qué incluye

- Catálogo de 40 figuras: 20 filósofos y 20 artistas, entre ellos Sócrates, Descartes, Van Gogh, Picasso, Frida Kahlo y Leonardo da Vinci.
- Fichas con biografía, obras, influencias y cita
- Favoritos, valoraciones (1–5 estrellas) y reseñas (guardados en localStorage)
- Aion, espacio de conversación: responde desde el catálogo y consulta Wikipedia en español para preguntas externas, con enlace a la fuente
- Búsqueda global (atajo `/` en escritorio)
- Perfil con acceso de maqueta
- Favoritos, valoraciones y ajustes sincronizados entre pestañas del mismo navegador
- Copia de seguridad JSON para exportar y restaurar la biblioteca local
- Instalación como PWA y navegación básica sin conexión tras la primera carga
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
│   └── views/
└── assets/
```

Proyecto de portafolio. No hay backend ni pagos.

## Estado de cuentas y datos

El perfil sigue siendo local y de demostración: no crea una cuenta real ni sincroniza
datos entre dispositivos. La copia JSON permite conservar o trasladar manualmente la
biblioteca. La instalación PWA requiere servir el sitio por HTTPS (o `localhost`);
la primera carga debe completarse con conexión para guardar los archivos de la app.
