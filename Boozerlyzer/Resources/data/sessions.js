/**
 * @author Caspar Addyman
 * 
 * helper functions for reading and writing
 * to and from the database table Sessions
 * 
 * All other data is keyed off a sessionID so this is immportant!
 */


// Using the JavaScript module pattern, create a persistence module for CRUD operations
// Based on Kevin Whinnery's example: http://developer.appcelerator.com/blog/2010/07/how-to-perform-crud-operations-on-a-local-database.html
// One tutorial on the Module Pattern: http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth
var sessions = (function(){
	
	//create an object which will be our public API
	var api = {};
	
	//maintain a database connection we can use
	var conn = Titanium.Database.install('../ybob.db','ybob');
  
	//get data for the maximum row id for this userID
	// where 0 is default and >0 implies we are in 'matemode'
	api.getLatestData = function (userID){
		var mostRecentData = [];
		var uid = parseInt(userID);
		//this line probably unnecessary but i had some paranoia that max(id) didn't work properly
		var rows = conn.execute('SELECT count(*) FROM Sessions WHERE userID = ?', uid);
		if (rows !== null && rows.isValidRow() && rows.field(0) > 0) {
			rows.close();
			rows = conn.execute('SELECT max(ID) FROM Sessions where userID = ?', uid);
			if ((rows !== null) && (rows.isValidRow())) {
				var maxid = 1;
				try {
					maxid = parseInt(rows.field(0));
				} 
				catch (ex) {
					return false;
				}
				rows.close();
				rows = conn.execute('SELECT * FROM Sessions WHERE ID = ?', maxid);
				if ((rows !== null) && (rows.isValidRow())) {
					mostRecentData.push({
						Created: parseInt(rows.fieldByName('Created')),
						AppVersion: rows.fieldByName('AppVersion'),
						ID: parseInt(rows.fieldByName('ID')),
						UserID: parseInt(rows.fieldByName('UserID')),
						StartTime: parseInt(rows.fieldByName('StartTime')),
						LastUpdate: parseInt(rows.fieldByName('LastUpdate'))
					});
					rows.close();
					return mostRecentData;
				}
			}
		}
		//something didn't work
		return false;
	};

	//user adjusting the start time for this session	
	api.changeStartTime = function (sessionID, startTime){
		Titanium.API.debug('session changeStartTime');
		var now  = parseInt((new Date()).getTime()/1000);		
		var updatestr = 'Update Sessions set StartTime = ?, LastUpdate = ? where ID = ?';
		conn.execute(updatestr,startTime, now, sessionID);
		Titanium.App.Properties.setInt('SessionStart',now);
		Titanium.App.Properties.setInt('SessionChanged',now);
		Titanium.API.debug('selfAssessment updated, rowsAffected = ' + conn.rowsAffected);
	};
	
	//Something has changed during this session update the timestamp
	api.Updated = function (sessionID){
		Titanium.API.debug('session update');
		var now  = parseInt((new Date().getTime())/1000);		
		var sessID = parseInt(sessionID);
		var updatestr = 'Update Sessions set LastUpdate = ? where ID = ?';
		conn.execute(updatestr, now, sessID);
		Titanium.App.Properties.setInt('SessionChanged',now);
		Titanium.API.debug('selfAssessment updated, rowsAffected = ' + conn.rowsAffected);
	};

	//get a Session by ID (id is unique) 
	api.getSession = function (ID){
		var allSessionData = [];
		var rows = null;
		var id = parseInt(ID);
		rows = conn.execute('SELECT * FROM Sessions WHERE ID = ?', id);
		if ((rows !== null) && (rows.isValidRow())) {
			while(rows.isValidRow()){
				allSessionData.push({
					Created: parseInt(rows.fieldByName('Created')),
					AppVersion: rows.fieldByName('AppVersion'),
					ID: parseInt(rows.fieldByName('ID')),
					StartTime: parseInt(rows.fieldByName('StartTime')),
					UserID: parseInt(rows.fieldByName('UserID')),
					LastUpdate: parseInt(rows.fieldByName('LastUpdate'))
				});
				rows.next();				
			}
			rows.close();
			return allSessionData;
		}
		//something didn't work
		rows.close();
		return false;
	};
		
	//get all Sessions for this user ID 
	api.getAllSessions = function (userID){
		var allSessionData = [];
		var rows = null;
		if (userID === null) {
			//get all data
			rows = conn.execute('SELECT * FROM Sessions ORDER BY ID ASC');
		}else{
			var uid = parseInt(userID);
			rows = conn.execute('SELECT * FROM Sessions WHERE UserID = ?, ORDER BY ID ASC', uid);
		}
		if ((rows !== null) && (rows.isValidRow())) {
			var maxid = parseInt(rows.field(0));
			rows.close();
			rows = conn.execute('SELECT * FROM Sessions WHERE ID = ?', maxid);
			if ((rows !== null) && (rows.isValidRow())) {
				while(row.isValidRow()){
					allSessionData.push({
						Created: parseInt(rows.fieldByName('Created')),
						AppVersion: rows.fieldByName('AppVersion'),
						ID: parseInt(rows.fieldByName('ID')),
						StartTime: parseInt(rows.fieldByName('StartTime')),
						UserID: parseInt(rows.fieldByName('UserID')),
						LastUpdate: parseInt(rows.fieldByName('LastUpdate'))
					});
					row.next();				
				}
				rows.close();
				return allSessionData;
			}
		}
		//something didn't work
		return false;
	};
	
	api.createNewSession = function (matemode){
		var sessionID = null;
		var insertstr = 'insert into Sessions (Created, AppVersion, UserID,StartTime,LastUpdate) Values(?,?,?,?,?)'; 
		var userID = -1;
		var rows = [];
		if (matemode === null || matemode === false){
			//new session for main user
			userID = 0;
		}else{
			//get a new user id
			rows = conn.execute('SELECT max(UserID) from Sessions');	
			if (rows!==null){
				userID += parseInt(rows.field(0));
			}else{
				//erm not sure what else to do.
				userID = -1;
			}
			rows.close();
		}
		var now = parseInt((new Date()).getTime()/1000);
		conn.execute(insertstr, now, Titanium.App.getVersion(),userID,now, now) 
		sessionID = conn.lastInsertRowId;
		Titanium.App.Properties.setInt('SessionID', sessionID);
		Titanium.App.Properties.setInt('SessionStart',now);
		Titanium.App.Properties.setInt('SessionChanged',now);
		return [{
			ID:sessionID,
			UserID:userID,
			AppVersion: Titanium.App.getVersion(),
			Created: now,
			StartTime: now,
			LastUpdate: now
		}];
	};

	return api;
}());
