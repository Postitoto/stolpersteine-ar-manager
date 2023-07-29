import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { UserToken } from 'src/app/models/userToken';
import { AuthenticationService } from 'src/app/services/authentication/authentication.service';
import { Logger } from 'src/app/util-config/logger';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword: string;
  isPwVisible: boolean;
  showWarnMsg: boolean;
  showLoadingSpinner: boolean;
  constructor(private authService: AuthenticationService,
              private formbuilder: FormBuilder,
              private dialog: MatDialog) { 
    this.loginForm = this.formbuilder.group({
      'username': ['', Validators.required],
      'password': ['', Validators.required]
    });
    this.showPassword = 'password';
    this.isPwVisible = false;
    this.showWarnMsg = false;
    this.showLoadingSpinner = false;
  }

  async sendLogin() {
    this.showLoadingSpinner = true;
    this.authService.fetchUserToken(
      this.loginForm.value.username,
      this.loginForm.value.password
    ).then(token => {
      this.showLoadingSpinner = false;
      this.showWarnMsg = false;
      this.authService.setUserCredentials(token.token, this.loginForm.value.username);
      this.dialog.getDialogById('loginDialog')?.close();
      Logger.consoleLog(token);
    }, () => {
      this.showLoadingSpinner = false;
      this.showWarnMsg = true;
      this.loginForm.reset();
    });
  }

  toggleShowPassword() {
    if (this.showPassword === 'password') {
      this.showPassword = 'text';
      this.isPwVisible = true;
    } else {
      this.showPassword = 'password';
      this.isPwVisible = false;
    }
  }

  @HostListener('keyup.enter')
  onEnterKeyUp() {
    this.sendLogin();
  }

  @HostListener('keyup.esc')
  onEscKeyUp() {
    this.dialog.getDialogById('loginDialog')?.close();
  }
}
