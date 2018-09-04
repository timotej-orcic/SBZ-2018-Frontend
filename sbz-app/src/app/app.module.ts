import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { AppRoutingModule } from './/app-routing.module';
import { RegisterComponent } from './components/register/register.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';
import { WebShopComponent } from './components/web-shop/web-shop.component';
import { AlertComponent } from './components/alert/alert.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { NgxSmartModalModule } from 'ngx-smart-modal';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    AdminPanelComponent,
    WebShopComponent,
    AlertComponent,
    NavbarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AngularFontAwesomeModule,
    NgxSmartModalModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
