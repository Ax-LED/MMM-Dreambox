# MMM-Dreambox
A module to connect a Dreambox or a Enigma2 Receiver (like VU or VU+) to MagicMirror. You can select services of your dreambox and stream them via omxplayer. The module shows some further informations like:
- model of your dreambox
- which service is tuned right now / are there active timer
- epg for the services with its starting time

![Magic-Mirror Module MMM-Dreambox screenshot1](https://raw.githubusercontent.com/Ax-LED/MMM-Dreambox/master/MMM-Dreambox_screenshot1.jpg)

## Requirements
<b>omxplayer:</b> Omxplayer is normally already installed on raspbian. You can check it by commmanline ````which omxplayer````. The result should be a path like ````/usr/bin/omxplayer````.
<br>
<b>MPG2 Codec</b>: On my Dreambox (dm800se) for streaming HD stations the mpg2 codec was necessary. You can check this by commandline ````vcgencmd codec_enabled MPG2````. The result can either be ````MPG2=enabled```` or ````MPG2=disabled````. If case "disabled" and if you want to stream mpg2 you have to buy a codec on [http://www.raspberrypi.com/mpeg-2-license-key/](http://www.raspberrypi.com/mpeg-2-license-key/).
<br>
<b>MMM-Remote-Control:</b> [MMM-Remote-Control](https://github.com/Jopyth/MMM-Remote-Control) is required, if you want to use the sample links for communication, as mentioned at the end of this file.
<br>
<b>Enigma2 Receiver (Dreambox / VU+):</b> 
- Make sure in settings (Extensions -> Webinterface) the value ````Enable HTTP Authentication```` is set to ````no````, otherwise you will get the error ````401 Unauthorized````.
- Make sure your receiver is switched ````on````, ````standby```` and ````deep standby```` wont work, as the webinterface is down in this modes.

## Installing the module
Clone this repository in your `~/MagicMirror/modules/` folder `( $ cd ~/MagicMirror/modules/ )`:
````javascript
git clone https://github.com/Ax-LED/MMM-Dreambox
````

## Using the module

To use this module, add it to the modules array in the `config/config.js` file:
<br>
<b>Minimum Configuration:</b>
````javascript
{
			module: 'MMM-Dreambox',
			header: 'Dreambox',
			position: 'top_left',
			config: {
				apiBase: 'http://Ipofyourdreambox:port',
				omxargs: ' --win 320,180,1600,900 -o both ',
				refreshInterval: 1000 * 30, //refresh every 30 seconds
				apibouquet: 0, //bouquet, if there is more than one under apiservices (/web/getallservices), important apiepgnow and apiServicelistplayable have to match to the selected bouquet
				apiRecordingsID: 0, //which recording folder should be listed
				listmax: 10
			}
		},
````
<b>Advanced Configuration:</b>
````javascript
{
			module: 'MMM-Dreambox',
			header: 'Dreambox',
			position: 'top_left',
			config: {
				apiBase: 'http://Ipofyourdreambox:port',
				omxargs: ' --win 320,180,1600,900 -o both ',
				refreshInterval: 1000 * 30, //refresh every 30 seconds
				apibouquet: 0, //bouquet, if there is more than one under apiservices (/web/getallservices), important apiepgnow and apiServicelistplayable have to match to the selected bouquet
				apiRecordingsID: 0, //which recording folder should be listed
				listmax: 10,
				apiabout: '/web/about',
				apiservices: '/web/getallservices',
				apiepgnow: '/web/epgnow?bRef=',
				apizap: '/web/zap?sRef=',
				apiTimerlist: '/web/timerlist',
				apiServicelistplayable: '/web/servicelistplayable?sRef=',
				apiLocations: '/web/getlocations', //where are the recording folders listed
				apiMovielist: '/web/movielist?dirname=' //link for opening recording folder and list recordings
			}
		},
````
## Configuration options

The following properties can be configured:


<table width="100%">
	<thead>
		<tr>
			<th>Option</th>
			<th width="100%">Description</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td><code>apiBase</code></td>
			<td>URL and port of your Dreambox or Enigma2 Receiver.</td>
		</tr>
		<tr>
			<td><code>omxargs</code></td>
			<td>Arguments for the omxplayer, like <code>' --win 320,180,1600,900  -o both '</code>. Attention, <b>leading</b> and <b>last</b> blanks are required.</td>
		</tr>
		<tr>
			<td><code>refreshInterval</code></td>
			<td>How often should the datas be refreshed.</td>
		</tr>
		<tr>
			<td><code>apibouquet</code></td>
			<td>Optional: Bouquet, if there is more than one more bouquet under apiservices (/web/getallservices). Important <code>apiepgnow</code> and <code>apiServicelistplayable</code> have to match to the selected bouquet.<br>Default value: <code>0</code>
			</td>
		</tr>
		<tr>
			<td><code>apiRecordingsID</code></td>
			<td>Optional: Index of folder for recordings. Can be checked under apiservices (/web/getlocations).<br>Default value: <code>0</code>
			</td>
		</tr>
		<tr>
			<td><code>listmax</code></td>
			<td>How many entries of your services should be listed. If your reach the first or the last entry, it will loop through your services or recordings.</td>
		</tr>
		<tr>
			<td><code>apiabout</code></td>
			<td>Additional string to apiBase pointing to the xml file of your Dreambox where some <code>about</code> datas can be found. Test if [http://Ipofyourdreambox:port/web/about] shows xml datas in a browser within the same network of your Dreambox.<br>Default value: <code>'/web/about'</code></td>
		</tr>
		<tr>
			<td><code>apiservices</code></td>
			<td>Additional string to apiBase pointing to the xml file of your Dreambox where some <code>getallservices</code> datas can be found. Test if [http://Ipofyourdreambox:port/web/getallservices] shows xml datas in a browser within the same network of your Dreambox.<br>Default value: <code>'/web/getallservices'</code></td>
		</tr>
		<tr>
			<td><code>apiepgnow</code></td>
			<td>Additional string to apiBase pointing to the xml file of your Dreambox where some <code>epgnow</code> datas can be found. Test if [http://Ipofyourdreambox:port/web/epgnow?bRef=1%3A7%3A1%3A0%3A0%3A0%3A0%3A0%3A0%3A0%3AFROM%20BOUQUET%20%22userbouquet.favourites.tv%22%20ORDER%20BY%20bouquet] shows xml datas in a browser within the same network of your Dreambox. Everything behind bRef= depends on your individual Dreambox settings and will be completed by <code>'apibouquet</code>.<br>Default value: <code>'/web/epgnow?bRef='</code></td>
		</tr>
		<tr>
			<td><code>apizap</code></td>
			<td>Additional string to apiBase pointing to the xml file of your Dreambox where some <code>Zap</code> datas can be send. Test if [http://Ipofyourdreambox:port/web/zap?sRef=[Servicename]] shows xml datas in a browser within the same network of your Dreambox.<br>Default value: <code>'/web/zap?sRef='</code></td>
		</tr>
		<tr>
			<td><code>apiTimerlist</code></td>
			<td>Additional string to apiBase pointing to the xml file of your Dreambox where some <code>Timer</code> datas can be found. Test if [http://Ipofyourdreambox:port/web/timerlist] shows xml datas in a browser within the same network of your Dreambox.<br>Default value: <code>'/web/timerlist'</code></td>
		</tr>
		<tr>
			<td><code>apiServicelistplayable</code></td>
			<td>Additional string to apiBase pointing to the xml file of your Dreambox where some <code>Servicelistplayable</code> datas can be found. Test if [http://Ipofyourdreambox:port/web/servicelistplayable?sRef=1%3A7%3A1%3A0%3A0%3A0%3A0%3A0%3A0%3A0%3AFROM%20BOUQUET%20%22userbouquet.favourites.tv%22%20ORDER%20BY%20bouquet] shows xml datas in a browser within the same network of your Dreambox. Everything behind sRef= depends on your individual Dreambox settings and will be completed by <code>apibouquet</code>.<br>Default value: <code>'/web/servicelistplayable?sRef='</code></td>
		</tr>
		<tr>
			<td><code>apiLocations</code></td>
			<td>Additional string to apiBase pointing to the xml file of your Dreambox where some <code>Recording</code> datas can be found. Test if [http://Ipofyourdreambox:port/web/getlocations] shows xml datas in a browser within the same network of your Dreambox.<br>Default value: <code>'/web/getlocations'</code></td>
		</tr>
		<tr>
			<td><code>apiMovielist</code></td>
			<td>Additional string to apiBase pointing to the xml file of your Dreambox where some <code>Recording</code> datas can be found. Test if [http://Ipofyourdreambox:port/web/movielist?dirname=] shows xml datas in a browser within the same network of your Dreambox.<br>Everything behind dirname= depends on your individual Dreambox settings and will be completed by <code>apiRecordingsID</code><br>Default value: <code>'/web/movielist?dirname='</code>
			</td>
		</tr>
   </table>

   ## Further options
   You can communication with this module also by sending notifications.
   <br>Examples:
   - <code>yourmmip:8080/remote?action=NOTIFICATION&notification=DB-SERVICE-NEXT</code> selects the next service in your list
   - <code>yourmmip:8080/remote?action=NOTIFICATION&notification=DB-SERVICE-PREV</code> selects the previous service in your list
   - <code>yourmmip:8080/remote?action=NOTIFICATION&notification=DB-PLAY</code> starts streaming the selected service with omxplayer
   - <code>yourmmip:8080/remote?action=NOTIFICATION&notification=DB-STOP</code> stops streaming and quiting omxplayer
   
   To use this examples the module [MMM-Remote-Control](https://github.com/Jopyth/MMM-Remote-Control) is required.

   ## Version
   1.0 initial release
