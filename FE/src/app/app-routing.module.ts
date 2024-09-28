import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AlgoDataComponent } from './components/algo-data/algo-data.component';
import { AlertComponent } from './components/alert/alert.component';

const routes: Routes = [
  { path: '', component: AlgoDataComponent},
  { path: 'alert', component: AlertComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
