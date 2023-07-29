// Angular Modules
import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {DragDropModule} from '@angular/cdk/drag-drop'; 
// Angular Material
import {MatFormFieldModule} from '@angular/material/form-field'; 
import {MatInputModule} from '@angular/material/input'; 
import {MatButtonModule} from '@angular/material/button'; 
import {MatListModule} from '@angular/material/list'; 
import {MatToolbarModule} from '@angular/material/toolbar'; 
import {MatIconModule} from '@angular/material/icon'; 
import {MatExpansionModule} from '@angular/material/expansion'; 
import {MatDividerModule} from '@angular/material/divider'; 
import {MatDialogModule} from '@angular/material/dialog'; 
import {MatSnackBarModule} from '@angular/material/snack-bar'; 
import {MatStepperModule} from '@angular/material/stepper'; 
import {MatSelectModule} from '@angular/material/select';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner'; 
import {MatDatepickerModule} from '@angular/material/datepicker'; 
import { MatMomentDateModule, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
// Services
import { DataService } from './services/data/data.service';
// Components (and page components)
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { MapViewComponent } from './components/map-view/map-view.component';
import { LocationFormComponent } from './components/forms/location-form/location-form.component';
import { LocationsComponent } from './pages/locations/locations.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { LocationDetailComponent } from './components/location-detail/location-detail.component';
import { ConfirmationComponent } from './components/dialogs/confirmation/confirmation.component';
import { StolpersteineComponent } from './pages/stolpersteine/stolpersteine.component';
import { StolpersteinFormComponent } from './components/forms/stolperstein-form/stolperstein-form.component';
import { RelationFormComponent } from './components/forms/relation-form/relation-form.component';
import { LifeStationFormComponent } from './components/forms/life-station-form/life-station-form.component';
import { AuthInterceptor } from './util-config/authentication/auth-interceptor';
import { LoginComponent } from './components/dialogs/login/login.component';
import { LocationListComponent } from './pages/location-list/location-list.component';
import { MapPopupComponent } from './components/dialogs/map-popup/map-popup.component';
import { LocationComponent } from './pages/location/location.component';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { GERMAN_CUSTOM_DATE_FORMAT } from './util-config/custom-date-format';
import { TextboxFormComponent } from './components/forms/textbox-form/textbox-form.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    MapViewComponent,
    LocationFormComponent,
    ToolbarComponent,
    LocationsComponent,
    LocationListComponent,
    ConfirmationComponent,
    StolpersteineComponent,
    StolpersteinFormComponent,
    RelationFormComponent,
    LifeStationFormComponent,
    LoginComponent,
    LocationDetailComponent,
    MapPopupComponent,
    LocationComponent,
    TextboxFormComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatListModule,
    MatToolbarModule,
    MatIconModule,
    MatExpansionModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatStepperModule,
    MatSelectModule,
    DragDropModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatMomentDateModule
  ],
  providers: [
    Title,
    DataService,
    FormBuilder,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: {useUtc: true}},
    {provide: MAT_DATE_FORMATS, useValue: GERMAN_CUSTOM_DATE_FORMAT}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
