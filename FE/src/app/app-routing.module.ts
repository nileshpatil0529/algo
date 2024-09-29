import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AlertComponent } from './components/alert/alert.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { OptionComponent } from './components/option/option.component';
import { FutureComponent } from './components/future/future.component';

const routes: Routes = [
  { path: '', component: LandingPageComponent},
  { path: 'option', component: OptionComponent},
  { path: 'future', component: FutureComponent},
  { path: 'alert', component: AlertComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
