-- Estados recomendados para el sistema de citas
INSERT INTO estado_citas (id, nombre, estado) VALUES 
(1, 'Pendiente', 'Activo'),      -- Estado inicial
(2, 'Confirmada', 'Activo'),     -- Paciente confirmó asistencia  
(3, 'Atendida', 'Activo'),       -- Cita completada exitosamente
(4, 'Cancelada', 'Activo'),      -- Cancelada por paciente/doctor
(5, 'No Asistió', 'Activo');     -- Paciente no se presentó

-- Si quieres mantener consistencia de género, usa todos en femenino:
-- 'Pendiente', 'Confirmada', 'Atendida', 'Cancelada', 'No Asistió'