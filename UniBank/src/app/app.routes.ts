import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Register } from './pages/register/register';
import { Logincliente } from './pages/logincliente/logincliente';
import { Loginejecutivo } from './pages/loginejecutivo/loginejecutivo';
import { Loginmanager } from './pages/loginmanager/loginmanager';
import { ClienteLayout } from './pages/cliente/cliente-layout/cliente-layout';
import { Micuenta } from './pages/cliente/micuenta/micuenta';
import { Credito } from './pages/cliente/credito/credito';
import { Movimientos } from './pages/cliente/movimientos/movimientos';
import { Prestamos } from './pages/cliente/prestamos/prestamos';
import { Transferencias } from './pages/cliente/transferencias/transferencias';
import { ManagerLayout } from './pages/manager/manager-layout/manager-layout';
import { Clientes } from './pages/manager/clientes/clientes';
import { Manager } from './pages/manager/manager';
import { Creditos } from './pages/manager/creditos/creditos';
import { EjecutivoLayout } from './pages/ejecutivo/ejecutivo-layout/ejecutivo-layout';
import { Datoscliente } from './pages/ejecutivo/datoscliente/datoscliente';
import { Datoscredito } from './pages/ejecutivo/datoscredito/datoscredito';
import { Datoscuenta } from './pages/ejecutivo/datoscuenta/datoscuenta';
import { GerenteLayout } from './pages/gerente/gerente-layout/gerente-layout';
import { AuthGuardService } from './services/auth-guard.service';
import { RoleGuardService } from './services/role-guard.service';

export const routes: Routes = [
    {path: '', component: Home},
    {path: 'register', component: Register},
    {path: 'logincliente', component: Logincliente},
    {path: 'loginejecutivo', component: Loginejecutivo},
    {path: 'loginmanager', component: Loginmanager},

    // === REDIRECCIONES PARA RUTAS PRINCIPALES ===
    {path: 'cliente-layout', redirectTo: 'cliente-layout/micuenta', pathMatch: 'full'},
    {path: 'manager-layout', redirectTo: 'manager-layout/clientes', pathMatch: 'full'},
    {path: 'gerente-layout', redirectTo: 'gerente-layout/clientes', pathMatch: 'full'},
    {path: 'ejecutivo-layout', redirectTo: 'ejecutivo-layout/datoscliente', pathMatch: 'full'},

    // === RUTAS PROTEGIDAS ===
    {path: 'cliente-layout',
        component: ClienteLayout,
        canActivate: [AuthGuardService, RoleGuardService],
        data: { expectedRole: 'cliente' },
        children: [
            {path: '', redirectTo: 'micuenta', pathMatch: 'full'},
            {path: 'micuenta', component: Micuenta},
            {path: 'credito', component: Credito},
            {path: 'movimientos', component: Movimientos},
            {path: 'prestamos', component: Prestamos},
            {path: 'transferencias', component: Transferencias},
            {path: '**', redirectTo: 'micuenta'}
        ]
    },

    {path: 'manager-layout',
        component: ManagerLayout,
        canActivate: [AuthGuardService, RoleGuardService],
        data: { expectedRole: 'manager' },
        children: [
            {path: '', redirectTo: 'clientes', pathMatch: 'full'},
            {path: 'clientes', component: Clientes},
            {path: 'creditos', component: Creditos},
            {path: 'prestamos', component: Prestamos},
            {path: 'transferencias', component: Transferencias},
            {path: '**', redirectTo: 'clientes'}
        ]
    },

    {path: 'gerente-layout',
        component: GerenteLayout,
        canActivate: [AuthGuardService, RoleGuardService],
        data: { expectedRole: 'manager' }, // Mismo rol que manager
        children: [
            {path: '', redirectTo: 'clientes', pathMatch: 'full'},
            {path: 'clientes', component: Clientes},
            {path: 'creditos', component: Creditos},
            {path: 'prestamos', component: Prestamos},
            {path: 'transferencias', component: Transferencias},
            {path: '**', redirectTo: 'clientes'}
        ]
    },

    {path: 'ejecutivo-layout',
        component: EjecutivoLayout,
        canActivate: [AuthGuardService, RoleGuardService],
        data: { expectedRole: 'ejecutivo' },
        children: [
            {path: '', redirectTo: 'datoscliente', pathMatch: 'full'},
            {path: 'datoscliente', component: Datoscliente},
            {path: 'datoscredito', component: Datoscredito},
            {path: 'datoscuenta', component: Datoscuenta},
            {path: '**', redirectTo: 'datoscliente'}
        ]
    },

    // Ruta para cualquier otra ruta no definida
    {path: '**', redirectTo: ''}
];