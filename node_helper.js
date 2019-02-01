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

var body_about = '';
var body_services = '';
var body_epgnow = '';
var Errormessage = '';

module.exports = NodeHelper.create({

	start: function() {
		this.started = false;
		this.config = null;
	},

	socketNotificationReceived: function(notification, payload) {
		var self = this;
		if (notification === 'CONFIG' && self.started == false) {
			self.config = payload;
			self.sendSocketNotification("STARTED", true);
			self.getData2();//Inittal Dataload before timer interval is activated
			//self.started = true; //AxLED: if this line is active, Browserrefresh F5 does not work
			console.log("Starting node helper for: " + self.name);
		} 

		if (notification === "DB-PLAY") {
			if (payload[1] === 'zap') {
				var myUrl = this.config.apiBase;
				request({url: myUrl+this.config.apizap+payload[0] }, function (error, response, body) {
					if (!error && response.statusCode == 200) {
						//exec('omxplayer --win 320,180,1600,900 -o both '+self.config.apiBase+':8001/'+payload[0], null);//without --live buffering works
						exec('omxplayer '+self.config.omxargs+self.config.apiBase+':8001/'+payload[0], null);//without '--live' buffering works
					}
				});
			} else {
				//exec('omxplayer --win 320,180,1600,900 -o both '+self.config.apiBase+':8001/'+payload[0], null);//without '--live' buffering works
				exec('omxplayer '+self.config.omxargs+self.config.apiBase+':8001/'+payload[0], null);//without --live buffering works
			}
			self.getData2();
		}

		if (notification === "DB-STOP") {
			exec('pkill omxplayer', null);
		}

		if (notification === "FETCH_DATA") {
			self.getData2();
		}
	},

	getData2: function() {
		var self = this;
		var myUrl = this.config.apiBase;
		
		//1.Request - EPGNOW
		request({url: myUrl+this.config.apiepgnow }, function (error, response, body) {
		
			if (!error && response.statusCode == 200) {
				//body_epgnow = body;
				self.sendSocketNotification("DATA",['DB-EPGNOW',body]);
			} else {
				if (!error && response.statusCode == 404){//because sometimes error is null
					Errormessage = 'Error: ' + response.statusCode + response.statusMessage + ' in '+myUrl+self.config.apiepgnow;
				} else {
					//Errormessage = 'Error: ' + response.statusCode + response.statusMessage + ' in '+myUrl+self.config.apiepgnow;
					Errormessage = 'Error: ';
				}
				self.sendSocketNotification("DATA",['ERROR',Errormessage]);
			}
		});
		//2.Request - About
		request({url: myUrl+self.config.apiabout }, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				//body_about = body;
				self.sendSocketNotification("DATA",['DB-ABOUT',body]);
			} else {
				if (!error && response.statusCode == 404){
					Errormessage = 'Error: ' + response.statusCode + response.statusMessage + ' in '+myUrl+self.config.apiabout;
				} else {
					//Errormessage = 'Error: ' + response.statusCode + response.statusMessage + ' in '+myUrl+self.config.apiabout;
					Errormessage = 'Error: ';
				}
				self.sendSocketNotification("DATA",['ERROR',Errormessage]);
			}
		});
		//3.Request - Services
		request({url: myUrl+this.config.apiservices }, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				//body_services = body;
				self.sendSocketNotification("DATA",['DB-SERVICES',body]);
			} else {
				if (!error && response.statusCode == 404){
					Errormessage = 'Error: ' + response.statusCode + response.statusMessage + ' in '+myUrl+self.config.apiservices;
				} else {
					//Errormessage = 'Error: ' + response.statusCode + response.statusMessage + ' in '+myUrl+self.config.apiservices;
					Errormessage = 'Error: ';
				}
				self.sendSocketNotification("DATA",['ERROR',Errormessage]);
			}
		});
		//4.Request - Timerlist
		request({url: myUrl+this.config.apiTimerlist }, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				self.sendSocketNotification("DATA",['DB-TIMER',body]);
			} else {
				if (!error && response.statusCode == 404){
					Errormessage = 'Error: ' + response.statusCode + response.statusMessage + ' in '+myUrl+self.config.apiTimerlist;
				} else {
					//Errormessage = 'Error: ' + response.statusCode + response.statusMessage + ' in '+myUrl+self.config.apiTimerlist;
					Errormessage = 'Error: ';
				}
				self.sendSocketNotification("DATA",['ERROR',Errormessage]);
			}
		});
		//5.Request - Servicelistplayable
		request({url: myUrl+this.config.apiServicelistplayable }, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				self.sendSocketNotification("DATA",['DB-SLP',body]);
			} else {
				if (!error && response.statusCode == 404){
					Errormessage = 'Error: ' + response.statusCode + response.statusMessage + ' in '+myUrl+self.config.apiServicelistplayable;
				} else { 
					//Errormessage = 'Error: ' + response.statusCode + response.statusMessage + ' in '+myUrl+self.config.apiServicelistplayable;
					Errormessage = 'Error: ';
				}
				self.sendSocketNotification("DATA",['ERROR',Errormessage]);
			}
		});

	},

});