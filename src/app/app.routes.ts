import { Routes } from '@angular/router';
import { RegistroPacientes } from './components/pages/pacientes/registropaciente/registropaciente';
import { MenuLayout } from './components/layouts/menu-layout/menu-layout';
import { PacientesLayout } from './components/layouts/pacientes-layout/pacientes-layout';
import { Listapaciente } from './components/pages/pacientes/listapaciente/listapaciente';
import { Gestionarpacientes } from './components/pages/pacientes/gestionarpacientes/gestionarpacientes';
import { InicioLayout } from './components/layouts/inicio-layout/inicio-layout';
import { Doctores } from './components/pages/doctores/doctores';
import { TratamientoLayout } from './components/layouts/tratamiento-layout/tratamiento-layout';
import { ListaTratamientos } from './components/pages/tratamientos/listatratamientos/listatratamientos';
import { GestionarTratamientos } from './components/pages/tratamientos/gestionartratamientos/gestionartratamientos';
import { CitasLayout } from './components/layouts/citas-layout/citas-layout';
import { Registrocitas } from './components/pages/citas/registrocitas/registrocitas';
import { Listacitas } from './components/pages/citas/listacitas/listacitas';
import { Gestionarcitas } from './components/pages/citas/gestionarcitas/gestionarcitas';
import { Listainventario } from './components/pages/inventario/listainventario/listainventario';
import { Registroinventario } from './components/pages/inventario/registroinventario/registroinventario';
import { Gestionarinventario } from './components/pages/inventario/gestionarinventario/gestionarinventario';
import { Calendariocitas } from './components/pages/citas/calendariocitas/calendariocitas';
import { HistorialClinicoLayout } from './components/layouts/historial-clinico-layout/historial-clinico-layout';
import { Listahistorialclinico } from './components/pages/historial-clinico/listahistorialclinico/listahistorialclinico';
import { Gestionarhistorialclinico } from './components/pages/historial-clinico/gestionarhistorialclinico/gestionarhistorialclinico';

export const routes: Routes = [
    {
        path: '',
        component: MenuLayout,
        children: [

            { 
                path: 'inicio', 
                component: InicioLayout },
            { 
                path: 'doctores', 
                component: Doctores },
            { 
                path: 'tratamientos', 
                component: TratamientoLayout,
                children: [
                    { path: '', redirectTo: 'lista', pathMatch: 'full' },
                    { path: 'lista', component: ListaTratamientos },
                    { path: 'gestion', component: GestionarTratamientos }
                ]
            },
                
            {
                path: 'pacientes',
                component: PacientesLayout,
                children: [
                    { path: '', redirectTo: 'lista', pathMatch: 'full' },
                    { path: 'registro', component: RegistroPacientes },
                    { path: 'lista', component: Listapaciente },
                    { path: 'gestion', component: Gestionarpacientes }
                ]
            },
            {
                path: 'citas',
                component: CitasLayout,
                children: [
                    { path: '', redirectTo: 'lista', pathMatch: 'full' },
                    { path: 'registro', component: Registrocitas },
                    { path: 'lista', component: Listacitas },
                    { path: 'gestion', component: Gestionarcitas },
                    { path: 'calendario', component: Calendariocitas }
                ]
            },
            {
                path: 'historial-clinico',
                component: HistorialClinicoLayout,
                children: [
                    { path: '', redirectTo: 'lista', pathMatch: 'full' },
                    { path: 'lista', component: Listahistorialclinico },
                    { path: 'gestion', component: Gestionarhistorialclinico }
                ]
            },
            {
                path: 'inventario',
                children: [
                    { path: '', redirectTo: 'lista', pathMatch: 'full' },
                    { path: 'lista', component: Listainventario },
                    { path: 'registro', component: Registroinventario },
                    { path: 'gestion', component: Gestionarinventario }
                ]
            },
            { path: '', redirectTo: 'inicio', pathMatch: 'full' }
        ]
    },
];
