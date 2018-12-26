# MMM-Dreambox
A module to connect a Dreambox or a Enigma2 Receiver (like VU or VU+) to MagicMirror.

## Installing the module
Clone this repository in your `~/MagicMirror/modules/` folder `( $ cd ~MagicMirror/modules/ )`:
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
			<td>Additional string to apiBase pointing to the xml file of your Dreambox where some <code>about</code> datas can be found. Test if [http://Ipofyourdreambox:port/web/about](http://Ipofyourdreambox:port/web/about) shows xml datas in a browser within the same network of your Dreambox.</td>
		</tr>
		<tr>
			<td><code>apiservices</code></td>
			<td>Additional string to apiBase pointing to the xml file of your Dreambox where some <code>getallservices</code> datas can be found. Test if http://Ipofyourdreambox:port/web/getallservices shows xml datas in a browser within the same network of your Dreambox.</td>
		</tr>
		<tr>
			<td><code>apiepgnow</code></td>
			<td>Additional string to apiBase pointing to the xml file of your Dreambox where some <code>epgnow</code> datas can be found. Test if http://Ipofyourdreambox:port/web/epgnow?bRef=1%3A7%3A1%3A0%3A0%3A0%3A0%3A0%3A0%3A0%3AFROM%20BOUQUET%20%22userbouquet.favourites.tv%22%20ORDER%20BY%20bouquet shows xml datas in a browser within the same network of your Dreambox. Everything behind bRef= depends on your individual Dreambox settings and can be different from this datas.</td>
		</tr>
		<tr>
			<td><code>apizap</code></td>
			<td>Additional string to apiBase pointing to the xml file of your Dreambox where some <code>Zap</code> datas can be send. Test if http://Ipofyourdreambox:port/web/zap?sRef=[Servicename] shows xml datas in a browser within the same network of your Dreambox.</td>
		</tr>
		<tr>
			<td><code>apiTimerlist</code></td>
			<td>Additional string to apiBase pointing to the xml file of your Dreambox where some <code>Timer</code> datas can be found. Test if http://Ipofyourdreambox:port/web/timerlist shows xml datas in a browser within the same network of your Dreambox.</td>
		</tr>
		<tr>
			<td><code>apiServicelistplayable</code></td>
			<td>Additional string to apiBase pointing to the xml file of your Dreambox where some <code>Servicelistplayable</code> datas can be found. Test if http://Ipofyourdreambox:port/web/servicelistplayable?sRef=1%3A7%3A1%3A0%3A0%3A0%3A0%3A0%3A0%3A0%3AFROM%20BOUQUET%20%22userbouquet.favourites.tv%22%20ORDER%20BY%20bouquet shows xml datas in a browser within the same network of your Dreambox. Everything behind sRef= depends on your individual Dreambox settings and can be different from this datas.</td>
		</tr>
   </table>

   ## Further options
   You can communication with this module also by sending notifications.
   Examples:
   <code>yourmmip:8080/remote?action=NOTIFICATION&notification=CCW</code> emulates turning rotary counterclockwise
   <code>yourmmip:8080/remote?action=NOTIFICATION&notification=CW</code> emulates turning rotary clockwise
   <code>yourmmip:8080/remote?action=NOTIFICATION&notification=PRESSED</code> emulates pressing rotary encoder

   ## Version
   1.0 initial release
