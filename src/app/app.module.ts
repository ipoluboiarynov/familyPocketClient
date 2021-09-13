import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { AuthLayoutComponent } from './auth-layout/auth-layout.component';
import { LoginComponent } from './auth-layout/login/login.component';
import { RegisterComponent } from './auth-layout/register/register.component';
import { DashboardComponent } from './admin-layout/dashboard/dashboard.component';
import { RecordsComponent } from './admin-layout/records/records.component';
import { StatisticsComponent } from './admin-layout/statistics/statistics.component';
import { SettingsComponent } from './admin-layout/settings/settings.component';
import { NavbarComponent } from './admin-layout/components/navbar/navbar.component';
import { SidebarComponent } from './admin-layout/components/sidebar/sidebar.component';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {ToastrModule} from "ngx-toastr";
import {CollapseModule} from "ngx-bootstrap/collapse";
import {PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface, PerfectScrollbarModule} from "ngx-perfect-scrollbar";
import { FilterCategoriesByTypePipe } from './shared/pipes/filter-categories-by-type.pipe';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

@NgModule({
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    AuthLayoutComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    RecordsComponent,
    StatisticsComponent,
    SettingsComponent,
    NavbarComponent,
    SidebarComponent,
    FilterCategoriesByTypePipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    CollapseModule.forRoot(),
    PerfectScrollbarModule
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
