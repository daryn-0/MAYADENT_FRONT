# Contexto del Módulo de Citas (Proyecto MayaDent)

## 1. Estructura y Relaciones de Base de Datos
El módulo tiene una relación de varios a varios gestionada a través de tablas intermedias. El flujo exacto es:
* **Citas:** Tabla principal (`citas`).
* **Tratamientos de la Cita:** Una cita puede tener de 1 a 3 tratamientos asignados. Se relacionan mediante la tabla `cita_tratamientos` (id_cita, id_tratamiento).
* **Tratamientos y Doctores:** Cada registro en la tabla `tratamientos` tiene asignado un único doctor (`id_doctor`).
* **Doctores:** Tabla `doctores` (contiene los datos del profesional).

**Regla de Negocio Crítica:** Como una cita tiene múltiples tratamientos, una misma cita puede tener involucrados a **múltiples doctores** (o solo a uno si hace todos los tratamientos).

## 2. Requerimientos Actuales de la UI (Angular)
* **Listado de Citas (`listacitas`):** Debe visualizarse una columna o sección que muestre el nombre del doctor o doctores asignados a esa cita. Debe existir un filtro por doctor.
* **Calendario de Citas (`calendariocitas`):** En las tarjetas del calendario, debe visualizarse el doctor(es). Debe existir un filtro global por doctor en la vista del calendario.