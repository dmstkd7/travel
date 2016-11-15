import {Injectable, EventEmitter} from "@angular/core"
import {Router} from "@angular/router";
import {User} from "./user.interface";


declare var firebase: any;

@Injectable()
export class AuthService{
	
	
	userChanged = new EventEmitter();
  constructor(private router: Router){
	  
  }

  signupUser(user: User){
    firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
      .catch(function(error) {
        console.log(error);
      });
    this.router.navigate(['/home']);
  }

  signinUser(user: User){
    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
      .catch(function(error) {
        console.log(error);
      });
    this.router.navigate(['/home']);
  }


  logout(){
    firebase.auth().signOut().then(function() {
      // Sign-out successful.
      this.router.navigate(['/home']);
    }, function(error) {
      // An error happened.
      console.log(error);
    });
  }

  isAuthenticated(){
    var user = firebase.auth().currentUser;

    if (user) {
      return true;
    } else {
      // No user is signed in.
      return false;
    }
  }

  //로그인한 유저의 아이디를 가져오는 것
  getLoginUserEmail(){
    var user = firebase.auth().currentUser;
    console.log(user);
    if (user != null)
      return user.email;
  }
  
  //로그인한 유저의 uid를 가져오는 것
	getLoginUserUid(){
		var user = firebase.auth().currentUser
		
		console.log("헬로우 user");
		console.log(user);
		
		if(user!=null) {
			return user.uid;
		}
	}

}
