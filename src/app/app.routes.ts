

import {Routes, RouterModule} from "@angular/router";
import {AuthGuard} from "./shared/auth.guard";
import {HomeComponent} from "./home/home.component";
import {SignupComponent} from "./unprotected/signup/signup.component";
import {SigninComponent} from "./unprotected/signin/signin.component";
import {BlogComponent} from "./unprotected/blog/blog.component";
import {PageNotFoundComponent} from "./shared/page-not-found/page-not-found.component";
import {FindTravelComponent} from "./unprotected/find-travel/find-travel.component";

const APP_ROUTES: Routes = [
	
    {path: '', redirectTo: '/home', pathMatch:'full'},
	{path: 'home', component: HomeComponent},
    {path: 'signup', component: SignupComponent },
    {path: 'signin', component: SigninComponent },
	{path: 'placelist', loadChildren: 'app/unprotected/place-list/place-main.module#PlaceMainModule'},
	{path: 'findtravel', component: FindTravelComponent },
	{path: '**', component: PageNotFoundComponent }

  //canActivate: [AuthGuard]를 하면 이렇게 된다
];

export const routing = RouterModule.forRoot(APP_ROUTES);
