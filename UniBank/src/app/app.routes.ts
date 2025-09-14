import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { register } from 'module';
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
import path from 'path';
import { ManagerLayout } from './pages/manager/manager-layout/manager-layout';
import { Clientes } from './pages/manager/clientes/clientes';
import { Manager } from './pages/manager/manager';
import { Creditos } from './pages/manager/creditos/creditos';
import { EjecutivoLayout } from './pages/ejecutivo/ejecutivo-layout/ejecutivo-layout';
import { Datoscliente } from './pages/ejecutivo/datoscliente/datoscliente';
import { Datoscredito } from './pages/ejecutivo/datoscredito/datoscredito';
import { Datoscuenta } from './pages/ejecutivo/datoscuenta/datoscuenta';

export const routes: Routes = [
    {path: '',component:Home, },
    {path: 'register',component: Register},
    {path: 'logincliente',component: Logincliente},
    {path: 'loginejecutivo',component: Loginejecutivo},
    {path: 'loginmanager',component: Loginmanager},

    {path: 'cliente-layout',
        component: ClienteLayout,
        children: [
            {path:'micuenta',component: Micuenta},
            {path:'credito',component: Credito },
            {path:'movimientos',component: Movimientos},
            {path:'prestamos',component: Prestamos},
            {path:'transferencias',component: Transferencias}
        ]

     },

    {path: 'manager',
        component: Manager,
        children: [
            {path:'manager-layout',component: ManagerLayout},
            {path:'clientes',component: Clientes},
            {path:'creditos',component: Creditos},
            {path:'prestamos',component: Prestamos},
            {path:'transferencias',component: Transferencias}
        ]

     },

    {path: 'ejecutivo-layout',
        component: EjecutivoLayout,
        children: [
            {path:'datoscliente',component: Datoscliente},
            {path:'datoscredito',component: Datoscredito},
            {path:'datoscuenta',component: Datoscuenta},
        ]

     }
];
