import { Routes } from '@angular/router';

import { AccountContextResolver } from './_shared/account-context.resolver';
import { AccountLayoutComponent } from './_shared/account-layout.component';
import { accountGuard } from './_shared/account.guard';

export const routes: Routes = [
  {
    path: '',
    component: AccountLayoutComponent,
    canActivate: [accountGuard],
    resolve: {
      accountContext: AccountContextResolver
    },
    children: [
      { path: '', redirectTo: 'user', pathMatch: 'full' },
      {
        path: 'user',
        loadChildren: () => import('./user/routes').then(m => m.routes),
        data: { title: '個人設定' }
      },
      {
        path: 'organization',
        loadChildren: () => import('./organization/routes').then(m => m.routes),
        data: { title: '組織管理' }
      },
      {
        path: 'team',
        loadChildren: () => import('./team/routes').then(m => m.routes),
        data: { title: '團隊管理' }
      },
      {
        path: 'partner',
        loadChildren: () => import('./partner/routes').then(m => m.routes),
        data: { title: '夥伴管理' }
      },
      {
        path: 'admin',
        children: [
          {
            path: '',
            redirectTo: 'monitoring',
            pathMatch: 'full'
          },
          {
            path: 'monitoring',
            loadChildren: () => import('./admin/monitoring/routes').then(m => m.routes),
            data: { title: '系統監控' }
          }
        ]
      }
    ]
  }
];
