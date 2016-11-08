import {Component, OnInit, Input} from '@angular/core';
import {Place} from "../place-list/place";
import {Router} from "@angular/router";
import {PlaceListService} from "../place-list/place-list.service";
import {AuthService} from "../../shared/auth.service";
declare var google: any;


@Component({
  selector: 'app-find-travel',
  templateUrl: './find-travel.component.html'
})

export class FindTravelComponent implements OnInit {
	
	places: Place[] = [];
	
	recommendPlaces: any = [];
	
	//선택된 장소와 시간
	@Input() selectedStartPlaceLat: number = 0;
	@Input() selectedStartPlaceLng: number = 0;
	selectedPlace: string;
	selectedTime: string;
	
	//외판원 순회를 하기 위한 전역함수
	distance = [];
	dp = [];
	MAX_V: number = 10;
	orderOfVisit = [];
	data:any;

	
	//아이디, 타이틀, 부제목, 설명, 가격, 주소, 도시, 전화번호, 이메일, 평점, 글작성자, 카테고리, 추천나이대, 종류, 위도, 경도, 즐기는 시간, 구종류(ex마포구, 위치)
	startPlace: Place = new Place(0, '', '' , '', 0,'','','','',0, '', '선택','선택',[], 0,0, 0, '', '');
	
	
	times = ["1시간", "2시간", "3시간", "4시간", "5시간", "6시간",
			"7시간", "8시간", "9시간", "10시간", "11시간", "12시간", "그 이상"];
	
	locations = ["서울 전지역", "마포구","서대문구","강서구","양천구","구로구",
		"영등포구","금천구","동작구","관악구","서초구","강남구","송파구",
		"강동구","광진구","중랑구","노원구","도봉구","강북구","성북구",
		"동대문구","성동구","종로구","중구","용산구", "은평구"
	];
	
    constructor(private placeListService: PlaceListService, private router: Router, private autuService: AuthService) { }
	
	
	
	ngOnInit() {
		
		
		//추천장소를 먼저 받는다
		var recommendPlaces;
		var currentUserUID = this.autuService.getLoginUserUid();
		
		
		this.placeListService.getRecommandPlace("ShgXY5S5hZeeRIksJsqP00GcOK52")
			.subscribe(
				(data: any) => {
					this.recommendPlaces = data;
					console.log("come");
					console.log(this.recommendPlaces);
				});
		
		
		
		//place가 바뀌면 바로 받을 수 있게 한 것입니다
		this.placeListService.placesChanged.subscribe(
			(places: Place[])=> this.places = places
		);
		
		//구글 지도를 표현하기 위한 타입스크립트입니다.
		var hongik = new google.maps.LatLng( 37.5506747,126.92603059999999);
		var mapProperty = {
			center: hongik,
			zoom: 13,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		var map = new google.maps.Map(document.getElementById("fullscreen-map"), mapProperty);
		
		var input = /** @type {!HTMLInputElement} */(
			document.getElementById('first-place'));
		
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
			
			document.getElementById("start-Lat").innerHTML= place.geometry.location.lat();
			document.getElementById("start-Lng").innerHTML = place.geometry.location.lng();
			
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

		
		
    }
	
	
	onPlaceChanged(place){
		this.selectedPlace = place;
	}
	
	onTimeChanged(time){
		this.selectedTime = time;
	}
	

	//아이디를 넘기를 걸 다시배워야 할거 같아
	onSelectItem(place: Place){
		this.router.navigate(['/placelist/detail', place.id]);
		console.log(place.id);
	}
	
	
	radians(num:number){
		/*
		 -- radians = degrees / (180 / pi)
		 -- RETURN nDegrees / (180 / ACOS(-1)); but 180/pi is a constant, so...
		 */
		return num/  57.29577951308232087679815481410517033235;
	}
	
	getDistance(startLat:number, startLng:number, endLat:number, endLng:number){
		return ( 6371.0 * Math.acos(
			Math.cos( this.radians( startLat ) )*Math.cos( this.radians( endLat /* 위도 */ ) )
			*Math.cos( this.radians( endLng /* 경도 */ )- this.radians( startLng ) )
			+
			Math.sin( this.radians( startLat ) ) * Math.sin( this.radians( endLat /* 위도 */ ) )
		));
	}
	

	
	onFindButtonClicked(){
		this.placeListService.onGetPlacesFromDatabaseFilterPlace(this.selectedPlace);
		
		//추천장소를 가져옵니다 먼저
		
		
		const myArray = [];
		
		//먼저 id에 맞는 place 리스트를 뽑아 내자
		//맞는 id를 찾았다면 이것이 특정 거리에 있는지 뽑아내자
		console.log(this.recommendPlaces);
		console.log("2222");
		
		for(let place of this.places){
			for( let recommendPlace of this.recommendPlaces ){
				console.log("fffffff");
				console.log(recommendPlace);
				console.log(place.id);
				if(place.id == recommendPlace){
					console.log("this come");
					if( ( place.latitude >>  this.selectedStartPlaceLat - 0.019) && (place.latitude << this.selectedStartPlaceLat +0.019)
						&& ( place.longitude >>  this.selectedStartPlaceLng - 0.022) && (place.longitude << this.selectedStartPlaceLng +0.022) ){
						myArray.push(place);
						console.log("come");
						console.log(place);
					}
				}
			}
		}
		
		
		//2km 내에 있는 장소를 모두 가져옵니다
		//처음 myArray의 첫번째 요소는 시작지점이 되야 합니다
		this.startPlace.latitude =  +document.getElementById("start-Lat").innerHTML;
		this.startPlace.longitude = +document.getElementById("start-Lng").innerHTML;
		

		
		myArray.push(this.startPlace);
		for (let place of this.places){
			if(myArray.length >10 )
				break;
			if( ( place.latitude >>  this.selectedStartPlaceLat - 0.019) && (place.latitude << this.selectedStartPlaceLat +0.019)
			&& ( place.longitude >>  this.selectedStartPlaceLng - 0.022) && (place.longitude << this.selectedStartPlaceLng +0.022) ){
				myArray.push(place);
			}
			console.log(place);
		}
		
		for(let i=0; i < myArray.length; i++){
			this.distance[i] = [];
			for(let j =0; j< myArray.length; j++){
				if(i==j){
					this.distance[i][j] = 0;
					continue;
				}
				this.distance[i][j] = this.getDistance(myArray[i].latitude, myArray[i].longitude, myArray[j].latitude, myArray[j].longitude);
			}
		}
		
		
		
		/*
		    외판원 순회를 다이나믹 프로그래밍으로 구현하고, 갔던 루트를 복구 하는 알고리즘입니다
		 */
		
		// orderOfVisit, dp초기화를 먼저 해준다
		
		for(let i =0 ; i< myArray.length; i++){
			this.dp[i] = [1 << myArray.length];
			for(let j = 0; j < (1 << myArray.length); j++){
				this.dp[i][j] = -987654321;
			}
		}
		this.orderOfVisit = [];
		this.orderOfVisit.push(0);
		
		console.log("현재 길이입니다");
		console.log(myArray.length);
		this.restruct(0, (1<<myArray.length)+1, myArray.length);
		console.log(this.orderOfVisit);
		
		
		//지도를 다시 그림
		
		var hongik = new google.maps.LatLng( 37.5506747,126.92603059999999);
		var mapProperty = {
			center: hongik,
			zoom: 13,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		var map = new google.maps.Map(document.getElementById("fullscreen-map"), mapProperty);
		
		let travelPlanCoordinates = [];
		
		
		// 마커를 표시하기 위한 것
		var image = {
			url: 'app/assets/img/logo.png',
			// This marker is 20 pixels wide by 32 pixels high.
			size: new google.maps.Size(20, 32),
			// The origin for this image is (0, 0).
			origin: new google.maps.Point(0, 0),
			// The anchor for this image is the base of the flagpole at (0, 32).
			anchor: new google.maps.Point(0, 32)
		};
		// Shapes define the clickable region of the icon. The type defines an HTML
		// <area> element 'poly' which traces out a polygon as a series of X,Y points.
		// The final coordinate closes the poly by connecting to the first coordinate.
		var shape = {
			coords: [1, 1, 1, 20, 18, 20, 18, 1],
			type: 'poly'
		};
		
		
		var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		var tests='0123456789'
		var labelIndex = 0;
		
		for(let i = 0; i< myArray.length; i++){
			let order = this.orderOfVisit[i];
			travelPlanCoordinates.push(new google.maps.LatLng(myArray[order].latitude, myArray[order].longitude));
			console.log(myArray[order].latitude);
			console.log(myArray[order].longitude);
			var test = new google.maps.LatLng(myArray[order].latitude, myArray[order].longitude);
			var marker = new google.maps.Marker({
				position: test,
				map: map,
				label: tests[labelIndex++ % tests.length],
				shape: shape,
				title: myArray[order].title,
				zIndex: i
			});
		}
		
		
		
		var lineSymbol = {
			path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
		};

		var travelPath = new google.maps.Polyline({
			path: travelPlanCoordinates,
			strokeColor: '#FF0000',
			icons: [{
				icon: lineSymbol,
				offset: '100%'
			}],
			strokeOpacity: 1.0,
			strokeWeight: 2
		});
		
		travelPath.setMap(map);
		
	}
	
	
	//외판원 순회를 하기 위한 함수입니다
	// ###########   dp, dist 등이 call by value이기 때문에 전역변수로 처리하였습니다                                        ##############
	// ###########   이것은 컴퓨터 성능을 떨어뜨리기 때문에 call by reference하는법을 배워 나중에 꼭 처리하여야 합니다       ##############
	findBestPath(current:number, visited:number, numOfPlace:number){
		//만약 다 돌았다면 처음위치로 간다
		if (visited == ((1 << (numOfPlace+1)) - 1)) {
			return 0;
		}
		
		//메모이제이션을 하여 중복된 값을 피한다
		if (this.dp[current][visited] >=0){
			return this.dp[current][visited];
		}
		
		//최적의 값을 구해야 하기 때문에 일단 큰 수로 초기화한다
		let ret = 987654321;
		
		for(let next = 0; next < numOfPlace; next++){
			//만약 한 번 들렀던 곳이거나 자기자신으로 가려고 한다면 안되니 통과시킨다
			if (visited & (1 << next)) {
				continue;
			}
			//최적의 길을 찾는다
			let candidate = this.distance[current][next] + this.findBestPath(next, visited + (1 << (next)), numOfPlace);
			if(ret> candidate){
				ret = candidate;
			}
		}
		this.dp[current][visited] = ret;
		return ret;
		
	}
	
	//최적의 길을 어떤 순서로 갔는지 복원해 내는 함수입니다
	restruct(current:number, visited:number, numOfPlace:number){
		let ifVisited;
		if( visited == ((1<<(numOfPlace+1))-1)){
			this.orderOfVisit.push(0);
			return;
		}
		
		for(let next = 0; next < numOfPlace; next++){
			if (visited & (1 << next)) continue;
			ifVisited = this.distance[current][next] + this.findBestPath(next, visited + (1 << (next)), numOfPlace);
			if(this.findBestPath(current, visited, numOfPlace) == ifVisited){
				this.orderOfVisit.push(next);
				this.restruct(next, visited + (1 << (next)), numOfPlace);
				return;
			}
		}
		
		//만약 -1이 리턴 된다면 오류가 난것입니다
		console.log("error error error error");
		return -1;
	}
	
	
}
