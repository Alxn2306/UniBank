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

     }

];
