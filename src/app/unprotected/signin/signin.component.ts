import { Component, OnInit } from '@angular/core';
import {AuthService} from "../../shared/auth.service";
import {FormBuilder, FormGroup} from "@angular/forms";
import {Validators} from "@angular/forms";

@Component({
  selector: 'app-signin',
  templateUrl: 'signin.component.html'
})
export class SigninComponent implements OnInit {

  myForm: FormGroup;
  error = false;

  constructor(private fb: FormBuilder, private authService: AuthService) { }

  onSignin(){
    this.authService.signinUser(this.myForm.value);
  }

  ngOnInit() : any {
    this.myForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

}
