/* global Module */

/* Magic Mirror
 * Module: MMM-Dreambox
 *
 * By AxLED
 * MIT Licensed.
 */

 var serviceselected = '';
 var servicestatus = '';
 var onlyplayable = '';
 var IntervalID2 = '';
 var newserviceselected = '';
 var xml2json = '';
 var liststart = 0;
 var listcondition = '';

Module.register('MMM-Dreambox', {
	
	defaults: {
		units: config.units,
		refreshInterval: 1000 * 30, //refresh every 30 seconds
		timeFormat: config.timeFormat,
		lang: config.language,
		apiBase: 'http://ipofyourreceiver:port',//AxLED
		apiabout: '/web/about',
		apiservices: '/web/getallservices',
		apiepgnow: '/web/epgnow?bRef=1%3A7%3A1%3A0%3A0%3A0%3A0%3A0%3A0%3A0%3AFROM%20BOUQUET%20%22userbouquet.favourites.tv%22%20ORDER%20BY%20bouquet',
		apizap: '/web/zap?sRef=',
		apiTimerlist: '/web/timerlist',
		apiServicelistplayable: '/web/servicelistplayable?sRef=1%3A7%3A1%3A0%3A0%3A0%3A0%3A0%3A0%3A0%3AFROM%20BOUQUET%20%22userbouquet.favourites.tv%22%20ORDER%20BY%20bouquet',
		omxargs: ' --win 320,180,1600,900  -o both ',
		apibouquet: 0,
		listmax: 15 //how many entries should be displayed on module
	},
	
	// Define required scripts.
	getScripts: function() {
		return ["moment.js", 'MMM-Dreambox-xml2json.js', "font-awesome.css"];
	},
	
	getStyles: function() {
		return ['MMM-Dreambox.css'];
	},

	getTranslations: function() {
		return {
			de: "translations/de.json",
			en: "translations/en.json",
			nl: "translations/nl.json"
		};
	},

	start: function() {
		Log.info('Starting module: ' + this.name);
		this.loaded = false;
		this.listmax = this.config.listmax;
		this.sendSocketNotification('CONFIG', this.config);
	},

	getDom: function() {
		var self = this;

		// create element wrapper for show into the module
		var wrapper = document.createElement("div");
		wrapper.setAttribute('id', 'MMM-Dreambox');

		//Errorhandling
		var Errorinfo = document.createElement("div");
		Errorinfo.setAttribute('class', 'float');
		Errorinfo.setAttribute('id','error1');
		Errorinfo.setAttribute('style','display: none;');
		Errorinfo.innerHTML = '';
		var Separator = document.createElement("hr");
		Separator.setAttribute('class', 'db');
		Separator.setAttribute('id','error2');
		Separator.setAttribute('style','display: none;');
		wrapper.appendChild(Errorinfo);
		wrapper.appendChild(Separator);
		
		//Model of Receiver
		var Receiverinfo = document.createElement("div");
		Receiverinfo.setAttribute('class', 'float');
		Receiverinfo.setAttribute('id','model');
		Receiverinfo.innerHTML = '';
		
		//Info now playing
		var Nowplayinginfo = document.createElement("div");
		Nowplayinginfo.setAttribute('class', 'float');
		Nowplayinginfo.setAttribute('id','nowplaying');
		Nowplayinginfo.innerHTML = '';
		var Separator = document.createElement("hr");
		Separator.setAttribute('class', 'db');

		//axled neu, bouquets und anzahl
		var Bouquetinfo = document.createElement("div");
		Bouquetinfo.setAttribute('class', 'float');
		Bouquetinfo.setAttribute('id','bouquet');
		Bouquetinfo.innerHTML = '';
		var Separator2 = document.createElement("hr");
		Separator2.setAttribute('class', 'db');

		wrapper.appendChild(Receiverinfo);
		wrapper.appendChild(Nowplayinginfo);
		wrapper.appendChild(Separator);

		wrapper.appendChild(Bouquetinfo);
		wrapper.appendChild(Separator2);
		return wrapper;
	},

	nextselection: function (selected, direction) {

		servicestatus = '';//remove possible play status

		if (onlyplayable === true){
			serviceselected = selected;
			newserviceselected = '';
			var x = document.querySelectorAll('div.db, div.selected');

			if (direction === '+'){
				if (serviceselected === '' || serviceselected.length === 0){
					serviceselected = 0;
				} else {
					document.getElementById('MMM-Dreambox'+serviceselected).setAttribute('class','db');//remove old selection
				}
				
				for (let index = 0; index < x.length; index++) {
					idonly = x[index].id.substring (12, x[index].id.length);//exctract ID (only number) from ID-String by cutting the first 12 characters
					idonly2 = x[x.length-1].id.substring (12, x[x.length-1].id.length);//highest ID playable
					if ((parseInt(serviceselected) < parseInt(idonly)) && newserviceselected == '') {
						newserviceselected = idonly;
						if (parseInt(newserviceselected) >= parseInt(this.listmax)){//Axled paging by showing/hidding
							this.liststart = Math.floor(newserviceselected/this.config.listmax)*this.config.listmax;
							this.listmax = this.liststart + this.config.listmax;//optimierbar, da nächster Wert auch 2 Pages weiter sein kann
							this.servicelist2(this.liststart,this.listmax);
						} //Axled paging by showing/hidding
						document.getElementById('MMM-Dreambox'+newserviceselected).setAttribute('class','selected');//set new selection
					} else if (serviceselected == idonly2) {//if last entry is reached, set the first value for looping through the playable stattions
						newserviceselected = x[0].id.substring (12, x[0].id.length);
						if (parseInt(newserviceselected) < parseInt(this.liststart)){//Axled paging by showing/hidding
							this.liststart = Math.floor(newserviceselected/this.config.listmax)*this.config.listmax;
							this.listmax = this.liststart + this.config.listmax;
							this.servicelist2(this.liststart,this.listmax);
						} //Axled paging by showing/hidding
						document.getElementById('MMM-Dreambox'+newserviceselected).setAttribute('class','selected');
					}
				}
			} else if (direction == '-'){
				if (serviceselected === '' || serviceselected.length === 0){
					serviceselected = this.anzahl-1;
				} else {
					document.getElementById('MMM-Dreambox'+serviceselected).setAttribute('class','db');//remove old selection
				}

				for (let index = x.length-1; index >= 0; index--) {//negative loop
					idonly = x[index].id.substring (12, x[index].id.length);//exctract ID (only number) from ID-String by cutting the first 12 characters
					idonly2 = x[0].id.substring (12, x[0].id.length);
					if ((parseInt(serviceselected) > parseInt(idonly)) && newserviceselected == '') {
						newserviceselected = idonly;
						if (parseInt(newserviceselected) < parseInt(this.liststart)){//Axled paging by showing/hidding
							this.liststart = Math.floor(newserviceselected/this.config.listmax)*this.config.listmax;
							this.listmax = this.liststart + this.config.listmax;
							this.servicelist2(this.liststart,this.listmax);
						} //Axled paging by showing/hidding
						document.getElementById('MMM-Dreambox'+newserviceselected).setAttribute('class','selected');//set new selection
					} else if (serviceselected == idonly2) {//if first entry is reached, set the last value for looping through the playable stattions
						newserviceselected = x[x.length-1].id.substring (12, x[x.length-1].id.length);
						if (parseInt(newserviceselected) >= parseInt(this.listmax)){//Axled paging by showing/hidding
							this.liststart = Math.floor(newserviceselected/this.config.listmax)*this.config.listmax;
							this.listmax = this.liststart + this.config.listmax;
							this.servicelist2(this.liststart,this.listmax);
						} //Axled paging by showing/hidding
						document.getElementById('MMM-Dreambox'+newserviceselected).setAttribute('class','selected');
					}
				}
			}
		} else { //onlyplayable = false or ''
			serviceselected = selected;
			newserviceselected = '';
			if (direction === '+'){
				if (serviceselected === '' || serviceselected === this.anzahl-1){
					serviceselected = -1;
					document.getElementById('MMM-Dreambox'+parseInt(this.anzahl-1)).setAttribute('class','db');
					this.liststart = 0;
					this.listmax = this.config.listmax;
					this.servicelist2(this.liststart,this.listmax);
				} else {
					if (serviceselected+1 === this.listmax){
						this.liststart = Math.floor((serviceselected+1)/this.config.listmax)*this.config.listmax;
						this.listmax = this.listmax + this.config.listmax;
						this.servicelist2(this.liststart,this.listmax);
					} 
					document.getElementById('MMM-Dreambox'+serviceselected).setAttribute('class','db');//remove old selection
				}
				document.getElementById('MMM-Dreambox'+parseInt(serviceselected+1)).setAttribute('class','selected');
				newserviceselected = parseInt(serviceselected+1);
			} else if (direction === '-'){
				if (serviceselected === '' || serviceselected === 0){
					serviceselected = parseInt(this.anzahl);
					document.getElementById('MMM-Dreambox'+0).setAttribute('class','db');
					this.liststart = Math.floor((serviceselected-0.01)/this.config.listmax)*this.config.listmax;
					this.listmax = this.liststart + this.config.listmax;
					this.servicelist2(this.liststart,this.listmax);
				} else {
					if (serviceselected === this.liststart){
						this.liststart = Math.floor((serviceselected-1)/this.config.listmax)*this.config.listmax;
						this.listmax = this.liststart + this.config.listmax;
						this.servicelist2(this.liststart,this.listmax);
					} 
					document.getElementById('MMM-Dreambox'+serviceselected).setAttribute('class','db');//remove old selection
				}
				document.getElementById('MMM-Dreambox'+parseInt(serviceselected-1)).setAttribute('class','selected');
				newserviceselected = parseInt(serviceselected-1);
			}
		}
		return newserviceselected;
	},

	servicelist2: function(liststart,listcondition){
		//console.log('Axled serviceselected/Länge/typeof:',moment().format('LTS'),' ',serviceselected,'/',serviceselected.length,'/',typeof serviceselected); 
		for (let index = 0; index < this.anzahl; index++) {
			if (document.getElementById('MMM-Dreambox'+index) === null) {//if div not there, create and append it
				var ServiceItem = document.createElement("div");
				ServiceItem.setAttribute('class', 'db');
				ServiceItem.setAttribute('id','MMM-Dreambox'+index);
			} else {//if there, update the content
				var ServiceItem = document.getElementById('MMM-Dreambox'+index);
				//ServiceItem.setAttribute('class', 'db');//axled, this was needed for unselect at refresh
			}
			
			if(this.epg == undefined){
				ServiceItem.innerHTML = index+1 +' '+ this.sender[index].e2servicename;
			} else {
				if (this.epg[index].e2eventstart === "None") {//no epg information for this service
					ServiceItem.innerHTML = index+1 +' '+ this.sender[index].e2servicename+' - ('+this.translate("noepginformation")+')';
				} else {
					ServiceItem.innerHTML = index+1 +' '+ this.sender[index].e2servicename +' - ('+moment.unix(this.epg[index].e2eventstart).format('HH:mm')+' '+this.epg[index].e2eventtitle+')';
				}
			}

			//Axled keep selected service and servicestatus marked
			if (serviceselected === index && servicestatus === ''){
				//document.getElementById('MMM-Dreambox'+serviceselected).setAttribute('class','selected');
				ServiceItem.setAttribute('class','selected');
			} else if (serviceselected === index && servicestatus === 'play'){
				//document.getElementById('MMM-Dreambox'+serviceselected).setAttribute('class','selected play');
				ServiceItem.setAttribute('class','selected play');
			}

			//mark playable services (only if timer on single tuner receiver is running)
			if((this.slp != undefined && this.timerstring != undefined)||(this.slp != undefined && this.timerstring != null)){
				if(this.slp[index].e2isplayable === "False"){
					ServiceItem.setAttribute('class', 'inactive');
					onlyplayable = true;
				} 
			} else {
				onlyplayable = '';//to reset onlyplayable
			}

			//listmax,liststart,listcondition: set all unwanted divs to hidden
			if (index < liststart || index >= listcondition){
				ServiceItem.setAttribute('style','display: none;');
			} else {
				ServiceItem.removeAttribute('style');
			}
			
			if (document.getElementById('MMM-Dreambox'+index) === null) {//if div not there, create and append it
				document.getElementById('MMM-Dreambox').appendChild(ServiceItem);//ID of parent item
			} 
		}
		return false;
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
			if (serviceselected ===''){
				this.sendNotification("SHOW_ALERT",{type:"notification",message:"MMM-Dreambox: "+this.translate("errornoserviceselected")});
			} else {
				document.getElementById('MMM-Dreambox'+serviceselected).setAttribute('class','selected play');
				servicestatus = 'play';
				if (onlyplayable === true || this.slp[serviceselected].e2isplayable === "True"){//add zap information
					payload = [this.sender[parseInt(serviceselected)].e2servicereference,''];
				} else {// zap before streaming required
					payload = [this.sender[parseInt(serviceselected)].e2servicereference,'zap'];
				}
				this.sendSocketNotification('DB-PLAY', payload);
			}
		}
		
		if(notification === "DB-STOP"){
			if (serviceselected !==''){
				document.getElementById('MMM-Dreambox'+serviceselected).setAttribute('class','selected');
				servicestatus = '';
				this.sendSocketNotification('DB-STOP', payload);
				this.sendSocketNotification('FETCH_DATA', payload);
			}
		}
    },
	
 	socketNotificationReceived: function(notification, payload) {
    		if (notification === "STARTED") {
				this.startFetchingData(this.config.refreshInterval);
			} else if (notification === "DATA") {
				this.loaded = true;
				//console.log('Axled DATA: ',moment().format('LTS')); 
				if(payload[0]==='DB-EPGNOW'){//no single Dom-Item to refresh, so storing as variable is fine
					//console.log('Axled EPGNOW: ',moment().format('LTS')); 
					var json=xml2json(payload[1]);
					this.epg = json.e2eventlist.e2event;
				this.servicelist2(this.liststart,this.listmax);//um das Dom mit neuen Daten zu füllen
				} else if(payload[0]==='DB-ABOUT'){
					//console.log('Axled ABOUT: ',moment().format('LTS')); 
					var json=xml2json(payload[1]);
					this.model = json.e2abouts.e2about.e2model;
					this.tuned = json.e2abouts.e2about.e2servicename;
					document.getElementById('model').innerHTML = this.translate("model") +this.model+ '&nbsp;';
					if (this.timerstring != undefined || this.timerstring != null){
						document.getElementById('nowplaying').innerHTML = '- '+ this.timerstring;
					} else {
						//Nowplayinginfo.innerHTML = '- ' +this.translate("nowplaying")+ '(' +this.tuned + ')';
						document.getElementById('nowplaying').innerHTML = '- ' +this.translate("nowplaying")+ '(' +this.tuned + ')';
					}
				} else if(payload[0]==='DB-SERVICES'){
					//console.log('Axled SERVICES: ',moment().format('LTS')); 
					var json=xml2json(payload[1]);
					if (Array.isArray(json.e2servicelistrecursive.e2bouquet) === true){//more than one e2bouquet
						this.sender = json.e2servicelistrecursive.e2bouquet[this.config.apibouquet].e2servicelist.e2service;
						this.anzahl = json.e2servicelistrecursive.e2bouquet[this.config.apibouquet].e2servicelist.e2service.length;
						this.bouquet = json.e2servicelistrecursive.e2bouquet[this.config.apibouquet].e2servicename;
					} else {//only one e2bouquet
						this.sender = json.e2servicelistrecursive.e2bouquet.e2servicelist.e2service;
						this.anzahl = json.e2servicelistrecursive.e2bouquet.e2servicelist.e2service.length;
						this.bouquet = json.e2servicelistrecursive.e2bouquet.e2servicename;
					}
					document.getElementById('bouquet').innerHTML = this.bouquet + ' (' + this.anzahl + ')';
					this.servicelist2(this.liststart,this.listmax);
				} else if(payload[0]==='ERROR'){
					//console.log('Axled ERROR: ',moment().format('LTS')); 
					this.Errormessage = payload[1];
					document.getElementById('error1').innerHTML = this.Errormessage;
					document.getElementById('error1').removeAttribute('style');//do make it visible
					document.getElementById('error2').removeAttribute('style');//do make it visible
				} else if(payload[0]==='DB-TIMER'){//no single Dom-Item to refresh, so storing as variable is fine
					//console.log('Axled TIMER: ',moment().format('LTS')); 
					var json=xml2json(payload[1]);
					if (json.e2timerlist.hasOwnProperty('e2timer') === true && Array.isArray(json.e2timerlist.e2timer) === true){//more than one timer in timerlist
						if (json.e2timerlist.e2timer[0].e2state === "2"){//Timer in List are sorted, so only first entry can (should) run, sometimes the second entry runs
							this.timerstring = this.translate("recording")+json.e2timerlist.e2timer[0].e2name+' ('+json.e2timerlist.e2timer[0].e2servicename+')';
						} else if (json.e2timerlist.e2timer[0].e2state === "0"){
							this.timerstring = null;
						}
						this.servicelist2(this.liststart,this.listmax);//um das Dom mit neuen Daten zu füllen
					} else if (json.e2timerlist.hasOwnProperty('e2timer') === true && Array.isArray(json.e2timerlist.e2timer) === false) {// only one timer
						if (json.e2timerlist.e2timer.e2state === "2"){//Timer in List are sorted, so only first entry can (should) run, sometimes the second entry runs
							this.timerstring = this.translate("recording")+json.e2timerlist.e2timer.e2name+' ('+json.e2timerlist.e2timer.e2servicename+')';
						} else if (json.e2timerlist.e2timer.e2state === "0"){
							this.timerstring = null;
						}
						this.servicelist2(this.liststart,this.listmax);//um das Dom mit neuen Daten zu füllen
					}
				} else if(payload[0]==='DB-SLP'){//no single Dom-Item to refresh, so storing as variable is fine
					//console.log('Axled SLP: ',moment().format('LTS')); 
					var json=xml2json(payload[1]);
					this.slp = json.e2servicelistplayable.e2serviceplayable;
					this.servicelist2(this.liststart,this.listmax);//um das Dom mit neuen Daten zu füllen
				} 
			}
	},

	startFetchingData: function(interval) {
		if (IntervalID2 === ''){
			// ... and then repeat in the given interval
			IntervalID2 = setInterval(() => {
			this.sendSocketNotification('FETCH_DATA', '')
			}, interval); 
		}
	}

});