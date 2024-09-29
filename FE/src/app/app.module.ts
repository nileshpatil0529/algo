import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AlertComponent } from './components/alert/alert.component';
import { IstDatePipe } from './pipes/ist-date.pipe';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { FutureComponent } from './components/future/future.component';
import { OptionComponent } from './components/option/option.component';

@NgModule({
  declarations: [
    AppComponent,
    AlertComponent,
    IstDatePipe,
    LandingPageComponent,
    FutureComponent,
    OptionComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule 
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
