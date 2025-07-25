import { Routes } from '@angular/router';
import { ProductsComponent } from './pages/products/products';
import { UsersComponent } from './pages/users/users'; // <-- Importa el componente
import { ProfilesComponent } from './pages/profiles/profiles'; // <-- Importa

export const routes: Routes = [
    { 
        path: '', 
        redirectTo: 'profiles', 
        pathMatch: 'full' 
    },
    {
        path: 'products',
        component: ProductsComponent
    },
    { 
        path: 'users', 
        component: UsersComponent 
    },
    { 
        path: 'profiles', 
        component: ProfilesComponent 
    } 
];
