import { Component } from '@angular/core';
import {AuthService} from "../auth.service";

@Component({
  selector: 'main-header',
  templateUrl: 'header.component.html'
})
export class HeaderComponent  {


  constructor(private authService: AuthService) { }


  isAuth() {
    return this.authService.isAuthenticated();
  }

  onLogout(){
    this.authService.logout();
  }
}
