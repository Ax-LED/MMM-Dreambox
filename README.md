# MMM-Dreambox
A module to connect a Dreambox or a Enigma2 Receiver (like VU or VU+) to MagicMirror. You can select services of your dreambox and stream them via omxplayer. The module shows some further informations like:
- model of your dreambox
- which service is tuned right now / are there active timer
- epg for the services with its starting time

![Magic-Mirror Module MMM-Dreambox screenshot1](https://raw.githubusercontent.com/Ax-LED/MMM-Dreambox/master/MMM-Dreambox_screenshot1.jpg)

## Requirements
<b>omxplayer:</b> Omxplayer is normally already installed on raspbian. You can check it by commmanline ````which omxplayer````. The result should be a path like ````/usr/bin/omxplayer````.
<b>MPG2 Codec</b>: On my Dreambox (dm800se) for streaming HD stations the mpg2 codec was necessary. You can check this by commandline ````vcgencmd codec_enabled MPG2````. The result can either be ````MPG2=enabled```` or ````MPG2=disabled````. If case "disabled" and if you want to stream mpg2 you have to buy a codec on [http://www.raspberrypi.com/mpeg-2-license-key/](http://www.raspberrypi.com/mpeg-2-license-key/).

## Installing the module
Clone this repository in your `~/MagicMirror/modules/` folder `( $ cd ~/MagicMirror/modules/ )`:
````javascript
git clone https://github.com/Ax-LED/MMM-Dreambox
````

## Using the module

To use this module, add it to the modules array in the `config/config.js` file:
````javascript
{
			module: 'MMM-Dreambox',
			header: 'Dreambox',
			position: 'top_left',
			config: {
				apiBase: 'http://Ipofyourdreambox:port',
				refreshInterval: 1000 * 30, //refresh every 30 seconds
				apiabout: '/web/about',
				apiservices: '/web/getallservices',
				apiepgnow: '/web/epgnow?bRef=1%3A7%3A1%3A0%3A0%3A0%3A0%3A0%3A0%3A0%3AFROM%20BOUQUET%20%22userbouquet.favourites.tv%22%20ORDER%20BY%20bouquet',
				apizap: '/web/zap?sRef=',
				apiTimerlist: '/web/timerlist',
				apiServicelistplayable: '/web/servicelistplayable?sRef=1%3A7%3A1%3A0%3A0%3A0%3A0%3A0%3A0%3A0%3AFROM%20BOUQUET%20%22userbouquet.favourites.tv%22%20ORDER%20BY%20bouquet'
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
			<td><code>refreshInterval</code></td>
			<td>How often should the datas be refreshed.</td>
		</tr>
		<tr>
			<td><code>apiabout</code></td>
			<td>Additional string to apiBase pointing to the xml file of your Dreambox where some <code>about</code> datas can be found. Test if [http://Ipofyourdreambox:port/web/about] shows xml datas in a browser within the same network of your Dreambox.</td>
		</tr>
		<tr>
			<td><code>apiservices</code></td>
			<td>Additional string to apiBase pointing to the xml file of your Dreambox where some <code>getallservices</code> datas can be found. Test if [http://Ipofyourdreambox:port/web/getallservices] shows xml datas in a browser within the same network of your Dreambox.</td>
		</tr>
		<tr>
			<td><code>apiepgnow</code></td>
			<td>Additional string to apiBase pointing to the xml file of your Dreambox where some <code>epgnow</code> datas can be found. Test if [http://Ipofyourdreambox:port/web/epgnow?bRef=1%3A7%3A1%3A0%3A0%3A0%3A0%3A0%3A0%3A0%3AFROM%20BOUQUET%20%22userbouquet.favourites.tv%22%20ORDER%20BY%20bouquet] shows xml datas in a browser within the same network of your Dreambox. Everything behind bRef= depends on your individual Dreambox settings and can be different from this datas.</td>
		</tr>
		<tr>
			<td><code>apizap</code></td>
			<td>Additional string to apiBase pointing to the xml file of your Dreambox where some <code>Zap</code> datas can be send. Test if [http://Ipofyourdreambox:port/web/zap?sRef=[Servicename]] shows xml datas in a browser within the same network of your Dreambox.</td>
		</tr>
		<tr>
			<td><code>apiTimerlist</code></td>
			<td>Additional string to apiBase pointing to the xml file of your Dreambox where some <code>Timer</code> datas can be found. Test if [http://Ipofyourdreambox:port/web/timerlist] shows xml datas in a browser within the same network of your Dreambox.</td>
		</tr>
		<tr>
			<td><code>apiServicelistplayable</code></td>
			<td>Additional string to apiBase pointing to the xml file of your Dreambox where some <code>Servicelistplayable</code> datas can be found. Test if [http://Ipofyourdreambox:port/web/servicelistplayable?sRef=1%3A7%3A1%3A0%3A0%3A0%3A0%3A0%3A0%3A0%3AFROM%20BOUQUET%20%22userbouquet.favourites.tv%22%20ORDER%20BY%20bouquet] shows xml datas in a browser within the same network of your Dreambox. Everything behind sRef= depends on your individual Dreambox settings and can be different from this datas.</td>
		</tr>
   </table>

   ## Further options
   You can communication with this module also by sending notifications.
   <br>Examples:
   - <code>yourmmip:8080/remote?action=NOTIFICATION&notification=DB-SERVICE-NEXT</code> selects the next service in your list
   - <code>yourmmip:8080/remote?action=NOTIFICATION&notification=DB-SERVICE-PREV</code> selects the previous service in your list
   - <code>yourmmip:8080/remote?action=NOTIFICATION&notification=DB-PLAY</code> starts streaming the selected service with omxplayer
   - <code>yourmmip:8080/remote?action=NOTIFICATION&notification=DB-STOP</code> stops streaming and quiting omxplayer

   ## Version
   1.0 initial release
