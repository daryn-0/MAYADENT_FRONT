# MAYADENT — Sistema de Gestión Odontológica

**Documento de Diseño Técnico del Sistema**
Versión 1.0 | Clasificación: Uso Interno | Área: Solución Técnica (CMMI)

---

## 1. Introducción y Propósito

**MAYADENT** es un sistema de información para la gestión integral de una clínica odontológica. Cubre los procesos operativos centrales del negocio: registro y seguimiento de pacientes, programación y gestión de citas, control de tratamientos, manejo de historial clínico, administración del inventario de insumos, facturación y generación de comprobantes de pago.

Este documento tiene como propósito describir las decisiones de diseño técnico adoptadas durante el desarrollo del sistema, incluyendo la arquitectura, el stack tecnológico, el modelo de datos y la descomposición en módulos funcionales. Sirve como evidencia formal para procesos de auditoría de calidad bajo el modelo **CMMI** en el área de práctica de **Solución Técnica (TS)**.

---

## 2. Arquitectura del Sistema

### 2.1 Patrón General

El sistema adopta una arquitectura **Cliente-Servidor de dos capas**, con separación estricta entre frontend y backend:

```
┌──────────────────────────────────┐        HTTP/REST        ┌──────────────────────────────────┐
│         FRONTEND (Angular)       │ ◄─────────────────────► │        BACKEND (Spring Boot)      │
│  Capa de Presentación + Lógica   │      JSON (UTF-8)        │   Capa de Negocio + Persistencia  │
│         de Presentación          │                          │         (API REST)                │
└──────────────────────────────────┘                          └──────────────────────────────────┘
                                                                            │
                                                                            ▼
                                                              ┌──────────────────────────────────┐
                                                              │       PostgreSQL (Base de Datos)  │
                                                              └──────────────────────────────────┘
```

### 2.2 Arquitectura del Frontend

El frontend sigue el patrón **Component-Based Architecture** propio de Angular, organizado en capas funcionales:

| Capa | Responsabilidad |
|------|----------------|
| **Components (Pages)** | Lógica de presentación, interacción de usuario y orquestación de datos |
| **Components (Layouts)** | Estructura de navegación y enrutamiento de secciones |
| **Services** | Comunicación con la API REST mediante `HttpClient`; abstracción de los endpoints |
| **Models** | Definición de entidades de dominio como clases TypeScript tipadas |
| **Router** | Navegación declarativa mediante `app.routes.ts` con rutas anidadas (`children`) |

La comunicación entre componentes y servicios se realiza mediante **inyección de dependencias** (DI) nativa de Angular. La reactividad se gestiona con **RxJS Observables**.

### 2.3 Comunicación Frontend–Backend

- Protocolo: **HTTP/1.1** sobre **REST**
- Formato de datos: **JSON**
- CORS habilitado en el backend con `@CrossOrigin(origins = "http://localhost:4200")`
- Sin autenticación por token en la versión actual (en desarrollo)
- URL base de la API: `http://localhost:8080`

---

## 3. Stack Tecnológico

### 3.1 Frontend

| Tecnología | Versión | Justificación |
|-----------|---------|--------------|
| **Angular** | 20.3.0 | Framework SPA de Google con tipado estático, inyección de dependencias y SSR integrado. Elegido por su robustez en aplicaciones empresariales y su ecosistema maduro. |
| **TypeScript** | ~5.9.2 | Superset de JavaScript con tipado estático. Permite detectar errores en tiempo de compilación y mejora la mantenibilidad. |
| **PrimeNG** | 20.2.0 | Biblioteca de componentes UI rich (tablas, diálogos, formularios, selectores). Reduce el tiempo de desarrollo de interfaces complejas. |
| **PrimeFlex** | 4.0.0 | Sistema de utilidades CSS basado en Flexbox. Permite layouts responsivos sin escribir CSS personalizado. |
| **PrimeIcons** | 7.0.0 | Conjunto de iconos SVG vectoriales integrados con PrimeNG. |
| **RxJS** | ~7.8.0 | Librería de programación reactiva para manejo asíncrono de llamadas HTTP y eventos. |
| **jsPDF** | ^4.2.1 | Generación de documentos PDF en el cliente (comprobantes de pago). Seleccionado por su capacidad de generar PDFs sin dependencias de servidor. |
| **Angular SSR / Express** | ^20.3.5 / ^5.1.0 | Soporte para Server-Side Rendering, mejora tiempos de carga inicial y SEO. |

### 3.2 Backend

| Tecnología | Versión | Justificación |
|-----------|---------|--------------|
| **Java** | 17+ | Lenguaje principal del backend; versión LTS con soporte extendido. |
| **Spring Boot** | 3.x | Framework que simplifica la configuración de aplicaciones Java empresariales con convención sobre configuración. |
| **Spring Data JPA / Hibernate** | — | ORM para mapeo objeto-relacional. Reduce código boilerplate de acceso a datos y gestiona transacciones. |
| **Spring Web MVC** | — | Módulo para exposición de endpoints REST (`@RestController`, `@RequestMapping`). |
| **Lombok** | — | Reducción de código boilerplate (`@Data`, `@Builder`, `@NoArgsConstructor`). |
| **PostgreSQL** | — | Motor de base de datos relacional robusto, con soporte para integridad referencial, transacciones ACID y extensibilidad. |

---

## 4. Diseño de Datos (Modelo Lógico)

### 4.1 Entidades Principales y Relaciones

```
┌─────────────┐     N:1    ┌─────────────┐     N:1    ┌─────────────────┐
│   pacientes │ ─────────► │    citas    │ ─────────► │  estado_citas   │
└─────────────┘            └─────────────┘            └─────────────────┘
                                  │
                          ┌───────┼──────────────┐
                          │       │              │
                          ▼       ▼              ▼
               ┌──────────────┐  ┌───────────┐  ┌──────────────────┐
               │cita_tratamien│  │  facturas │  │  uso_insumos     │
               │    tos       │  └───────────┘  └──────────────────┘
               └──────────────┘       │                 │
                      │          ┌────┴────┐            │
                      ▼          ▼         ▼            ▼
               ┌───────────┐ ┌──────────┐ ┌───────┐ ┌──────────────┐
               │tratamiento│ │detalle_  │ │metodo_│ │  inventarios │
               │    s      │ │factura   │ │pagos  │ └──────────────┘
               └───────────┘ └──────────┘ └───────┘
                      │
                      ▼
               ┌───────────┐
               │  doctores │
               └───────────┘
```

### 4.2 Descripción de Entidades

| Entidad | Descripción | Relaciones Clave |
|---------|------------|-----------------|
| **pacientes** | Datos demográficos del paciente (nombre, DNI, teléfono, correo, dirección, género, fecha de nacimiento, estado). | Referenciado por `citas`, `historias_clinicas` |
| **citas** | Registro de cada cita médica con fecha, hora, descripción y estado operativo. | N:1 con `pacientes`, N:1 con `estado_citas`, N:1 con `usuarios` |
| **estado_citas** | Catálogo de estados del flujo de cita: Pendiente → Confirmada → Atendida / Cancelada / No asistió. | 1:N con `citas` |
| **cita_tratamientos** | Relación M:N entre citas y tratamientos, con costo final negociado por servicio. | N:1 con `citas`, N:1 con `tratamientos` |
| **tratamientos** | Catálogo de servicios odontológicos con costo base y doctor responsable. | N:1 con `doctores` |
| **doctores** | Profesionales de la clínica con nombre, especialidad y estado. | 1:N con `tratamientos` |
| **historias_clinicas** | Registro médico generado automáticamente al marcar una cita como "Atendida". Contiene diagnóstico, notas y monto. | N:1 con `citas`, N:1 con `pacientes` |
| **facturas** | Comprobante de pago asociado a una cita atendida, con monto total, método y estado de pago. | N:1 con `citas`, N:1 con `estado_pagos`, N:1 con `metodo_pagos` |
| **detalle_factura** | Líneas de detalle de la factura (descripción del servicio, cantidad, precio unitario, subtotal). | N:1 con `facturas` |
| **estado_pagos** | Catálogo de estados de pago (id 1: Pendiente, id 2: Cancelado). | 1:N con `facturas` |
| **metodo_pagos** | Catálogo de métodos de pago (id 1: Efectivo, id 2: Transferencia). | 1:N con `facturas` |
| **inventarios** | Stock de insumos y materiales dentales con nombre, cantidad, unidad de medida y costo unitario. | 1:N con `uso_insumos` |
| **uso_insumos** | Registro de insumos utilizados durante una cita atendida (producto + cantidad usada). | N:1 con `citas`, N:1 con `inventarios` |
| **usuarios** | Usuarios del sistema (personal de la clínica) con credenciales de acceso. | 1:N con `citas` |

---

## 5. Módulos Principales

### 5.1 Módulo de Pacientes (`/pacientes`)

| Componente | Ruta | Responsabilidad Técnica |
|-----------|------|------------------------|
| `RegistroPacientes` | `/pacientes/registro` | Formulario reactivo para alta de nuevos pacientes con validaciones de campos requeridos. |
| `Listapaciente` | `/pacientes/lista` | Tabla paginada de pacientes activos con filtro por nombre/DNI. |
| `Gestionarpacientes` | `/pacientes/gestion` | CRUD completo: edición inline, cambio de estado (Activo/Inactivo) con confirmación. |

**Servicio:** `PacienteService` → `GET /pacientes`, `POST /pacientes`, `PUT /pacientes/{id}`, `DELETE /pacientes/{id}`

---

### 5.2 Módulo de Citas (`/citas`)

Módulo central del sistema. Implementa el flujo de vida completo de una cita con máquina de estados.

**Flujo de estados:**
```
PENDIENTE ──► CONFIRMADA ──► ATENDIDA (estado final → genera historial + factura)
     │              │
     └──► CANCELADA └──► NO ASISTIÓ
```

| Componente | Ruta | Responsabilidad Técnica |
|-----------|------|------------------------|
| `Registrocitas` | `/citas/registro` | Alta de nuevas citas con selección de paciente, fecha y hora. |
| `Listacitas` | `/citas/lista` | Visualización de citas activas del sistema. |
| `Gestionarcitas` | `/citas/gestion` | Gestión completa: edición, cambio de estado con reglas de transición, gestión de tratamientos (máx. 3 por cita), registro de insumos utilizados, generación de nota de venta. Al marcar como "Atendida" se dispara: creación automática del historial clínico + bloqueo de edición. |
| `Calendariocitas` | `/citas/calendario` | Vista de calendario para visualización temporal de citas. |
| `Pagos` | `/citas/pagos` | Listado de facturas emitidas con filtro por paciente y generación de PDF (comprobante de pago). |

**Servicios involucrados:** `CitaService`, `CitaTratamientoService`, `HistorialClinicoService`, `FacturaService`, `UsoInsumoService`, `EstadoPagoService`, `MetodoPagoService`, `InventarioService`

---

### 5.3 Módulo de Tratamientos (`/tratamientos`)

| Componente | Ruta | Responsabilidad Técnica |
|-----------|------|------------------------|
| `ListaTratamientos` | `/tratamientos/lista` | Catálogo de tratamientos disponibles con estado y costo base. |
| `GestionarTratamientos` | `/tratamientos/gestion` | CRUD de tratamientos con asignación de doctor responsable. |

**Servicio:** `TratamientoService` → `GET /tratamientos`, `POST`, `PUT/{id}`, `DELETE/{id}`

---

### 5.4 Módulo de Historial Clínico (`/historial-clinico`)

| Componente | Ruta | Responsabilidad Técnica |
|-----------|------|------------------------|
| `Listahistorialclinico` | `/historial-clinico/lista` | Vista agrupada por paciente. Primer nivel: listado de pacientes con número de historiales. Segundo nivel (dialog): listado de fechas con buscador. Tercer nivel (dialog): detalle completo del historial seleccionado. |
| `Gestionarhistorialclinico` | `/historial-clinico/gestion` | Tabla con todos los historiales. Permite edición restringida: solo `monto_total`, `diagnostico` y `notas` son modificables. Generado automáticamente al atender una cita, con notas que incluyen los tratamientos realizados. |

**Regla de negocio clave:** El historial clínico se crea automáticamente cuando una cita cambia a estado "Atendida". No puede modificarse el estado, paciente ni fecha desde la interfaz.

**Servicio:** `HistorialClinicoService` → `GET /historiales-clinicos`, `POST /historiales-clinicos/cita/{citaId}`, `PUT/{id}`

---

### 5.5 Módulo de Inventario (`/inventario`)

| Componente | Ruta | Responsabilidad Técnica |
|-----------|------|------------------------|
| `Listainventario` | `/inventario/lista` | Vista del stock actual con alertas visuales de cantidad. |
| `Registroinventario` | `/inventario/registro` | Alta de nuevos productos/insumos con unidad de medida y costo unitario. |
| `Gestionarinventario` | `/inventario/gestion` | Edición de stock, costo y estado de productos. |

El módulo se integra con el módulo de citas: al registrar uso de insumos en una cita atendida, se descuenta el stock del inventario automáticamente.

**Servicio:** `InventarioService` → `GET /inventarios`, `POST`, `PUT/{id}`, `DELETE/{id}`

---

### 5.6 Módulo de Doctores (`/doctores`)

Componente único `Doctores` que gestiona el CRUD del catálogo de profesionales de la clínica. Los doctores se asocian a tratamientos específicos.

---

### 5.7 Generación de Comprobantes PDF

Implementado en el componente `Pagos` mediante la librería **jsPDF** (ejecución client-side). El proceso:

1. Al hacer clic en "Descargar PDF", se consulta `/citaTratamientos/cita/{id}` para obtener los tratamientos reales de la cita.
2. Se construye el documento con secciones: encabezado institucional, datos del paciente, datos de la cita, tabla de servicios detallada (un ítem por tratamiento con doctor y precio final), monto total, información de pago.
3. El archivo se descarga directamente en el navegador sin intervención del servidor.

---

## 6. Comandos de Desarrollo

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia el servidor de desarrollo en `http://localhost:4200` |
| `npm run build` | Compila la aplicación para producción en `/dist` |
| `npm run watch` | Compilación continua en modo desarrollo |
| `npm test` | Ejecuta pruebas unitarias con Karma/Jasmine |
| `npm run serve:ssr:mayadent` | Ejecuta la aplicación con SSR habilitado |

---

## 7. Estructura del Proyecto

```
mayadent/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── layouts/          # Layouts de navegación por módulo
│   │   │   │   ├── citas-layout/
│   │   │   │   ├── historial-clinico-layout/
│   │   │   │   ├── pacientes-layout/
│   │   │   │   └── ...
│   │   │   └── pages/            # Componentes de página (lógica + vista)
│   │   │       ├── citas/
│   │   │       │   ├── gestionarcitas/
│   │   │       │   ├── listacitas/
│   │   │       │   ├── registrocitas/
│   │   │       │   ├── calendariocitas/
│   │   │       │   └── pagos/
│   │   │       ├── historial-clinico/
│   │   │       ├── pacientes/
│   │   │       ├── tratamientos/
│   │   │       ├── inventario/
│   │   │       └── doctores/
│   │   ├── models/               # Entidades de dominio (TypeScript)
│   │   ├── services/             # Servicios HTTP (un servicio por entidad)
│   │   ├── app.routes.ts         # Definición de rutas con lazy-loading
│   │   └── app.config.ts         # Configuración global de Angular
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── angular.json
├── package.json
└── tsconfig.json
```

---

*Documento generado para evidencia de auditoría CMMI — Área de Solución Técnica (TS) — MAYADENT v1.0*
