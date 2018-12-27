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
		//animationSpeed: 1000,
		//refreshInterval: 1000 * 60, //refresh every minute
		refreshInterval: 1000 * 30, //refresh every 15 seconds
		timeFormat: config.timeFormat,
		lang: config.language,

		//initialLoadDelay: 0, // 0 seconds delay
		//retryDelay: 2500,

		apiBase: 'http://dm800se.fritz.box',//AxLED
		apiabout: '/web/about',
		apiservices: '/web/getallservices',
		apiepgnow: '/web/epgnow?bRef=1%3A7%3A1%3A0%3A0%3A0%3A0%3A0%3A0%3A0%3AFROM%20BOUQUET%20%22userbouquet.favourites.tv%22%20ORDER%20BY%20bouquet',//'/web/epgnow?bRef=1%3A7%3A1%3A0%3A0%3A0%3A0%3A0%3A0%3A0%3A',
		apizap: '/web/zap?sRef=',
		apiTimerlist: '/web/timerlist',
		apiServicelistplayable: '/web/servicelistplayable?sRef=1%3A7%3A1%3A0%3A0%3A0%3A0%3A0%3A0%3A0%3AFROM%20BOUQUET%20%22userbouquet.favourites.tv%22%20ORDER%20BY%20bouquet'
	},
	
	// Define required scripts.
	getScripts: function() {
		return ["moment.js", 'xml2json.js', "font-awesome.css"];
	},
	
	getStyles: function() {
		return ['MMM-Dreambox.css'];
	},

	start: function() {
		//var dataRequest = null;
		Log.info('Starting module: ' + this.name);
		this.loaded = false;
		this.sendSocketNotification('CONFIG', this.config);
	},

	getDom: function() {
		var self = this;

		// create element wrapper for show into the module
		var wrapper = document.createElement("div");

		//First Line
		var ServiceItem2 = document.createElement("div");
		//ServiceItem2.setAttribute('class', 'xxxMMM-Dreambox');
		ServiceItem2.setAttribute('class', 'float');
		if (this.model != undefined) {
			ServiceItem2.innerHTML = 'Modell: ' +this.model+ '&nbsp;';
		} else if (this.Errormessage != undefined){
			ServiceItem2.innerHTML = 'Fehler: ' +this.Errormessage;
		}
		//AXLED NEU
		var ServiceItem3 = document.createElement("div");
		ServiceItem3.setAttribute('class', 'float');
		if (this.timerstring != undefined){
			ServiceItem3.innerHTML = '- '+ this.timerstring;
		} else {
			ServiceItem3.innerHTML = '- dezeit läuft: (' +this.tuned + ')';
		}
		//AXLED NEU

		//add separator
		var Separator = document.createElement("hr");
		Separator.setAttribute('class', 'db');
	//ServiceItem2.appendChild(Separator);

		wrapper.appendChild(ServiceItem2);
		//Axled Neu
		//ServiceItem3.appendChild(Separator);
		wrapper.appendChild(ServiceItem3);
		wrapper.appendChild(Separator);
		//Axled Neu

		//Line for stations
		if (this.dataRequest === "DB-SERVICES" || this.dataRequest === "DB-EPGNOW" || this.dataRequest === "DB-TIMER" || this.dataRequest === "DB-SLP") {//Axled kann diese Zeile evtl raus, da UpdateDOM immer funktionieren soll
			for (let index = 0; index < this.anzahl; index++) {
				var ServiceItem = document.createElement("div");
				ServiceItem.setAttribute('class', 'db');
				
				if(this.epgtitle == undefined){
					ServiceItem.innerHTML = this.sender[index].e2servicename;
				} else {
					//ServiceItem.innerHTML = this.sender[index].e2servicename +' - ('+this.epg(this.epgtitle,this.sender[index].e2servicereference)+')';
					//ServiceItem.innerHTML = this.sender[index].e2servicename +' - ('+moment.unix(this.epgtitle[index].e2eventstart).format('HH:mm')+' '+this.epg(this.epgtitle,this.sender[index].e2servicereference)+')';
					ServiceItem.innerHTML = this.sender[index].e2servicename +' - ('+moment.unix(this.epgtitle[index].e2eventstart).format('HH:mm')+' '+this.epgtitle[index].e2eventtitle+')';
				}
				
				ServiceItem.setAttribute('id', index);

				if(this.tuned === this.sender[index].e2servicename) {
					ServiceItem.setAttribute('class', 'selected');
					serviceselected = index;// remember the selected service for zapping
				}
				//mark playable services (only if timer is running)
				if(this.slp != undefined && this.timerstring != undefined){
				//if(this.slp != undefined){
					if(this.slp[index].e2isplayable === "False"){
						//console.log('AxLED slp erreicht:',this.slp[index].e2isplayable);
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
		//console.log('Axled onlyplayable in function nextselection:',onlyplayable);
		if (onlyplayable === true){
			serviceselected = selected;
			newserviceselected = '';
			var x = document.querySelectorAll('div.db, div.selected');
			//console.log('AxLED Serviceselected:',serviceselected);
			
			if (direction === '+'){
				if (serviceselected == ''){
					serviceselected = 0;
				} else {
					//remove old selection
					document.getElementById(serviceselected).setAttribute('class','db');
				}
				
				//var x = document.querySelectorAll('div.db, div.selected');
				for (let index = 0; index < x.length; index++) {
					//console.log('Axled function nextselection:',x[index].id);
					if (serviceselected < x[index].id && newserviceselected == '') {
						newserviceselected = x[index].id;
						//console.log('Axled plus serviceselected/newserviceselected:',serviceselected,'/',newserviceselected);
						//set new selection
						document.getElementById(newserviceselected).setAttribute('class','selected');
					} else if (serviceselected == x[x.length-1].id) {//if last entry is reached, set the first value for looping through the playable stattions
						//newserviceselected = x[index].id;
						newserviceselected = x[0].id;
						//console.log('Axled else erreicht:',serviceselected,'/',newserviceselected);
						document.getElementById(newserviceselected).setAttribute('class','selected');
					}
				}
			} else if (direction == '-'){
				if (serviceselected == ''){
					serviceselected = this.anzahl-1;
				} else {
					//remove old selection
					document.getElementById(serviceselected).setAttribute('class','db');
				}
				//console.log('Axled minus direction erreicht.');
				//for (let index = 0; index < x.length; index++) {
				for (let index = x.length-1; index >= 0; index--) {//negative loop
					//console.log('Axled negative for schleife/serviceselected/newserviceselected:',x[index].id,'/',serviceselected,'/', newserviceselected);
					if (serviceselected > x[index].id && newserviceselected == '') {
						newserviceselected = x[index].id;
						//console.log('Axled minus serviceselected/newserviceselected:',serviceselected,'/',newserviceselected);
						//set new selection
						document.getElementById(newserviceselected).setAttribute('class','selected');
					} else if (serviceselected == x[0].id) {//if first entry is reached, set the last value for looping through the playable stattions
						//newserviceselected = x[index].id;
						newserviceselected = x[x.length-1].id;
						//console.log('Axled else erreicht:',serviceselected,'/',newserviceselected);
						document.getElementById(newserviceselected).setAttribute('class','selected');
					}
				}
			}
		} else { //onlyplayable = false or ''
			serviceselected = selected;
			newserviceselected = '';
			if (direction === '+'){// Next
				//console.log('1. Axled serviceselected/newserviceselected:',serviceselected,'/',newserviceselected);
				//if (serviceselected === ''){
				if (serviceselected === '' || serviceselected === this.anzahl-1){
					serviceselected = -1;
					document.getElementById(parseInt(this.anzahl-1)).setAttribute('class','db');
				/*} else if (serviceselected === this.anzahl-1){
					serviceselected = -1;*/
				} else {
					//remove old selection
					document.getElementById(serviceselected).setAttribute('class','db');
				}
				//console.log('2. Axled serviceselected/newserviceselected:',serviceselected,'/',newserviceselected);
				document.getElementById(parseInt(serviceselected+1)).setAttribute('class','selected');
				newserviceselected = parseInt(serviceselected+1);
				//console.log('3. Axled serviceselected/newserviceselected:',serviceselected,'/',newserviceselected);
			} else if (direction === '-'){// Prev
				//console.log('1. Axled serviceselected/newserviceselected:',serviceselected,'/',newserviceselected);
				//if (serviceselected === 0){
				//serviceselected = parseInt(this.anzahl)-1;
				if (serviceselected === '' || serviceselected === 0){
					//serviceselected = parseInt(this.anzahl)-1;
					serviceselected = parseInt(this.anzahl);
					document.getElementById(0).setAttribute('class','db');
				} else {
					//remove old selection
					document.getElementById(serviceselected).setAttribute('class','db');
				}
				//console.log('2. Axled serviceselected/newserviceselected:',serviceselected,'/',newserviceselected);
				document.getElementById(parseInt(serviceselected-1)).setAttribute('class','selected');
				newserviceselected = parseInt(serviceselected-1);
				//console.log('3. Axled serviceselected/newserviceselected:',serviceselected,'/',newserviceselected);
			}
		}
		return newserviceselected;
		//return;
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
			if (onlyplayable === true){
				//add zap information
				payload = [this.sender[parseInt(serviceselected)].e2servicereference,''];
			} else {
				payload = [this.sender[parseInt(serviceselected)].e2servicereference,'zap'];
			}
			//console.log('Axled DB-PLAY1:',payload);
			this.sendSocketNotification('DB-PLAY', payload);
		}
		
		if(notification === "DB-STOP"){
			this.sendSocketNotification('DB-STOP', payload);
		}
    },
	
 	socketNotificationReceived: function(notification, payload) {
    		if (notification === "STARTED") {
				//Neu
				this.startFetchingData(this.config.refreshInterval);
				//Neu
				//ALT
				//this.updateDom();
				//ALT
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
					//console.log('Axled DB-TIMER',json);
					if (json.e2timerlist.e2timer[0].e2state === "2"){//Timer in List are sorted, so only first entry can run
						this.timerstring = 'Aufnahme läuft: '+json.e2timerlist.e2timer[0].e2name+' ('+json.e2timerlist.e2timer[0].e2servicename+')';
						//console.log('Axled Timer läuft: ',this.timerstring);
						this.updateDom();
					} 
				} else if(payload[0]==='DB-SLP'){
					this.dataRequest = payload[0];
					var json=xml2json(payload[1]);
					//console.log('Axled DB-SLP',json);
					this.slp = json.e2servicelistplayable.e2serviceplayable;
					this.updateDom();
				} 
				//this.updateDom();
			}
	},
	
	startFetchingData: function(interval) {
		// start immediately ...
		//this.sendSocketNotification("FETCH_DATA", '');
		if (IntervalID === ''){
			// ... and then repeat in the given interval
			//setInterval(() => {
			IntervalID = setInterval(() => {
			//setTimeout(() => {
			this.sendSocketNotification("FETCH_DATA", '');
			//console.log(moment().format('LTS'),': Axled Interval ausgelöst.');
			}, interval);
			//console.log('Axled Intervall ID:',IntervalID);
		}
	}

});
