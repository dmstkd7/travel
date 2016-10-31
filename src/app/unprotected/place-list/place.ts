export class Place {
	constructor(
		public id: number,
		public title: string,
		public subtitle:string,
		public description: string,
		public price: number,
		public address: string,
		public city: string,
		public phone: string,
		public email: string,
		public rating: number,
		public author: string,
		public category: string,
		public recommandAge: string,
		public type: string[],
	    public latitude: number,
	    public longitude: number,
	    public playingTime: number,
	    public location: string,
	    public imgUrl: string
	){	}
}