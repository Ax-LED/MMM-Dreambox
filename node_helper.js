//'use strict';

/* Magic Mirror
 * Module: MMM-Dreambox
 *
 * By AxLED
 * MIT Licensed.
 */

const NodeHelper = require('node_helper');
const request = require('request');
const exec = require("child_process").exec;
const parser = require("./MMM-Dreambox-xml2json.js");

var Errormessage = '';
var ref = '';

module.exports = NodeHelper.create({

	start: function() {
		this.started = false;
		this.config = null;
	},

	socketNotificationReceived: function(notification, payload) {
		var self = this;
		if (notification === 'CONFIG' && self.started == false) {
			self.config = payload;
			self.getData2();
			self.started = true;
			console.log("Starting node helper for: " + self.name);
			//self.sendSocketNotification("STARTED", true);
		} else if (notification === 'CONFIG' && self.started == true){
			self.getData2();//Initial Dataload before timer interval is activated
		}

		if (notification === "DB-PLAY") {
			exec('pkill omxplayer', null);//put a stop before starting a new stream
			if (payload[1] === 'zap') {
				var myUrl = this.config.apiBase;
				request({url: myUrl+this.config.apizap+payload[0] }, function (error, response, body) {
					if (!error && response.statusCode == 200) {
						//exec('omxplayer '+self.config.omxargs+self.config.apiBase+':8001/'+payload[0], null);//without '--live' buffering works
						//console.log('Debug MMM-Dreambox: omxplayer '+self.config.omxargs+self.trimPort(self.config.apiBase)+':8001/'+payload[0]);
						//console.log('Debug MMM-Dreambox: zapstate:'+payload[1]);
						exec('omxplayer '+self.config.omxargs+self.trimPort(self.config.apiBase)+':8001/'+payload[0], null);//without '--live' buffering works
					} else {
						//console.log('Debug MMM-Dreambox: error = true oder response.statusCode <> 200, this message should never be seen');
					}
				});
				self.getData2();
			} else if (payload[1] === '') {
				//exec('omxplayer '+self.config.omxargs+self.config.apiBase+':8001/'+payload[0], null);//without --live buffering works
				//console.log('Debug MMM-Dreambox: omxplayer '+self.config.omxargs+self.trimPort(self.config.apiBase)+':8001/'+payload[0]);
				//console.log('Debug MMM-Dreambox: zapstate:'+payload[1]);
				exec('omxplayer '+self.config.omxargs+self.trimPort(self.config.apiBase)+':8001/'+payload[0], null);//without --live buffering works
				self.getData2();
			} else if (payload[1] === 'Recordings'){
				//http://dm800se.fritz.box/file?file=/media/hdd/movie/20190218%200102%20-%20ProSieben%20-%20Star%20Trek%20Beyond.ts
				//console.log('MMM-Dreambox Recordings:'+self.config.omxargs+self.config.apiBase+'/file?file='+payload[0]);
				//console.log('MMM-Dreambox Recordings ENCODED:'+self.config.omxargs+self.config.apiBase+'/file?file='+encodeURI(payload[0]));
				exec('omxplayer '+self.config.omxargs+self.config.apiBase+'/file?file='+payload[0], null);//without --live buffering works
			}
			//self.getData2();
		}

		if (notification === "DB-STOP") {
			exec('pkill omxplayer', null);
		}

		if (notification === "FETCH_DATA") {
			if(payload === ''){
				self.getData2();
			} else {
				self.getData_Recordings();
			}
		}
	},

	trimPort: function(link) {
		//console.log('Axled link/poslast/posfirst:'+link+'/'+link.lastIndexOf(":")+'/'+link.indexOf(":")); 
		if (link.lastIndexOf(":") != link.indexOf(":")) {
			link = link.slice(0,link.lastIndexOf(":"));
			//console.log('Axled if:'+link); 
		}
		return link;
	},

	getData2: function() {
		//var self = this;
		//var myUrl = this.config.apiBase;

		this.getData_services();//as we need the variable ref first
		
		//1.Request - EPGNOW
		//this.getData_epgnow();
		/*
		request({url: myUrl+this.config.apiepgnow }, function (error, response, body) {
		
			if (!error && response.statusCode == 200) {
				//body_epgnow = body;
				self.sendSocketNotification("DATA",['DB-EPGNOW',body]);
			} else {
				//if (!error && response.statusCode == 404){//because sometimes error is null
				if ((!error && response.statusCode == 404)||(!error && response.statusCode == 401)){//because sometimes error is null
					Errormessage = 'Error: ' + response.statusCode + response.statusMessage + ' in '+myUrl+self.config.apiepgnow;
					//console.log('Axled 2 Response:'+response.statusCode+response.statusMessage); 
				} else {
					Errormessage = 'Error: ' + error +' in '+myUrl+self.config.apiepgnow;
				}
				self.sendSocketNotification("DATA",['ERROR',Errormessage]);
			}
		});*/
		//2.Request - About
		this.getData_about();
		/*
		request({url: myUrl+self.config.apiabout }, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				//body_about = body;
				self.sendSocketNotification("DATA",['DB-ABOUT',body]);
			} else {
				if ((!error && response.statusCode == 404)||(!error && response.statusCode == 401)){
					Errormessage = 'Error: ' + response.statusCode + response.statusMessage + ' in '+myUrl+self.config.apiabout;
				} else {
					//Errormessage = 'Error: ' + response.statusCode + response.statusMessage + ' in '+myUrl+self.config.apiabout;
					Errormessage = 'Error: ' + error + ' in '+myUrl+self.config.apiabout;
				}
				self.sendSocketNotification("DATA",['ERROR',Errormessage]);
			}
		});*/
		//3.Request - Services
		//this.getData_services();
		/*
		request({url: myUrl+this.config.apiservices }, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				//body_services = body;
				self.sendSocketNotification("DATA",['DB-SERVICES',body]);
			} else {
				if ((!error && response.statusCode == 404)||(!error && response.statusCode == 401)){
					Errormessage = 'Error: ' + response.statusCode + response.statusMessage + ' in '+myUrl+self.config.apiservices;
				} else {
					//Errormessage = 'Error: ' + response.statusCode + response.statusMessage + ' in '+myUrl+self.config.apiservices;
					Errormessage = 'Error: ' + error + ' in '+myUrl+self.config.apiservices;
				}
				self.sendSocketNotification("DATA",['ERROR',Errormessage]);
			}
		});*/
		//4.Request - Timerlist
		this.getData_timerlist();
		/*
		request({url: myUrl+this.config.apiTimerlist }, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				self.sendSocketNotification("DATA",['DB-TIMER',body]);
			} else {
				if ((!error && response.statusCode == 404)||(!error && response.statusCode == 401)){
					Errormessage = 'Error: ' + response.statusCode + response.statusMessage + ' in '+myUrl+self.config.apiTimerlist;
				} else {
					//Errormessage = 'Error: ' + response.statusCode + response.statusMessage + ' in '+myUrl+self.config.apiTimerlist;
					Errormessage = 'Error: ' + error + ' in '+myUrl+self.config.apiTimerlist;
				}
				self.sendSocketNotification("DATA",['ERROR',Errormessage]);
			}
		});*/

		
		//5.Request - Servicelistplayable
		this.getData_servicelistplayable();
	
		/*
		request({url: myUrl+this.config.apiServicelistplayable }, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				self.sendSocketNotification("DATA",['DB-SLP',body]);
			} else {
				if ((!error && response.statusCode == 404)||(!error && response.statusCode == 401)){
					Errormessage = 'Error: ' + response.statusCode + response.statusMessage + ' in '+myUrl+self.config.apiServicelistplayable;
				} else { 
					//Errormessage = 'Error: ' + response.statusCode + response.statusMessage + ' in '+myUrl+self.config.apiServicelistplayable;
					Errormessage = 'Error: ' + error + ' in '+myUrl+self.config.apiServicelistplayable;
				}
				self.sendSocketNotification("DATA",['ERROR',Errormessage]);
			}
		});*/
		this.getData_epgnow();
	},

	/*getData_old_epgnow: function() {
		var self = this;
		var myUrl = this.config.apiBase;
		
		//1.Request - EPGNOW
		request({url: myUrl+this.config.apiepgnow }, function (error, response, body) {
		
			if (!error && response.statusCode == 200) {
				json = parser.xml2json(body);
				self.sendSocketNotification("DATA",['DB-EPGNOW',json]);
			} else {
				//if (!error && response.statusCode == 404){//because sometimes error is null
				if ((!error && response.statusCode == 404)||(!error && response.statusCode == 401)){//because sometimes error is null
					Errormessage = 'Error: ' + response.statusCode + response.statusMessage + ' in '+myUrl+self.config.apiepgnow;
					//console.log('Axled 2 Response:'+response.statusCode+response.statusMessage); 
				} else {
					Errormessage = 'Error: ' + error +' in '+myUrl+self.config.apiepgnow;
				}
				self.sendSocketNotification("DATA",['ERROR',Errormessage]);
			}
		});
	},
	*/

	/*getData_epgnow_temp: function() {
		var self = this;
		var myUrl = this.config.apiBase;
		/*
		//1.Request - EPGNOW
		request({url: myUrl+this.config.apiepgnow }, function (error, response, body) {
		
			if (!error && response.statusCode == 200) {
				json = parser.xml2json(body);
				self.sendSocketNotification("DATA",['DB-EPGNOW',json]);
			} else {
				//if (!error && response.statusCode == 404){//because sometimes error is null
				if ((!error && response.statusCode == 404)||(!error && response.statusCode == 401)){//because sometimes error is null
					Errormessage = 'Error: ' + response.statusCode + response.statusMessage + ' in '+myUrl+self.config.apiepgnow;
					//console.log('Axled 2 Response:'+response.statusCode+response.statusMessage); 
				} else {
					Errormessage = 'Error: ' + error +' in '+myUrl+self.config.apiepgnow;
				}
				self.sendSocketNotification("DATA",['ERROR',Errormessage]);
			}
		});

		//Request - to catch bouquet ref of apibouquet number from config
		request({url: myUrl+this.config.apiservices }, (error, response, body) => {
			if (!error && response.statusCode == 200) {	//if response is ok, then get movies in directory
				json = parser.xml2json(body);
				//e2servicelistrecursive.e2bouquet[this.config.apibouquet].e2servicereference
				if (Array.isArray(json.e2servicelistrecursive.e2bouquet) === true){//more than one e2bouquet
					ref = encodeURIComponent(json.e2servicelistrecursive.e2bouquet[this.config.apibouquet].e2servicereference).replace(/%26quot%3B/g,"%22");//encodeURIComponent() also encode : (colon); replace is needed for the " (quote)
				} else {//only one e2bouquet
					ref = encodeURIComponent(json.e2servicelistrecursive.e2bouquet.e2servicereference).replace(/%26quot%3B/g,"%22");//encodeURIComponent() also encode : (colon)
				}
				//2.Request - EPGNOW
				//request({url: myUrl+this.config.apiepgnow+'1%3A7%3A1%3A0%3A0%3A0%3A0%3A0%3A0%3A0%3AFROM%20BOUQUET%20%22userbouquet.favourites.tv%22%20ORDER%20BY%20bouquet' }, function (error, response, body) {
				request({url: myUrl+this.config.apiepgnow+ref }, function (error, response, body) {
				
					if (!error && response.statusCode == 200) {
						json = parser.xml2json(body);
						//console.log('Axled json:',json);
						self.sendSocketNotification("DATA",['DB-EPGNOW',json]);
					} else {
						//if (!error && response.statusCode == 404){//because sometimes error is null
						if ((!error && response.statusCode == 404)||(!error && response.statusCode == 401)){//because sometimes error is null
							Errormessage = 'Error: ' + response.statusCode + response.statusMessage + ' in '+myUrl+self.config.apiepgnow;
							//console.log('Axled 2 Response:'+response.statusCode+response.statusMessage); 
						} else {
							Errormessage = 'Error: ' + error +' in '+myUrl+self.config.apiepgnow;
						}
						self.sendSocketNotification("DATA",['ERROR',Errormessage]);
					}
				});
				
			} else {
				if ((!error && response.statusCode == 404)||(!error && response.statusCode == 401)){//because sometimes error is null
					Errormessage = 'Error: ' + response.statusCode + response.statusMessage + ' in '+myUrl+self.apiLocations;
					//console.log('Axled 2 Response:'+response.statusCode+response.statusMessage); 
				} else {
					Errormessage = 'Error: ' + error +' in '+myUrl+self.apiLocations;
				}
				self.sendSocketNotification("DATA",['ERROR',Errormessage]);
			}
		});
	},
	*/

	getData_epgnow: function() {
		var self = this;
		var myUrl = this.config.apiBase;

		if(ref != ''){
			//1.Request - EPGNOW
			request({url: myUrl+this.config.apiepgnow+ref }, function (error, response, body) {
			
				if (!error && response.statusCode == 200) {
					json = parser.xml2json(body);
					self.sendSocketNotification("DATA",['DB-EPGNOW',json]);
				} else {
					//if (!error && response.statusCode == 404){//because sometimes error is null
					if ((!error && response.statusCode == 404)||(!error && response.statusCode == 401)){//because sometimes error is null
						Errormessage = 'Error: ' + response.statusCode + response.statusMessage + ' in '+myUrl+self.config.apiepgnow;
						//console.log('Axled 2 Response:'+response.statusCode+response.statusMessage); 
					} else {
						Errormessage = 'Error: ' + error +' in '+myUrl+self.config.apiepgnow;
					}
					self.sendSocketNotification("DATA",['ERROR',Errormessage]);
				}
			});
		} 
	},

	getData_about: function() {
		var self = this;
		var myUrl = this.config.apiBase;
		
		//2.Request - About
		request({url: myUrl+self.config.apiabout }, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				json = parser.xml2json(body);
				self.sendSocketNotification("DATA",['DB-ABOUT',json]);
			} else {
				if ((!error && response.statusCode == 404)||(!error && response.statusCode == 401)){
					Errormessage = 'Error: ' + response.statusCode + response.statusMessage + ' in '+myUrl+self.config.apiabout;
				} else {
					//Errormessage = 'Error: ' + response.statusCode + response.statusMessage + ' in '+myUrl+self.config.apiabout;
					Errormessage = 'Error: ' + error + ' in '+myUrl+self.config.apiabout;
				}
				self.sendSocketNotification("DATA",['ERROR',Errormessage]);
			}
		});
	},

	/*getData_services_old: function() {
		var self = this;
		var myUrl = this.config.apiBase;
		
		//3.Request - Services
		request({url: myUrl+this.config.apiservices }, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				json = parser.xml2json(body);
				self.sendSocketNotification("DATA",['DB-SERVICES',json]);
			} else {
				if ((!error && response.statusCode == 404)||(!error && response.statusCode == 401)){
					Errormessage = 'Error: ' + response.statusCode + response.statusMessage + ' in '+myUrl+self.config.apiservices;
				} else {
					//Errormessage = 'Error: ' + response.statusCode + response.statusMessage + ' in '+myUrl+self.config.apiservices;
					Errormessage = 'Error: ' + error + ' in '+myUrl+self.config.apiservices;
				}
				self.sendSocketNotification("DATA",['ERROR',Errormessage]);
			}
		});
	},
	*/

	getData_services: function() {
		var self = this;
		var myUrl = this.config.apiBase;
		
		//3.Request - Services
		request({url: myUrl+this.config.apiservices }, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				json = parser.xml2json(body);
				//get ref for following getData functions: epgnow und servicelistplayable
				if (Array.isArray(json.e2servicelistrecursive.e2bouquet) === true){//more than one e2bouquet
					ref = encodeURIComponent(json.e2servicelistrecursive.e2bouquet[self.config.apibouquet].e2servicereference).replace(/%26quot%3B/g,"%22");//encodeURIComponent() also encode : (colon); replace is needed for the " (quote)
				} else {//only one e2bouquet
					ref = encodeURIComponent(json.e2servicelistrecursive.e2bouquet.e2servicereference).replace(/%26quot%3B/g,"%22");//encodeURIComponent() also encode : (colon)
				}
				//console.log('Axled this.ref:',ref); 
				self.sendSocketNotification("DATA",['DB-SERVICES',json]);
			} else {
				if ((!error && response.statusCode == 404)||(!error && response.statusCode == 401)){
					Errormessage = 'Error: ' + response.statusCode + response.statusMessage + ' in '+myUrl+self.config.apiservices;
				} else {
					//Errormessage = 'Error: ' + response.statusCode + response.statusMessage + ' in '+myUrl+self.config.apiservices;
					Errormessage = 'Error: ' + error + ' in '+myUrl+self.config.apiservices;
				}
				self.sendSocketNotification("DATA",['ERROR',Errormessage]);
			}
		});
	},

	getData_timerlist: function() {
		var self = this;
		var myUrl = this.config.apiBase;
		
		//4.Request - Timerlist
		request({url: myUrl+this.config.apiTimerlist }, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				json = parser.xml2json(body);
				self.sendSocketNotification("DATA",['DB-TIMER',json]);
			} else {
				if ((!error && response.statusCode == 404)||(!error && response.statusCode == 401)){
					Errormessage = 'Error: ' + response.statusCode + response.statusMessage + ' in '+myUrl+self.config.apiTimerlist;
				} else {
					//Errormessage = 'Error: ' + response.statusCode + response.statusMessage + ' in '+myUrl+self.config.apiTimerlist;
					Errormessage = 'Error: ' + error + ' in '+myUrl+self.config.apiTimerlist;
				}
				self.sendSocketNotification("DATA",['ERROR',Errormessage]);
			}
		});
	},

	/*
	getData_servicelistplayable_old: function() {
		var self = this;
		var myUrl = this.config.apiBase;
		
		//5.Request - Servicelistplayable
		request({url: myUrl+this.config.apiServicelistplayable }, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				json = parser.xml2json(body);
				self.sendSocketNotification("DATA",['DB-SLP',json]);
			} else {
				if ((!error && response.statusCode == 404)||(!error && response.statusCode == 401)){
					Errormessage = 'Error: ' + response.statusCode + response.statusMessage + ' in '+myUrl+self.config.apiServicelistplayable;
				} else { 
					//Errormessage = 'Error: ' + response.statusCode + response.statusMessage + ' in '+myUrl+self.config.apiServicelistplayable;
					Errormessage = 'Error: ' + error + ' in '+myUrl+self.config.apiServicelistplayable;
				}
				self.sendSocketNotification("DATA",['ERROR',Errormessage]);
			}
		});
	},
	*/

	getData_servicelistplayable: function() {
		var self = this;
		var myUrl = this.config.apiBase;
		
		if(ref != ''){
			//5.Request - Servicelistplayable
			request({url: myUrl+this.config.apiServicelistplayable+ref }, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					json = parser.xml2json(body);
					self.sendSocketNotification("DATA",['DB-SLP',json]);
				} else {
					if ((!error && response.statusCode == 404)||(!error && response.statusCode == 401)){
						Errormessage = 'Error: ' + response.statusCode + response.statusMessage + ' in '+myUrl+self.config.apiServicelistplayable;
					} else { 
						//Errormessage = 'Error: ' + response.statusCode + response.statusMessage + ' in '+myUrl+self.config.apiServicelistplayable;
						Errormessage = 'Error: ' + error + ' in '+myUrl+self.config.apiServicelistplayable;
					}
					self.sendSocketNotification("DATA",['ERROR',Errormessage]);
				}
			});
		}
	},

	getData_Recordings: function() {
		var self = this;
		var myUrl = this.config.apiBase;
		var apiLocations = this.config.apiLocations;
		var apiRecordingsID = this.config.apiRecordingsID;
		var apiMovielist = this.config.apiMovielist;
		// About
		this.getData_about();

		//1.Request - Locations
		request({url: myUrl+apiLocations }, (error, response, body) => {
			if (!error && response.statusCode == 200) {	//if response is ok, then get movies in directory
				json = parser.xml2json(body);
				//console.log('Axled JSON:',json.e2locations.e2location[apiRecordingsID]);
				dirname = json.e2locations.e2location[apiRecordingsID];

				request({url: myUrl+apiMovielist+dirname }, function (error, response, body) { 
					if (!error && response.statusCode == 200) { // list recordings of folder xy
						json = parser.xml2json(body);
						//self.sendSocketNotification("DATA",['DB-RECORDINGS',body,dirname]);
						self.sendSocketNotification("DATA",['DB-RECORDINGS',json,dirname]);//send data in json-format to module.js
					} else {
						if ((!error && response.statusCode == 404)||(!error && response.statusCode == 401)){//because sometimes error is null
							Errormessage = 'Error: ' + response.statusCode + response.statusMessage + ' in '+myUrl+apiMovielist+dirname;
							//console.log('Axled 2 Response:'+response.statusCode+response.statusMessage); 
						} else {
							Errormessage = 'Error: ' + error +' in '+myUrl+apiMovielist+dirname;
						}
						self.sendSocketNotification("DATA",['ERROR',Errormessage]);
					}
				});
			} else {
				if ((!error && response.statusCode == 404)||(!error && response.statusCode == 401)){//because sometimes error is null
					Errormessage = 'Error: ' + response.statusCode + response.statusMessage + ' in '+myUrl+self.apiLocations;
					//console.log('Axled 2 Response:'+response.statusCode+response.statusMessage); 
				} else {
					Errormessage = 'Error: ' + error +' in '+myUrl+self.apiLocations;
				}
				self.sendSocketNotification("DATA",['ERROR',Errormessage]);
			}
		});

	},

});