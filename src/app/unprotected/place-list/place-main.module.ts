import { NgModule }       from '@angular/core';
import { CommonModule }   from '@angular/common';
import {placeListRouting} from "./place-main.routes";
import {AuthService} from "../../shared/auth.service";
import {AuthGuard} from "../../shared/auth.guard";
import {PlaceDetailComponent} from "./place-detail/place-detail.component";
import {PlaceAddComponent} from "./place-add/place-add.component";
import {PlaceListComponent} from "./place-list.component";
import {PlaceMainComponent} from "./place-main.component";
import { HttpModule} from "@angular/http";
import {FormsModule} from "@angular/forms";

import { FileSelectDirective } from 'ng2-file-upload';


@NgModule({
	imports: [
		CommonModule,
		placeListRouting,
		FormsModule,
		HttpModule
	],
	declarations: [
		PlaceMainComponent,
		PlaceDetailComponent,
		PlaceAddComponent,
		PlaceListComponent,
		FileSelectDirective
	],
	providers: [
		AuthService,
		AuthGuard
	]
})

export class PlaceMainModule {}