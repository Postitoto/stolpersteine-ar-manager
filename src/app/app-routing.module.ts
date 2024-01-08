import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LocationListComponent } from './pages/location-list/location-list.component';
import { LocationComponent } from './pages/location/location.component';
import { LocationsComponent } from './pages/locations/locations.component';
import { StolpersteineComponent } from './pages/stolpersteine/stolpersteine.component';
import { TourListComponent } from './pages/tour-list/tour-list.component'
import { TourComponent } from './pages/tour/tour.component';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'locations', component: LocationsComponent},
  {path: 'locations/list', component: LocationListComponent},
  {path: 'locations/:coords', component: LocationComponent},
  {path: 'locations/stolperstein/add/:loc-id', component: StolpersteineComponent},
  {path: 'locations/stolperstein/edit/:coordinates/:stein-id', component: StolpersteineComponent},
  {path: 'tours/list', component: TourListComponent},
  {path: 'tours/:id', component: TourComponent},

  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
