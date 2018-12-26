//'use strict';

/* Magic Mirror
 * Module: MMM-Dreambox
 *
 * By AxLED
 * MIT Licensed.
 */

const NodeHelper = require('node_helper');
//var request = require('request');
const request = require('request');
const exec = require("child_process").exec;
//var moment = require('moment');
var body_about = '';
var body_services = '';
var body_epgnow = '';
var Errormessage = '';

module.exports = NodeHelper.create({

	start: function() {
		this.started = false;
		this.config = null;
		//console.log('Axled Startfunction node_helper');
	},

	socketNotificationReceived: function(notification, payload) {
		var self = this;
		if (notification === 'CONFIG' && self.started == false) {
			self.config = payload;
			self.sendSocketNotification("STARTED", true);
			self.getData2();//Inittal Dataload before timer interval is activated
			//self.started = true; //AxKED: Wenn die Zeile nicht auskommentiert ist, dann geht im Browser F5 refresh nicht..
			console.log("Starting node helper for: " + self.name);
		} 

		if (notification === "DB-PLAY") {
			var myUrl = this.config.apiBase;
			request({url: myUrl+this.config.apizap+payload }, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					//http://dm800se.fritz.box:8001/1:0:1:D176:2718:F001:FFFF0000:0:0:0:
					//omx.play("modules/MMM-Podcast/video.mp4");
					//exec('omxplayer --live --win 320,180,1600,900 -o hdmi '+self.config.apiBase+':8001/'+payload, null);
					//exec('curl http://dm800se.fritz.box/web/remotecontrol?command=352',null);//send remote control Button "OK", because of question while zapping when somebody watches recorded movies meanwhile
					exec('omxplayer --win 320,180,1600,900 -o hdmi '+self.config.apiBase+':8001/'+payload, null);//without --live buffering works
					self.getData2();
				}
			});
		}

		if (notification === "DB-PLAY1") {
			if (payload[1] === 'zap') {
				console.log('Axled payload enthält zap');
				var myUrl = this.config.apiBase;
				request({url: myUrl+this.config.apizap+payload[0] }, function (error, response, body) {
					if (!error && response.statusCode == 200) {
						//http://dm800se.fritz.box:8001/1:0:1:D176:2718:F001:FFFF0000:0:0:0:
						//omx.play("modules/MMM-Podcast/video.mp4");
						//exec('omxplayer --live --win 320,180,1600,900 -o hdmi '+self.config.apiBase+':8001/'+payload, null);
						//exec('curl http://dm800se.fritz.box/web/remotecontrol?command=352',null);//send remote control Button "OK", because of question while zapping when somebody watches recorded movies meanwhile
						exec('omxplayer --win 320,180,1600,900 -o hdmi '+self.config.apiBase+':8001/'+payload[0], null);//without --live buffering works
					}
				});
			} else {
				console.log('Axled payload enthält kein zap');
				exec('omxplayer --win 320,180,1600,900 -o hdmi '+self.config.apiBase+':8001/'+payload[0], null);//without --live buffering works
			}
			self.getData2();
		}

		if (notification === "DB-STOP") {
			console.log('Axled: test');
			exec('pkill omxplayer', null);
		}

		if (notification === "FETCH_DATA") {
			//console.log('AxLed getdata2 aufgerufen.');
			self.getData2();
		}
	},

	getData2: function() {
		var self = this;
		var myUrl = this.config.apiBase;
		
		//1.Request - EPGNOW
		request({url: myUrl+this.config.apiepgnow }, function (error, response, body) {
		
			if (!error && response.statusCode == 200) {
				body_epgnow = body;
				self.sendSocketNotification("DATA",['DB-EPGNOW',body_epgnow]);
			} else {
				Errormessage = 'MMM-Dreambox Error '+error.code+' in '+myUrl+self.config.apiepgnow;
				self.sendSocketNotification("DATA",['ERROR',Errormessage]);
			}
		});
		//2.Request - About
		request({url: myUrl+self.config.apiabout }, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				body_about = body;
				self.sendSocketNotification("DATA",['DB-ABOUT',body_about]);
			} else {
				Errormessage = 'MMM-Dreambox Error '+error.code+' in '+myUrl+self.config.apiabout;
				self.sendSocketNotification("DATA",['ERROR',Errormessage]);
			}
		});
		//3.Request - Services
		request({url: myUrl+this.config.apiservices }, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				body_services = body;
				self.sendSocketNotification("DATA",['DB-SERVICES',body_services]);
			} else {
				Errormessage = 'MMM-Dreambox Error '+error.code+' in '+myUrl+self.config.apiservices;
				self.sendSocketNotification("DATA",['ERROR',Errormessage]);
			}
		});
		//4.Request - Timerlist
		request({url: myUrl+this.config.apiTimerlist }, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				//body_services = body;
				self.sendSocketNotification("DATA",['DB-TIMER',body]);
			} else {
				Errormessage = 'MMM-Dreambox Error '+error.code+' in '+myUrl+self.config.apiservices;
				self.sendSocketNotification("DATA",['ERROR',Errormessage]);
			}
		});
		//5.Request - Servicelistplayable
		request({url: myUrl+this.config.apiServicelistplayable }, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				self.sendSocketNotification("DATA",['DB-SLP',body]);
			} else {
				Errormessage = 'MMM-Dreambox Error '+error.code+' in '+myUrl+self.config.apiservices;
				self.sendSocketNotification("DATA",['ERROR',Errormessage]);
			}
		});

	},

});