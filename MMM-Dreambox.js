/* global Module */

/* Magic Mirror
 * Module: MMM-Dreambox
 *
 * By AxLED
 * MIT Licensed.
 */

 var serviceselected = '';
 var onlyplayable = '';
 var IntervalID = '';
 var newserviceselected = '';
 var xml2json = '';

Module.register('MMM-Dreambox', {
	
	defaults: {
		units: config.units,
		refreshInterval: 1000 * 30, //refresh every 15 seconds
		timeFormat: config.timeFormat,
		lang: config.language,
		apiBase: 'http://dm800se.fritz.box',//AxLED
		apiabout: '/web/about',
		apiservices: '/web/getallservices',
		apiepgnow: '/web/epgnow?bRef=1%3A7%3A1%3A0%3A0%3A0%3A0%3A0%3A0%3A0%3AFROM%20BOUQUET%20%22userbouquet.favourites.tv%22%20ORDER%20BY%20bouquet',//'/web/epgnow?bRef=1%3A7%3A1%3A0%3A0%3A0%3A0%3A0%3A0%3A0%3A',
		apizap: '/web/zap?sRef=',
		apiTimerlist: '/web/timerlist',
		apiServicelistplayable: '/web/servicelistplayable?sRef=1%3A7%3A1%3A0%3A0%3A0%3A0%3A0%3A0%3A0%3AFROM%20BOUQUET%20%22userbouquet.favourites.tv%22%20ORDER%20BY%20bouquet',
		omxargs: ' --win 320,180,1600,900  -o both '
	},
	
	// Define required scripts.
	getScripts: function() {
		return ["moment.js", 'xml2json.js', "font-awesome.css"];
	},
	
	getStyles: function() {
		return ['MMM-Dreambox.css'];
	},

	start: function() {
		Log.info('Starting module: ' + this.name);
		this.loaded = false;
		this.sendSocketNotification('CONFIG', this.config);
	},

	getDom: function() {
		var self = this;

		// create element wrapper for show into the module
		var wrapper = document.createElement("div");

		//First Line
		//Errorhandling
		if (this.Errormessage != undefined){
			var ServiceItem4 = document.createElement("div");
			ServiceItem4.setAttribute('class', 'float');
			ServiceItem4.innerHTML = this.Errormessage;
			var Separator = document.createElement("hr");
			Separator.setAttribute('class', 'db');
			wrapper.appendChild(ServiceItem4);
			wrapper.appendChild(Separator);
		}
		
		var ServiceItem2 = document.createElement("div");
		ServiceItem2.setAttribute('class', 'float');
		if (this.model != undefined) {
			ServiceItem2.innerHTML = 'Modell: ' +this.model+ '&nbsp;';
		} /*else if (this.Errormessage != undefined){
			ServiceItem2.innerHTML = this.Errormessage;
		}*/
		
		var ServiceItem3 = document.createElement("div");
		ServiceItem3.setAttribute('class', 'float');
		if (this.timerstring != undefined){
			ServiceItem3.innerHTML = '- '+ this.timerstring;
		} else {
			ServiceItem3.innerHTML = '- dezeit läuft: (' +this.tuned + ')';
		}

		var Separator = document.createElement("hr");
		Separator.setAttribute('class', 'db');

		wrapper.appendChild(ServiceItem2);
		wrapper.appendChild(ServiceItem3);
		wrapper.appendChild(Separator);

		//Divs for stations
		if (this.dataRequest === "DB-SERVICES" || this.dataRequest === "DB-EPGNOW" || this.dataRequest === "DB-TIMER" || this.dataRequest === "DB-SLP") {//Axled can this part of code be optimized, because updateDom() should work anyway
			for (let index = 0; index < this.anzahl; index++) {
				var ServiceItem = document.createElement("div");
				ServiceItem.setAttribute('class', 'db');
				
				if(this.epgtitle == undefined){
					ServiceItem.innerHTML = this.sender[index].e2servicename;
				} else {
					ServiceItem.innerHTML = this.sender[index].e2servicename +' - ('+moment.unix(this.epgtitle[index].e2eventstart).format('HH:mm')+' '+this.epgtitle[index].e2eventtitle+')';
				}
				
				ServiceItem.setAttribute('id', index);

				if(this.tuned === this.sender[index].e2servicename) {
					ServiceItem.setAttribute('class', 'selected');
					serviceselected = index;// remember the selected service for play & zapping
				}
				//mark playable services (only if timer is running)
				if(this.slp != undefined && this.timerstring != undefined){
					if(this.slp[index].e2isplayable === "False"){
						ServiceItem.setAttribute('class', 'inactive');
						onlyplayable = true;
					}
				}
				wrapper.appendChild(ServiceItem);
			}
		} 
		return wrapper;
	},

	nextselection: function (selected, direction) {
		if (onlyplayable === true){
			serviceselected = selected;
			newserviceselected = '';
			var x = document.querySelectorAll('div.db, div.selected');
			
			if (direction === '+'){
				if (serviceselected == ''){
					serviceselected = 0;
				} else {
					document.getElementById(serviceselected).setAttribute('class','db');//remove old selection
				}
				
				for (let index = 0; index < x.length; index++) {
					if (serviceselected < x[index].id && newserviceselected == '') {
						newserviceselected = x[index].id;
						document.getElementById(newserviceselected).setAttribute('class','selected');//set new selection
					} else if (serviceselected == x[x.length-1].id) {//if last entry is reached, set the first value for looping through the playable stattions
						newserviceselected = x[0].id;
						document.getElementById(newserviceselected).setAttribute('class','selected');
					}
				}
			} else if (direction == '-'){
				if (serviceselected == ''){
					serviceselected = this.anzahl-1;
				} else {
					document.getElementById(serviceselected).setAttribute('class','db');//remove old selection
				}

				for (let index = x.length-1; index >= 0; index--) {//negative loop
					if (serviceselected > x[index].id && newserviceselected == '') {
						newserviceselected = x[index].id;
						document.getElementById(newserviceselected).setAttribute('class','selected');//set new selection
					} else if (serviceselected == x[0].id) {//if first entry is reached, set the last value for looping through the playable stattions
						newserviceselected = x[x.length-1].id;
						document.getElementById(newserviceselected).setAttribute('class','selected');
					}
				}
			}
		} else { //onlyplayable = false or ''
			serviceselected = selected;
			newserviceselected = '';
			if (direction === '+'){
				if (serviceselected === '' || serviceselected === this.anzahl-1){
					serviceselected = -1;
					document.getElementById(parseInt(this.anzahl-1)).setAttribute('class','db');
				} else {
					document.getElementById(serviceselected).setAttribute('class','db');//remove old selection
				}
				document.getElementById(parseInt(serviceselected+1)).setAttribute('class','selected');
				newserviceselected = parseInt(serviceselected+1);
			} else if (direction === '-'){
				if (serviceselected === '' || serviceselected === 0){
					serviceselected = parseInt(this.anzahl);
					document.getElementById(0).setAttribute('class','db');
				} else {
					document.getElementById(serviceselected).setAttribute('class','db');//remove old selection
				}
				document.getElementById(parseInt(serviceselected-1)).setAttribute('class','selected');
				newserviceselected = parseInt(serviceselected-1);
			}
		}
		return newserviceselected;
	},
	
	//Helper, to use module with notification system
    notificationReceived: function(notification, payload) {
		if(notification === "DB-SERVICE-NEXT"){
			serviceselected = this.nextselection(serviceselected,'+');
		}

		if(notification === "DB-SERVICE-PREV"){
			serviceselected = this.nextselection(serviceselected,'-');
		}

		if(notification === "DB-PLAY"){
			document.getElementById(serviceselected).setAttribute('class','selected play');
			if (onlyplayable === true){//add zap information
				payload = [this.sender[parseInt(serviceselected)].e2servicereference,''];
			} else {
				payload = [this.sender[parseInt(serviceselected)].e2servicereference,'zap'];
			}
			this.sendSocketNotification('DB-PLAY', payload);
		}
		
		if(notification === "DB-STOP"){
			this.sendSocketNotification('DB-STOP', payload);
		}
    },
	
 	socketNotificationReceived: function(notification, payload) {
    		if (notification === "STARTED") {
				this.startFetchingData(this.config.refreshInterval);
			} else if (notification === "DATA") {
				this.loaded = true;
				if(payload[0]==='DB-EPGNOW'){
					this.dataRequest = "DB-EPGNOW";
					var json=xml2json(payload[1]);
					this.epgtitle = json.e2eventlist.e2event;
					this.updateDom();
				} else if(payload[0]==='DB-ABOUT'){
					this.dataRequest = "DB-ABOUT";
					var json=xml2json(payload[1]);
					this.model = json.e2abouts.e2about.e2model;
					this.tuned = json.e2abouts.e2about.e2servicename;
					this.updateDom();
				} else if(payload[0]==='DB-SERVICES'){
					this.dataRequest = "DB-SERVICES";
					var json=xml2json(payload[1]);
					this.sender = json.e2servicelistrecursive.e2bouquet.e2servicelist.e2service;
					this.anzahl = json.e2servicelistrecursive.e2bouquet.e2servicelist.e2service.length;
					this.updateDom();
				} else if(payload[0]==='ERROR'){
					this.dataRequest = "ERROR";
					this.Errormessage = payload[1];
					this.updateDom();
				} else if(payload[0]==='DB-TIMER'){
					this.dataRequest = payload[0];
					var json=xml2json(payload[1]);
					if (json.e2timerlist.e2timer[0].e2state === "2"){//Timer in List are sorted, so only first entry can (should) run, sometimes the second entry runs
						this.timerstring = 'Aufnahme läuft: '+json.e2timerlist.e2timer[0].e2name+' ('+json.e2timerlist.e2timer[0].e2servicename+')';
						this.updateDom();
					} 
				} else if(payload[0]==='DB-SLP'){
					this.dataRequest = payload[0];
					var json=xml2json(payload[1]);
					this.slp = json.e2servicelistplayable.e2serviceplayable;
					this.updateDom();
				} 
				//this.updateDom();
			}
	},
	
	startFetchingData: function(interval) {
		if (IntervalID === ''){
			// ... and then repeat in the given interval
			IntervalID = setInterval(() => {
			this.sendSocketNotification("FETCH_DATA", '');
			}, interval);
		}
	}

});