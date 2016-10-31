
import {Place} from "./place";
import {Injectable, EventEmitter} from "@angular/core";
import {Http, Response, Headers} from "@angular/http";
import 'rxjs/Rx';

declare var firebase: any

@Injectable()
export class PlaceListService{
	

	private places: Place[] = [];
	placesChanged = new EventEmitter<Place[]>();
	
	constructor(private http: Http){}
	

	//places의 길이를 구하는 함수입니다 id를 부여할 때 사용합니다
	getPlacesLength(){
		return this.places.length;
	}
	
	
	getPlace(id: number | string){
		for(let place of this.places) {
			if (place.id === id)
				return place;
		}
	}
	
	getPlaces(){

	}
	
	
	addPlace(place: Place){
		this.places.push(place);
		console.log(this.places.length);
	}
	
	deleteRecipe(place: Place){
		this.places.splice(this.places.indexOf(place), 1);
	}
	
	editPlace(oldPlace: Place, newPlace: Place){
		this.places[this.places.indexOf(oldPlace)] = newPlace;
	}
	
	//장소를 저장하는 역할을 하고 있습니다
	storePlace(place: Place){
		const body = JSON.stringify(place);
		const headers = new Headers({
			'Content-Type': 'application/json'
		});
		
		//아이디를 부여하기 위해서 firebase에 몇개가 있는지 알려주는 함수입니다
		//원래라면 place-add component에서 하는 것이 맞으나 잘 되지 않아 service에서 처리하게 되었습니다
		//나중에 기회가 된다면 id부여를 add-place에서 처리할 수 있도록 하겠습니다
		
		var ref = firebase.database().ref("places");
		var new_id:number
		ref.once("value")
			.then(function(snapshot) {
				var a = snapshot.numChildren();
				
				place['id']= a+1;
				console.log(place['id']);
				console.log("제대로 갔다");
			});
		
		
		
		return this.http.post('https://travel-bd272.firebaseio.com/places.json',body, {headers: headers})
			.map((data: Response) => data.json());
		
		
	}
	
	
	//데이터를 서버쪽으로 부터 가져오는 함수입니다
	/* put 함수를 이용할 때 사용하던 방식입니다 지금은 post방식을 사용합니다
	 fetchData(){
	 return this.http.get('https://travel-bd272.firebaseio.com/places.json?print=pretty')
	 .map((data: Response) => data.json())
	 .subscribe(
	 data => {
	 const myArray = [];
	 for (let key in data){
	 myArray.push(data[key]);
	 
	 }
	 this.places = myArray;
	 console.log(this.places);
	 }
	 );
	 }
	 
	 */
	
	//데이터베이스의 모든 장소를 가져와서 그 중에서 장소가 일치하는 것만 가져온다
	//만약 서울일 경우에는 전체 데이터를 다 가져오면된다
	onGetPlacesFromDatabaseFilterPlace(place: string){
		return this.http.get('https://travel-bd272.firebaseio.com/places.json?&print=pretty')
			.map((data: Response) => data.json())
			.subscribe(
				(data: Place[]) => {
					const myArray =[];
					for (let key in data){
						if( (data[key]['location'] == place) || place =="서울 전지역"){
							myArray.push(data[key]);
						}
					}
					this.places = myArray;
					this.placesChanged.emit(this.places);
				}
			);
		
	}
	
	
	
	//데이터베이스에서 모든 장소들을 다 가져올 때 사용하는 방식입니다
	//최신 데이터를 sorting을 통해서 placelist에 반환시킵니다
	onGetPlacesFromDatabase(page:number){
		 return this.http.get('https://travel-bd272.firebaseio.com/places.json?&print=pretty')
			 .map((data: Response) => data.json())
			 .subscribe(
				 (data: Place[]) => {
				 	 const myArray =[];
					 for (let key in data){
					 	myArray.push(data[key]);
					 }
					 
					 //sorting해서 최신 데이터가 맨 위로 올라오게 하는 것입니다
					 myArray.sort((n1:Place,n2:Place) =>{
					 	if(n1.id > n2.id) {
						    return -1;
					    }
						 return 1;
					 });
					 
					 
					 var storageRef = firebase.storage().ref();
					 const filter = [];
					 for (let i = 10*(page-1); (i < 10*page) && i< myArray.length ; i++) {
						
						 /*
						    이미지 list를 넣는 것입니다
						  */
						 
						 storageRef.child('photos/' + myArray[i]['id'] + '.jpg').getDownloadURL().then(function(url) {
							 // Get the download URL for 'images/stars.jpg'
							 // This can be inserted into an <img> tag
							 // This can also be downloaded directly
							 myArray[i]['imgUrl'] = url;
							 console.log(url);
							
						 }).catch(function(error) {
							 myArray[i]['imgUrl'] = "http://cfile21.uf.tistory.com/image/222EEA3F56542C812CEA83";
						 });
						 
						 filter.push(myArray[i]);
					 }
					 
									
					
					 this.places = filter;
				 	
					this.placesChanged.emit(this.places);
				 }
			 );
	}
}