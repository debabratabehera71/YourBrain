/**
 * @author Caspar Addyman
 * 
 * helper functions for connecting to the yourbrainondrugs.net site
 * 
 */


(function(){
	
	//create an object which will be our public API
	Ti.App.boozerlyzer.comm.ybodnet = {};
	Ti.App.boozerlyzer.comm.ybodnet.username = 'test';
	Ti.App.boozerlyzer.comm.ybodnet.pswdMD5 = 'test';
	
	// our user ID, username, email etc - unique identifier of the submitter
	Ti.App.boozerlyzer.comm.ybodnet.getUserID = function (){
		//TODO make this function do something real!
		return 'test';
	};
	
	// some kind of magic key that the client-server has previously negotiated to determine authenticity
	Ti.App.boozerlyzer.comm.ybodnet.getAuthToken = function (){
		//TODO make this function do something real!
		return 'test';
	};
	
	// software version of the client
	Ti.App.boozerlyzer.comm.ybodnet.getClientVersion = function (){
		//TODO make this function do something real!
		return 'test';
	};
	 
	// protocol version to use
	Ti.App.boozerlyzer.comm.ybodnet.getProtocolVersion = function (){
		//TODO make this function do something real!
		return 'test';
	};
	

	//register a new user
	Ti.App.boozerlyzer.comm.ybodnet.register = function (){

	};
	
	//login
	Ti.App.boozerlyzer.comm.ybodnet.login = function (){

	};
	
	

}());