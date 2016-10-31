import { Component, OnInit, OnDestroy } from '@angular/core';
import {Place} from "./place";
import {PlaceListService} from "./place-list.service";
import {Router, ActivatedRoute} from "@angular/router";

declare var firebase: any;


@Component({
	selector: 'app-place-list',
	templateUrl: 'place-list.component.html'
})
export class PlaceListComponent implements OnInit,OnDestroy {
	
	places: Place[] = [];
	subscribe: any;
	currentPage: number;

	
	constructor(private placeListService: PlaceListService, private router: Router, private route: ActivatedRoute) {
	}
	
	ngOnInit() {
		
		this.subscribe = this.route.params.subscribe(params => {
			this.currentPage = +params['page'];

		});
		
		
		this.placeListService.onGetPlacesFromDatabase(this.currentPage);
		//this.places = this.placeListService.getPlaces();
		this.placeListService.placesChanged.subscribe(
			(places: Place[])=> this.places = places
		);
		
	}
	
	ngOnDestroy(){
		this.subscribe.unsubscribe();
	}
	
	//아이디를 넘기를 걸 다시배워야 할거 같아
	onSelectItem(place: Place){
		this.router.navigate(['/placelist/detail', place.id]);
		console.log(place.id);
	}
	

	
	//post 데이터를 가져오는 것입니다
	onGetPlaces(){
		this.placeListService.onGetPlacesFromDatabase(this.currentPage);
		
	}
	
	
}
