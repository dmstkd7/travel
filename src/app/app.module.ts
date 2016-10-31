import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import {HomeComponent} from "./home/home.component";
import {HeaderComponent} from "./shared/header/header.component";
import {routing} from "./app.routes";
import {AuthGuard} from "./shared/auth.guard";
import {AuthService} from "./shared/auth.service";
import {SigninComponent} from "./unprotected/signin/signin.component";
import {SignupComponent} from "./unprotected/signup/signup.component";
import {BlogComponent} from "./unprotected/blog/blog.component";
import { PageNotFoundComponent } from './shared/page-not-found/page-not-found.component';
import { FindTravelComponent } from './unprotected/find-travel/find-travel.component';
import {PlaceListService} from "./unprotected/place-list/place-list.service";



@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        HeaderComponent,
        SignupComponent,
        SigninComponent,
	    BlogComponent,
	    PageNotFoundComponent,
	    FindTravelComponent,

    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        routing,
        ReactiveFormsModule
    ],
    providers: [
        AuthService,
        AuthGuard,
	    PlaceListService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
