import { Component } from '@angular/core';
import { StolpersteinLocation } from 'src/app/models/stolpersteinLocation';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  allLocations: StolpersteinLocation[] = [];

  constructor(public authService: AuthenticationService) { 
  }

}
