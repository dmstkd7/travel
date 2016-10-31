
import { Routes, RouterModule } from '@angular/router';
import {PlaceDetailComponent} from "./place-detail/place-detail.component";
import {PlaceAddComponent} from "./place-add/place-add.component";
import {PlaceListComponent} from "./place-list.component";
import {PlaceMainComponent} from "./place-main.component";




const placeMainRoutes: Routes = [
	{
		path: '',
		component: PlaceMainComponent,
		children: [
			{
				path: '',
				redirectTo: 'list/1',
				pathMatch: 'full'
			},
			{
				path: 'list/:page',
				component:PlaceListComponent
			},
			{
				path: 'addPlace',
				component: PlaceAddComponent
			},
			{
				path: 'detail/:id',
				component: PlaceDetailComponent
			}
		]
	}
];
export const placeListRouting = RouterModule.forChild(placeMainRoutes);



