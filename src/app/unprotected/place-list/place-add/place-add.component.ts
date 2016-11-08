import {Component, OnChanges, Input, EventEmitter, Output, OnInit, Directive} from '@angular/core';
import {Place} from "../place";
import {PlaceListService} from "../place-list.service";
import {AuthService} from "../../../shared/auth.service";
import {Router} from "@angular/router";



declare var google: any;
declare var firebase: any;


const URL = "gs://travel-bd272.appspot.com"

@Component({
	selector: 'app-place-add',
	templateUrl: 'place-add.component.html',
	styleUrls: ['place-add.component.css'],
})



export class PlaceAddComponent implements OnChanges , OnInit{
	

	
	@Output() cleared = new EventEmitter();
	//@Input()을 해야 하는지 아닌지 잘 모르겠다
	
	
	imgUrl = '';
	uploadedImg = false;
	

	userEmail = this.authService.getLoginUserEmail();
	//place_id를 부여하기 위해  place를 구하는 것입니다
	place_id :number;
	
	place: Place;
	places:Place[];
	
	//카테고리를 정하는 곳입니다
	category = [ "맛집", "재밌는곳"];
	//추천 나이대를 정하는 곳입니다. 나중에 복수로 선택할 수 있게 해줘야 합니다
	recommandAge = [ "10대", "20대", "30대", "40대", "50대"];
	locations = ["마포구","서대문구","강서구","양천구","구로구",
		"영등포구","금천구","동작구","관악구","서초구","강남구","송파구",
		"강동구","광진구","중랑구","노원구","도봉구","강북구","성북구",
		"동대문구","성동구","종로구","중구","용산구", "은평구"
	];
	

	
	
	//고치는건지 더하는건지 나타내는 변수입니다
	isAdd = true;
	
	constructor(private pls: PlaceListService , private authService: AuthService, private router: Router) {
		//아이디, 타이틀, 부제목, 설명, 가격, 주소, 도시, 전화번호, 이메일, 평점, 글작성자, 카테고리, 추천나이대, 종류, 위도, 경도, 즐기는 시간, 구종류(ex마포구, 위치), imgURL
		
		//아이디를 처음에 부여받는것입니다
		let that = this;
		var ref = firebase.database().ref("places");
		var new_id:number
		ref.once("value")
			.then(function(snapshot) {
				var a = snapshot.numChildren();
				that.place_id= a+1;
				console.log("아이디 체크");
				console.log(that.place_id);
			});
		
		this.place =  new Place(0, '', '' , '', 0,'','','','',0, this.userEmail, '선택','선택',[], 0,0, 0, '', '');
		
	}
	
	ngOnInit(){
		
		
		this.pls.placesChanged.subscribe(
			(places: Place[])=> this.places = places
		);

		
		var hongik = new google.maps.LatLng( 37.5506747,126.92603059999999);
		var mapProperty = {
			center: hongik,
			zoom: 13,
			mapTypeId: google.maps.MapTypeId.ROAD
		};
		var map = new google.maps.Map(document.getElementById("map-canvas"), mapProperty);
		
		var input = /** @type {!HTMLInputElement} */(
			document.getElementById('pac-input'));
		
		map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
		var autocomplete = new google.maps.places.Autocomplete(input);
		autocomplete.bindTo('bounds', map);
		
		var infowindow = new google.maps.InfoWindow();
		var marker = new google.maps.Marker({
			map: map,
			anchorPoint: new google.maps.Point(0, -29)
		});
		
		autocomplete.addListener('place_changed', function() {
			infowindow.close();
			marker.setVisible(false);
			var place = autocomplete.getPlace();
			if (!place.geometry) {
				window.alert("Autocomplete's returned place contains no geometry");
				return;
			}
			
			// If the place has a geometry, then present it on a map.
			if (place.geometry.viewport) {
				map.fitBounds(place.geometry.viewport);
			} else {
				map.setCenter(place.geometry.location);
				map.setZoom(17);  // Why 17? Because it looks good.
			}
			marker.setIcon(/** @type {google.maps.Icon} */({
				url: place.icon,
				size: new google.maps.Size(71, 71),
				origin: new google.maps.Point(0, 0),
				anchor: new google.maps.Point(17, 34),
				scaledSize: new google.maps.Size(35, 35)
			}));
			marker.setPosition(place.geometry.location);
			marker.setVisible(true);
			
			var address = '';
			if (place.address_components) {
				address = [
					(place.address_components[0] && place.address_components[0].short_name || ''),
					(place.address_components[1] && place.address_components[1].short_name || ''),
					(place.address_components[2] && place.address_components[2].short_name || '')
				].join(' ');
			}
			
			infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
			infowindow.open(map, marker);
		});
		
		
		// This event listener calls addMarker() when the map is clicked.
		google.maps.event.addListener(map, 'click', function(event) {
			
			map.setCenter(event.latLng, map);
			marker.setPosition(event.latLng);
			//아이디를 빨리 부여
			document.getElementById("place-latitude")['value'] = event.latLng.lat();
			document.getElementById("place-longitude")['value'] = event.latLng.lng();
			
		});
		// Add a marker at the center of the map.
		
		
		/*
			파일 업로드 하는 부분입니다 참조하실 영상은 www.youtube.com/watch?v=SpxHVrpfGgU 입니다
		 */
		
		//get elements
		var uploader = document.getElementById('uploader');
		var fileButton = document.getElementById('fileButton');
		
		// Listen for file selection
		fileButton.addEventListener('change', function(e:any){
			//get file
			let that = this;
			var file = e.target.files[0];
			
			//create a storage ref
			var storage = firebase.storage();
			var storageRef = storage.ref('photos/' + file.name);
			
			
			var task = storageRef.put(file);
			
			task.on('state_changed',
				function progress(snapshot){
					var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
					uploader['value'] = percentage;
				},
				function error(err){
					
				},
				function complete() {
					
					var tt = that;
					/*
					 이미지 list를 넣는 것입니다
					 */
					storage.ref().child('photos/' + file.name).getDownloadURL().then(function(url) {
						// Get the download URL for 'images/stars.jpg'
						// This can be inserted into an <img> tag
						// This can also be downloaded directly
						tt.place.imgUrl = url;
						console.log(url);
						
					}).catch(function(error) {
						tt.place.imgUrl = "http://cfile21.uf.tistory.com/image/222EEA3F56542C812CEA83";
					});
					
				}
			);
			
			//Upload file
			storageRef.getDownloadURL().then(url => that.imgUrl = url);
			that.uploadedImg = true;
			//Update progress bar
		})
		
		
	}
	
	
	//아직 이것을 왜 하는지 잘 모르겠다
	ngOnChanges(changes) {
		if(changes.place.currentValue === null){
			this.isAdd = true;
		} else {
			this.isAdd = false;
		}
		
	}
	
	onSubmit(place: Place) {
		//HTML의 아이디를 통해서 값을 가져옵니다
		this.place.latitude = document.getElementById("place-latitude")['value'];
		this.place.longitude = document.getElementById("place-longitude")['value'];
		
		let newPlace = new Place(this.place_id, place.title, place.subtitle, place.description, place.price,
			place.address, place.city, place.phone, place.email, place.rating,
			this.userEmail, this.place.category, this.place.recommandAge, this.place.type,
			this.place.latitude, this.place.longitude, this.place.playingTime, this.place.location, ' ');
		if(!this.isAdd){
			this.pls.editPlace(this.place, newPlace);
			this.onClear();
		} else{
			
			this.place = newPlace;
			//this.pls.addPlace(this.place);
		}
	
		
		console.log(this.place['id']);
		
		this.pls.storePlace(this.place).subscribe(
			data => console.log(data),
			error => console.error(error)
		);
		
		this.router.navigate(['/placelist/list/1']);
	}
	
	onClear(){
		this.isAdd = true;
		this.cleared.emit(null);
	}
	
	
	onCategoryChange(categoryValue) {
		console.log(categoryValue);
		this.place.category = categoryValue;
	}
	
	onRecommandAgeChange(ageValue) {
		console.log(ageValue);
		this.place.recommandAge = ageValue;
	}
	
	onAmenitiesChange(addType){
		this.place.type.push(addType);
	}
	
	onLocationChange(location: string){
		this.place.location = location;
	}
	
	
	
}
