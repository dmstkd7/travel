
import {Place} from "./place";
import {Injectable, EventEmitter} from "@angular/core";
import {Http, Response, Headers} from "@angular/http";
import "rxjs/Rx";
import {AuthService} from "../../shared/auth.service";

declare var firebase: any

@Injectable()
export class PlaceListService{
	

	private places: Place[] = [];
	private recommandPlaces: Place[] = [];
	placesChanged = new EventEmitter<Place[]>();
	recommandPlacesChanged = new EventEmitter<Place[]>();
	
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
		
		
		console.log(body);
		return this.http.post('https://travel-bd272.firebaseio.com/places.json',body, {headers: headers})
			.map((data: Response) => data.json());
	}
	
	getPlaceId(){
		
		var test;
		//아이디를 부여하기 위해서 firebase에 몇개가 있는지 알려주는 함수입니다
		//원래라면 place-add component에서 하는 것이 맞으나 잘 되지 않아 service에서 처리하게 되었습니다
		//나중에 기회가 된다면 id부여를 add-place에서 처리할 수 있도록 하겠습니다
		
		var ref = firebase.database().ref("places");
		var new_id:number
		ref.once("value")
			.then(function(snapshot) {
				var a = snapshot.numChildren();
				test= a+1;
			});
		
		console.log(test);
		return test;
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
	 
	 //아이디를 부여하기 위한 방법을 연구한 것입니다
	 this.http.get('https://travel-bd272.firebaseio.com/places.json?shallow=true')
	 .map((data: Response) => data.json())
	 .subscribe((data: Place[]) => {
	 place['id'] = Object.keys(data).length;
	 console.log("come");
	 console.log( Object.keys(data).length);
	 return this.http.post('https://travel-bd272.firebaseio.com/places.json',body, {headers: headers})
	 .map((data: Response) => data.json());
	 });
	
	 
	 
	 
	 
	 
	 
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
	
	
	
	/*
		유저가 이 장소를 얼마나 좋아하는지 표시해두는 함수로
		firebase에 user1 은 '경복궁', '창경궁', '축구장', '경기장' 이런 곳을 좋아한다 라는 식으로 말해줄 것이다
		place가 id가 유니크 한 값이므로 실제로 데이터베이스에 들어가는 값은 '1', '2', '3' 이런 형식으로 들어가게 할것입니다.
	 */
	
	setUserPlaceRating(user:string, place:string, rating: string){


		
		//JSON을 동적으로 할당하는 것입니다 즉 body { place: "2312" } 이런식이라면 place가
		//place 그 자체로만 인식하기 때문에 동적으로 할당 할수 없으나
		//tmp = {}  tmp[place] = "2312" 이런식으로 하면 동적으로 할당할 수 있습니다
		const tmp = {};
		tmp[place] = rating;
		const body = JSON.stringify(tmp)
		
		const headers = new Headers({
			'Content-Type': 'application/json'
		});
		
		return this.http.patch('https://travel-bd272.firebaseio.com/users/' + user + '.json',body, {headers: headers})
			.map((data: Response) => data.json());
	}
	
	
	
	//추천장소를 받는 곳입니다
	getRecommandPlace(user:string){
		
		return this.http.get("http://223.194.70.126:5000/" + user)
			.map((data: Response)=> data.json())
				.subscribe(
					(data: any) => {
						this.recommandPlaces = data;
						console.log("recommandPlaces");
						console.log(this.recommandPlaces);
						
					});
		
	}
	
	
	
	//home에서 8개를 받을 때 쓰는 함수입니다
	//데이터베이스에서 모든 장소들을 다 가져올 때 사용하는 방식입니다
	//최신 데이터를 sorting을 통해서 placelist에 반환시킵니다
	onGetPlacesFromDatabaseLatestCountVersion(count:number){
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
					for (let i = 0; (i < count && i< myArray.length); i++) {
						
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