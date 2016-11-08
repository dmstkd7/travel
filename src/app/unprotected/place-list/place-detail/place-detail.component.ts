import {Component, OnInit, OnDestroy} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {PlaceListService} from "../place-list.service";
import {Place} from "../place";
import {AuthService} from "../../../shared/auth.service";

declare var google: any;
declare var firebase: any;

@Component({
	selector: 'app-place-detail',
	templateUrl: 'place-detail.component.html'
})
export class PlaceDetailComponent implements OnInit, OnDestroy {
	
	subscribe: any;
	place: Place;
	currentPlaceId: string;
	gallery_picture = ''
	
	constructor(private placeListService: PlaceListService , private route: ActivatedRoute, private authService: AuthService) { }
	
	ngOnInit( ){
		
		var storageRef = firebase.storage().ref();
		
		this.subscribe = this.route.params.subscribe(params => {
			let id = +params['id'];
			this.currentPlaceId = "" +id;
			this.place = this.placeListService.getPlace(id);
			/*
			 이미지 list를 넣는 것입니다
			 */
			storageRef.child('photos/' + id + '.jpg').getDownloadURL().then(function(url) {
				// Get the download URL for 'images/stars.jpg'
				// This can be inserted into an <img> tag
				// This can also be downloaded directly
				document.getElementById("gallery_img")['src'] = url;
				
			}).catch(function(error) {
				document.getElementById("gallery_img")['src'] = "http://cfile21.uf.tistory.com/image/222EEA3F56542C812CEA83";
			});
			
			
		});
		//console.log(this.place);
		
		
		// 구글맵을 하기 위한 타입스크립트 입니다
		var area = new google.maps.LatLng(this.place.latitude,this.place.longitude);
		var mapProperty = {
			center: area,
			zoom: 13,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		var map = new google.maps.Map(document.getElementById("listing-detail-map"), mapProperty);
		
		var marker = new google.maps.Marker({
			map: map,
			anchorPoint: new google.maps.Point(0, -29)
		});
		
		var markerPosition = new google.maps.LatLng(this.place.latitude,this.place.longitude)

		map.setCenter(markerPosition);
		marker.setPosition(markerPosition);
		marker.setVisible(true);
		
	}
	
	ngOnDestroy(){
		this.subscribe.unsubscribe();
	}
	
	
	onSubmit() {
		//HTML의 아이디를 통해서 값을 가져옵니다

		var rating = document.getElementById("place-rate")['value'];
		var user = this.authService.getLoginUserUid();
		
		this.placeListService.setUserPlaceRating(user, this.currentPlaceId, rating).subscribe(
			data => console.log(data),
			error => console.error(error)
		);
	}
}
