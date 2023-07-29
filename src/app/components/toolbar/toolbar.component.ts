import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { LoginComponent } from '../dialogs/login/login.component';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {

  constructor(private dialog: MatDialog,
              public authService: AuthenticationService,
              private router: Router) { }

  openLogin() {
    this.dialog.open(LoginComponent, {id: 'loginDialog'});
  }

  logout() {
    this.authService.logoutUser();
    this.router.navigate(['/']);
  }
}
