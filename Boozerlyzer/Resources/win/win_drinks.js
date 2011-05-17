/**
 * @author Caspar Addyman
 * 
 * The user interface for the drinking tracking screen.
 * We wrap all code in a self-calling function to protect the 
 * global namespace.
 * 
 * Copyright yourbrainondrugs.net 2011
 */

(function() {
	
		var win = Ti.UI.currentWindow;
		var winOpened = parseInt((new Date()).getTime()/1000);
		var loadedonce = false;
		
		var drinkNames = ['Beer','Wine','Spirits','NULL'];
		var drinkImgs = ['../icons/beer-full.png','../icons/wine.png','../icons/whiskey.png','../icons/whiskey-empty.png'];
		
		// //Ti.include('../js/datetimehelpers.js');
		// Include component in page
		Ti.include('../ui/picker_drinks.js');
		Ti.include('../js/bloodalcohol.js');
		
		var persInfo = Ti.App.boozerlyzer.data.personalInfo.getData();
		var stdDrinks = Ti.App.boozerlyzer.data.alcoholStandardDrinks.get(persInfo.Country);
		var millsPerStandardUnits = stdDrinks[0].MillilitresPerUnit;
		Ti.API.debug('stdDrinks ' + JSON.stringify(stdDrinks));
		
		
		// the Dosesage database object
		//current session ID
		var SessionID = Titanium.App.Properties.getInt('SessionID');
		
		//All dose data for this session
		var AllDrinks = Ti.App.boozerlyzer.data.doseageLog.getAllSessionData(SessionID);
		if (AllDrinks === null || AllDrinks === false){
			AllDrinks = Ti.App.boozerlyzer.data.doseageLog.newDrink();
			Ti.App.boozerlyzer.data.sessions.Updated(SessionID);
		}
		Titanium.API.debug(JSON.stringify(AllDrinks));
		var sessionData = Ti.App.boozerlyzer.data.sessions.getSession(SessionID);
//		Titanium.API.debug('sessionData -' + JSON.stringify(sessionData));
		//find the last row 
		var lastIndex = AllDrinks.length - 1;
		//we will use these to keep count of drinks..
		AllDrinks[lastIndex].DoseageStart = winOpened;
		
		
		// Respond when selection made and dialog closed
		optionPickerDialog.addEventListener('close', function(e){
		    if (e.done==true && e.selectedRow){
		        Ti.API.debug('e.drugVariety '+ e.drugVariety );
		        Ti.API.debug('e.doseSize '+ e.doseSize );
		        Ti.API.debug('e.strength '+ e.strength );
		        Ti.API.debug('e.NumDoses' + e.NumDoses);
		   		newDrinks = Ti.App.boozerlyzer.data.doseageLog.newDrink();
		   		newDrinks[0].DoseDescription = e.doseDescription;
		   		newDrinks[0].DrugVariety = e.drugVariety;
		   		newDrinks[0].Volume = e.doseSize;
		   		newDrinks[0].Strength = e.strength;
		   		newDrinks[0].NumDoses = e.NumDoses;
		   		newDrinks[0].DrugType = 'Alcohol';
		   		Ti.API.debug('Total units' +  1000 * e.doseSize * e.strength * e.NumDoses / (100) );
		   		newDrinks[0].TotalUnits = 1000*e.doseSize * e.strength * e.NumDoses / (100);
		   		if (isNaN(stdDrinks[0].MillilitresPerUnit) || stdDrinks[0].MillilitresPerUnit <= 0){
		   			newDrinks[0].StandardUnits = 0;
		   		}else{
			   		newDrinks[0].StandardUnits = newDrinks[0].TotalUnits / stdDrinks[0].MillilitresPerUnit;
		   		}
		   		newDrinks[0].Changed = true;
		   		Ti.API.debug('std units ' + newDrinks[0].StandardUnits );
		   		Ti.App.boozerlyzer.data.doseageLog.setData(newDrinks);
				tv.appendRow(formatTableRow(newDrinks[0]));
				AllDrinks.push(newDrinks[0]);	
				tv.scrollToIndex(AllDrinks.length -1);
				totalizeDrinks();
		    }
		});
		
		
		//layout variables
		//glass icons and drink counters  
		var leftEmpty = 20;
		var leftFull = 140;
		var leftDrinkType = 40;
		var bigIcons = 60;
		var halfOffset = bigIcons-15;
		var smlIcon = 40;
		
		var topBeer = 10;
		var topWine = 85;
		var topSpirit =150; 
		var topTotal= 200;
		
		//session log 
		var leftSession = 250;
		var topSession = 0;
		
		var sessionView = Ti.UI.createView({
			borderColor:'#888',
			borderWidth:3,
			borderRadius:4,
			backgroundColor:'black',
			width:'auto',
			height:'auto',
			top:topSession,
			left:leftSession,
		});
		win.add(sessionView);
		
		var beeradd = Titanium.UI.createImageView({
			image:'../icons/beer-full.png',
			height:bigIcons,
			width:bigIcons,
			top:topBeer,
			left:leftFull+halfOffset
		});
		win.add(beeradd);
		beeradd.addEventListener('click',function (){
			// AllDrinks[lastIndex].HalfPints += 2;
			// totalizeDrinks();
			// Set data in picker and open as a modal
			optionPickerDialog.setDrinkType('Beer',[2,4,0]);
			optionPickerDialog.open();
		});
		
		
		var beeradd_sml = Titanium.UI.createImageView({
			image:'../icons/beer-full.png',
			height:smlIcon,
			width:smlIcon,
			top:topBeer+bigIcons-smlIcon,
			left:leftFull
		});
		win.add(beeradd_sml);
		beeradd_sml.addEventListener('click',function (){
			// AllDrinks[lastIndex].HalfPints += 1;
			// totalizeDrinks();
			// Set data in picker and open as a modal
			optionPickerDialog.setDrinkType('Beer',[2,0,0]);
			optionPickerDialog.open();

		});
		
		
		var beercount = Ti.UI.createLabel({
			text:'0 pints',
			top:topBeer,
			left:leftDrinkType,
			width:100,
			height:bigIcons,
			textAlign:'center',
			color:'white'
		});
		win.add(beercount);
		
		
		var wineadd = Titanium.UI.createImageView({
			image:'../icons/wine.png',
			height:bigIcons,
			width:bigIcons,
			top:topWine,
			left:leftFull+halfOffset
		});
		win.add(wineadd);
		wineadd.addEventListener('click',function (){
			// AllDrinks[lastIndex].SmallWine += 2;
			// totalizeDrinks();
			// Set data in picker and open as a modal
			optionPickerDialog.setDrinkType('Wine',[2,2,0]);
			optionPickerDialog.open();
		});
		
		
		var wineadd_sml = Titanium.UI.createImageView({
			image:'../icons/wine.png',
			height:smlIcon,
			width:smlIcon,
			top:topWine+bigIcons-smlIcon,
			left:leftFull
		});
		win.add(wineadd_sml);
		wineadd_sml.addEventListener('click',function (){
			// AllDrinks[lastIndex].SmallWine += 1;
			// totalizeDrinks();
			// Set data in picker and open as a modal
			optionPickerDialog.setDrinkType('Wine',[2,0,0]);
			optionPickerDialog.open();
		});
		
		var winecount = Ti.UI.createLabel({
			text:'0 wines',
			top:topWine,
			left:leftDrinkType,
			width:100,
			height:bigIcons,
			textAlign:'center',
			color:'white'
		});
		win.add(winecount);
		
		var spiritadd = Titanium.UI.createImageView({
			image:'../icons/whiskey.png',
			height:bigIcons * 0.9,
			width:bigIcons * 0.9,
			top:topSpirit+10,
			left:leftFull+halfOffset
		});
		win.add(spiritadd);
		spiritadd.addEventListener('click',function (){
			// AllDrinks[lastIndex].SingleSpirits += 2;
			// totalizeDrinks();
			// Set data in picker and open as a modal
			optionPickerDialog.setDrinkType('Spirits',[2,2,0]);
			optionPickerDialog.open();

		});
		
		
		var spiritadd_sml = Titanium.UI.createImageView({
			image:'../icons/whiskey.png',
			height:smlIcon * 0.9,
			width:smlIcon * 0.9,
			top:topSpirit+bigIcons-smlIcon,
			left:leftFull
		});
		win.add(spiritadd_sml);
		spiritadd_sml.addEventListener('click',function (){
			// AllDrinks[lastIndex].SingleSpirits += 1;
			// totalizeDrinks();
			// Set data in picker and open as a modal
			optionPickerDialog.setDrinkType('Spirits',[2,0,0]);
			optionPickerDialog.open();

		});
		
		
		var spiritcount = Ti.UI.createLabel({
			text:'0 spirits',
			top:topSpirit,
			left:leftDrinkType,
			width:100,
			height:bigIcons,
			textAlign:'center',
			color:'white'
		});
		win.add(spiritcount);
		
		
		var UnitCount = Ti.UI.createLabel({
			text:'Total 0 units',
			top:topTotal,
			left:leftDrinkType - 40,
			width:180,
			height:'auto',
			textAlign:'center',
			color:'white'
		});
		win.add(UnitCount);
		var BloodAlcohol = Ti.UI.createLabel({
			text:'Blood Alcohol',
			top:topTotal+22,
			left:leftDrinkType - 40,
			width:180,
			height:'auto',
			textAlign:'center',
			color:'white'
		});
		win.add(BloodAlcohol);
		
		function formatTableRow(DrinkData){
			Titanium.API.debug("formatTableRow -" + JSON.stringify(DrinkData));
			//row that holds drink info
		    var row = Ti.UI.createTableViewRow({
		        height: 30,
		        className: 'oneDrink'
		    });
			//first keep a copy of all data .. handy for updating later.		    
		    row.drinkData = DrinkData;
		    //convert DrinkData obj into text, etc.
		    Titanium.API.debug('DrinkData.DoseageStart '+ DrinkData.DoseageStart);
		    var addedTime = Titanium.App.boozerlyzer.dateTimeHelpers.formatTime(DrinkData.DoseageStart,true);
			var numUnits = DrinkData.TotalUnits / stdDrinks[0].MillilitresPerUnit;
			//calorie calculation = 7kCals per gram of alcohol , 0.79 grams per millilitre
			var numkCals = DrinkData.TotalUnits * 0.79 * 7;
			var thisDrinkUnits = '';
			var thisDrinkkCals = '';
			if (!isNaN(numUnits) && numUnits > 0){
				thisDrinkUnits = numUnits.toFixed(1) + ' u';
				thisDrinkkCals = numkCals.toFixed(0) + 'kCal'
			}
			var whatDrink;
			whatDrink = (DrinkData.DrugVariety !== null  ? DrinkData.DrugVariety : '');
			var doseDesc; 
			doseDesc = (DrinkData.DoseDescription  !== null ? DrinkData.DoseDescription :'');
			var drinkDesc;
		    if (DrinkData.NumDoses === null || DrinkData.NumDoses ===1){
		    	drinkDesc = doseDesc;
		    }else{
		    	drinkDesc = DrinkData.NumDoses +  ' x ' + doseDesc;
		    }
			var drinkIDX = drinkNames.indexOf(DrinkData.DrugVariety);
		    //if image is missing show empty class
		    drinkIDX = (drinkIDX >= 0 ? drinkIDX : drinkImgs.length - 1);
		   //icon for drink
		    var imgView = Ti.UI.createImageView({
					            image: drinkImgs[drinkIDX],
					            width:	28,
					            height: 28,
					            left: 0, top:0
					        });
		    row.add(imgView);
		    var drinkDescriptionLabel = Ti.UI.createLabel({
												    	text:drinkDesc,
														top:0,
														left:32,
														textAlign:'left',
														color:'white',
														font:{fontSize:14,fontWeight:'bold'}
													});
			row.add(drinkDescriptionLabel);
			
			//label to display time and percentage strength
		    var drinkDetailsLabel = Ti.UI.createLabel({
												    	text:addedTime + '  (' +DrinkData.Strength + '% )',
														top:16,
														left:32,
														textAlign:'left',
														color:'white',
														font:{fontSize:12,fontWeight:'normal'}
													});
			row.add(drinkDetailsLabel);
		    //label to display number of standard drinks/units for this entry
		    var drinkUnitsLabel = Ti.UI.createLabel({
												    	text: thisDrinkUnits,
														bottom:2,
														right:4,
														textAlign:'right',
														color:'green',
														font:{fontSize:18,fontWeight:'Bold'}
													});
			row.add(drinkUnitsLabel);
		    var drinkkCalsLabel = Ti.UI.createLabel({
												    	text: thisDrinkkCals,
														top:2,
														right:66,
														textAlign:'right',
														color:'orange',
														font:{fontSize:12,fontWeight:'normal'}
													});
			row.add(drinkkCalsLabel);

			
			return row;
		}
		
		function totalizeDrinks(){
			var len = AllDrinks.length;
			var totalvolAlcohol = 0;
			for (var idx =0;idx<len;idx++){
				totalvolAlcohol += AllDrinks[idx].TotalUnits; 
			}
			if (stdDrinks[0].MillilitresPerUnit > 0){
				footerUnits.text = (totalvolAlcohol / stdDrinks[0].MillilitresPerUnit).toFixed(1) +'u';
				//calorie calculation = 7kCals per gram of alcohol , 0.79 grams per millilitre
				footerkCals.text = (totalvolAlcohol * 0.79 * 7).toFixed(0) + 'kCal'; 
			}
			 calcDisplayBloodAlcohol();
		}
		
		function calcDisplayBloodAlcohol(){
			var now = parseInt((new Date()).getTime()/1000);
			var BAC = BACalculate(now, AllDrinks.slice(lastIndex),persInfo);
			BloodAlcohol.text = 'Blood Alcohol ' + BAC.toFixed(4) + '%';
			var baLevel = BALevels(BAC);
			BloodAlcohol.color = baLevel.color;
			footerUnits.color = baLevel.color;	
		}
		

		var footer = Ti.UI.createView({
			backgroundColor:'#111',
			height:30
		});
		
		var footerLabel = Ti.UI.createLabel({
			font:{fontFamily:'Helvetica Neue',fontSize:14,fontWeight:'normal'},
			text:'Totals: ',
			color:'#282',
			textAlign:'right',
			left:4,
			width:'auto',
			height:'auto'
		});
		footer.add(footerLabel);
		var footerUnits = Ti.UI.createLabel({
			font:{fontFamily:'Helvetica Neue',fontSize:24,fontWeight:'bold'},
			text:'',
			color:'Green',
			textAlign:'right',
			right:2,
			bottom:2,
			width:'auto',
			height:'auto'
		});		
		footer.add(footerUnits);
		var footerkCals = Ti.UI.createLabel({
			font:{fontFamily:'Helvetica Neue',fontSize:14,fontWeight:'normal'},
			text:'',
			color:'orange',
			textAlign:'right',
			right:80,
			bottom:2,
			width:'auto',
			height:'auto'
		});		
		footer.add(footerkCals);
		var header = Ti.UI.createView({
			backgroundColor:'#999',
			height:'auto'
		});
		var headerLabel = Ti.UI.createLabel({
			font:{fontFamily:'Helvetica Neue',fontSize:12,fontWeight:'bold'},
			text:'',
			color:'#222',
			textAlign:'center',
			top:0,
			left:4,
			width:'auto',
			height:30
		});
		header.add(headerLabel);
		
		
		var tv = Ti.UI.createTableView({
			headerView:header,
			footerView:footer,
			rowHeight:28
		});
		
		//initial population of drink list.
		for(var idx=0;idx<AllDrinks.length; idx++){
			tv.appendRow(formatTableRow(AllDrinks[idx]));	
		}
		
		
		sessionView.add(tv);
		
		function setSessionLabel(){
			headerLabel.text = 'Session began: ' + Ti.App.boozerlyzer.dateTimeHelpers.formatDayPlusTime(sessionData[0].StartTime,true);
		}
		
		setSessionLabel();
		totalizeDrinks();
		//buttons to navigate to other screens
		
		//Button layout Vars
		var bottomButtons = 5;
		var leftFirst = 50;
		var leftSecond = 132;
		var leftThird = 180;
		
		var newmood = Titanium.UI.createImageView({
			image:'../icons/TheaterYellow2.png',
			height:bigIcons,
			width:bigIcons,
			bottom:bottomButtons,
			left:leftFirst
		});
		newmood.addEventListener('click',function(){
			var newmoodwin = Titanium.UI.createWindow({ modal:true,
				url:'../win/win_emotion.js',
				title:'How are you feeling?',
				backgroundImage:'../images/smallcornercup.png',
				orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
			});
			win.close();
			newmoodwin.open();
		});
		win.add(newmood);
		
		var newtripreport = Titanium.UI.createImageView({
			image:'../icons/tripreport.png',
			height:bigIcons * .8,
			width:bigIcons * .8,
			bottom:bottomButtons,
			left:leftSecond
		});
		newtripreport.addEventListener('click',function(){
			var newtripwin = Titanium.UI.createWindow({ modal:true,
				url:'../win/win_tripreport.js',
				title:'How are you feeling?',
				backgroundImage:'../images/smallcornercup.png',
				orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
			});
			win.close();
			newtripwin.open();
		});
		win.add(newtripreport);
		
		var newgame = Titanium.UI.createImageView({
			image:'../icons/hamsterwheel.png',
			height:bigIcons,
			width:bigIcons,	
			bottom:bottomButtons,
			left:leftThird
		});
		// newgame.addEventListener('click',function(){
			// var winplay = Titanium.UI.createWindow({ modal:true,
				// url:'/win/win_gameMenu.js',
				// title:'YBOB Game ',
				// backgroundImage:'../images/smallcornercup.png',
				// orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
			// });
			// winplay.home = winHome;
			// win.close();
			// winplay.open();
		// });
		newgame.addEventListener('click',function(){
			var winplay = Titanium.UI.createWindow({ modal:true,
				url:'/ui/picker_drinks.js',
				title:'YBOB Game ',
				backgroundImage:'../images/smallcornercup.png',
				orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
			});
			win.close();
			winplay.open();
		});
		win.add(newgame);
		
		//
		// Cleanup and return home
		win.addEventListener('android:back', function(e) {
			gameEndSaveScores();
			if (Ti.App.boozerlyzer.winHome === undefined 
			 || Ti.App.boozerlyzer.winHome === null) {
				Ti.App.boozerlyzer.winHome = Titanium.UI.createWindow({ modal:true,
					url: '../app.js',
					title: 'Boozerlyzer',
					backgroundImage: '../images/smallcornercup.png',
					orientationModes:[Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT]  //Landscape mode only
				})
			}
			win.close();
			Ti.App.boozerlyzer.winHome.open();
		});
		
		//log data to the activity tracker
		// record the total units at the moemnt
		// and give user 2 lab points for using this screen
		function gameEndSaveScores(){
		var gameSaveData = [{Game: 'DoseageLog',
							GameVersion:1,
							PlayStart:winOpened ,
							PlayEnd: parseInt((new Date()).getTime()/1000),
							TotalScore:parseFloat(footerUnits.text),
							Speed_GO:0,
							Speed_NOGO:0,
							Coord_GO:0,
							Coord_NOGO:0,
							Level:0,
							Inhibition:0,
							Feedback:'',
							Choices:'',
							SessionID:Titanium.App.Properties.getInt('SessionID'),
							UserID:Titanium.App.Properties.getInt('UserID'),
							LabPoints:2		
						}];
			Titanium.App.boozerlyzer.data.gameScores.Result(gameSaveData);
		}

				
		win.addEventListener('close', function(){
			if (loadedonce){
				//this code only runs when we close this page
				gameEndSaveScores();
			}
		});
		
				
		loadedonce = true;
		
		
})();