import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AuthLayoutComponent} from "./auth-layout/auth-layout.component";
import {AdminLayoutComponent} from "./admin-layout/admin-layout.component";
import {LoginComponent} from "./auth-layout/login/login.component";
import {RegisterComponent} from "./auth-layout/register/register.component";
import {DashboardComponent} from "./admin-layout/dashboard/dashboard.component";
import {RecordsComponent} from "./admin-layout/records/records.component";
import {StatisticsComponent} from "./admin-layout/statistics/statistics.component";
import {SettingsComponent} from "./admin-layout/settings/settings.component";
import {AuthGuard} from "./shared/guards/auth.guard";

const routes: Routes = [
  {path: '', component: AuthLayoutComponent, children: [
      {path: '', redirectTo: '/login', pathMatch: 'full'},
      {path: 'login', component: LoginComponent},
      {path: 'register', component: RegisterComponent}
    ]},
  {path: '', component: AdminLayoutComponent, canActivate: [AuthGuard], canActivateChild: [AuthGuard],
    children: [
      {path: 'dashboard', component: DashboardComponent},
      {path: 'records', component: RecordsComponent},
      {path: 'statistics', component: StatisticsComponent},
      {path: 'settings', component: SettingsComponent}
    ]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
