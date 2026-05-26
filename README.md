# Mayadent

Sistema de gestión de citas y tratamientos dentales desarrollado con Angular 20.

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (versión 18 o superior)
- [npm](https://www.npmjs.com/) (viene incluido con Node.js)
- [Angular CLI](https://angular.dev/tools/cli) versión 20.3.5

## 🚀 Instalación

1. Clona el repositorio:
```bash
git clone <url-del-repositorio>
cd mayadent
```

2. Instala las dependencias:
```bash
npm install
```

## 💻 Desarrollo

Para iniciar el servidor de desarrollo:

```bash
npm start
```

O usando Angular CLI directamente:

```bash
ng serve
```

Abre tu navegador en `http://localhost:4200/`. La aplicación se recargará automáticamente cuando modifiques los archivos.

## 🏗️ Construcción

Para construir el proyecto para producción:

```bash
npm run build
```

Los archivos compilados se guardarán en el directorio `dist/`.

### Modo de desarrollo con watch:

```bash
npm run watch
```

## 🖥️ Server-Side Rendering (SSR)

Este proyecto incluye soporte para SSR. Para ejecutar la aplicación con SSR:

```bash
npm run serve:ssr:mayadent
```

## 🧪 Pruebas

Para ejecutar las pruebas unitarias:

```bash
npm test
```

## 📦 Tecnologías Principales

- **Angular** 20.3.0 - Framework principal
- **PrimeNG** 20.2.0 - Biblioteca de componentes UI
- **PrimeIcons** 7.0.0 - Iconos
- **PrimeFlex** 4.0.0 - Utilidades CSS
- **RxJS** 7.8.0 - Programación reactiva
- **Express** 5.1.0 - Servidor para SSR

## 📁 Estructura del Proyecto

```
mayadent/
├── src/
│   ├── app/
│   │   ├── components/     # Componentes de la aplicación
│   │   ├── services/       # Servicios
│   │   ├── models/         # Modelos de datos
│   │   └── app.routes.ts   # Configuración de rutas
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── public/                 # Archivos estáticos
├── angular.json           # Configuración de Angular
├── package.json           # Dependencias del proyecto
└── tsconfig.json          # Configuración de TypeScript
```

## 🛠️ Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia el servidor de desarrollo |
| `npm run build` | Construye la aplicación para producción |
| `npm run watch` | Construye en modo desarrollo con watch |
| `npm test` | Ejecuta las pruebas unitarias |
| `ng generate component <nombre>` | Genera un nuevo componente |
| `ng generate service <nombre>` | Genera un nuevo servicio |

## 📝 Notas

- El proyecto usa Angular 20 con las últimas características
- Incluye configuración de SSR para mejor rendimiento y SEO
- Utiliza PrimeNG para una interfaz de usuario consistente y profesional

## 🤝 Contribuir

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado.
