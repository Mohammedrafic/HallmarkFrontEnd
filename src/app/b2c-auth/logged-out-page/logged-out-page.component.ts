import { Component, OnInit } from '@angular/core';
import { SsoManagement } from '../sso-management';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logged-out-page',
  templateUrl: './logged-out-page.component.html',
  styleUrls: ['./logged-out-page.component.scss'],
})
export class LoggedOutPageComponent implements OnInit {
  ssoAvailable = false;
  domainHint: string | null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.checkSso();

    if (!this.ssoAvailable) {
      this.goToLogin();
    }
  }

  checkSso() {
    this.ssoAvailable = SsoManagement.isSsoAvailable();
    if (this.ssoAvailable) {
      const ssoInformation = SsoManagement.getSsoInformation();
      this.domainHint = ssoInformation.domainHint;
    }
  }

  clearSsoAndLogin() {
    SsoManagement.clearSsoInformation();
    this.ssoAvailable = false;
    this.goToLogin();
  }

  goToLogin() {
    this.router.navigate(['/', 'login']);
  }
}

