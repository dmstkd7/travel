import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {Place} from "../unprotected/place-list/place";
import {PlaceListComponent} from "../unprotected/place-list/place-list.component";
import {PlaceListService} from "../unprotected/place-list/place-list.service";


@Component({
  selector: 'app-home',
  templateUrl: 'home.component.html'
})
export class HomeComponent implements OnInit{

	displayPlaces:Place []= [];
	
	
	constructor(private placeListService: PlaceListService, private router: Router) { }

	ngOnInit() {
		
		//최신 데이터만 받아오기로한다
		this.placeListService.onGetPlacesFromDatabaseLatestCountVersion(8);
		this.placeListService.placesChanged.subscribe(
			(places: Place[])=> this.displayPlaces = places
		)
		
		
	}

	onClickedViewListing(){
		this.router.navigate(['/placelist/list/1']);
	}
	
	onClickedSubmmit(){
		this.router.navigate(['findtravel']);
	}
	

}

