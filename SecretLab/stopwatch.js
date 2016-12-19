/*==================================================

Created by Alan Wolfe
lab{at}demofox.org
http://demofox.org

October 2011

==================================================*/

var g_workerThread = null;
var g_threadStarted = false;

function ToggleStartStop()
{
	var button = document.getElementById('StartStopButton');

	g_threadStarted = !g_threadStarted;
	if(g_threadStarted)
	{
		g_workerThread.postMessage({'msg':'start',
									'yieldms':document.getElementById('YieldMS').value});
		button.innerHTML = "Stop";
	}
	else
	{
		g_workerThread.postMessage({'msg':'stop'});
		button.innerHTML = "Start";
	}
}

function ResetTimer()
{
	g_workerThread.postMessage({'msg':'reset'});
}

function TestLatency()
{
	var div = document.getElementById('RoundTripTime');			
	div.innerHTML = "Round trip in progress...";
	g_workerThread.postMessage({'msg':'testlatency','time0': new Date().getTime()});
}

function onPageLoaded()
{
	//if web workers are supported, set them up
	if(typeof(Worker) !== "undefined")
	{
		//create the worker thread
		g_workerThread= new Worker("stopwatchthread.js");

		//handle messages from worker thread
		g_workerThread.onmessage = function (event)
		{
			if(event.data.time0 != null)
			{
				var div = document.getElementById('RoundTripTime');				
				var time2 = new Date().getTime();
				var time1 = event.data.time1;
				var time0 = event.data.time0;

				div.innerHTML = (time1 - time0) + "ms from main to worker, " + (time2-time1) + "ms from worker back to main,  " + (time2 - time0) + "ms total round trip message time."
			}
			else
			{
				var div = document.getElementById('Time');				
				div.innerHTML = event.data;
			}
		};      

		//handle errors from worker thread
		g_workerThread.onerror = function(e)
		{
			alert('Error in thread: Line ' + e.lineno + ' in ' + e.filename + ': ' + e.message);
		};		

		//create the controls
		var MainHTML = document.getElementById('MainHTML');
		if(MainHTML)
		{
			var newDiv;
			var newInput;
			var newText;
			var newButton

			//create the loadtext text
			newDiv = document.createElement('div');
			newDiv.setAttribute('ID', 'Time');
			newDiv.innerHTML = "0";
			MainHTML.appendChild(newDiv);
			MainHTML.appendChild(document.createElement('br'));

			//create the start/stop, reset and latency test buttons
			newButton = document.createElement('button');
			newButton.setAttribute('ID', 'StartStopButton');
			newButton.innerHTML = "Start";
			newButton.setAttribute('onClick', 'ToggleStartStop();');
			MainHTML.appendChild(newButton);

			newButton = document.createElement('button');
			newButton.innerHTML = "Reset";
			newButton.setAttribute('onClick', 'ResetTimer();');
			MainHTML.appendChild(newButton);			

			newButton = document.createElement('button');
			newButton.innerHTML = "Test web worker message latency";
			newButton.setAttribute('onClick', 'TestLatency();');
			MainHTML.appendChild(newButton);					

			MainHTML.appendChild(document.createElement('br'));
			MainHTML.appendChild(document.createElement('br'));
			newText = document.createTextNode("Timer thread yield ms (restart timer to apply this setting): ");
			MainHTML.appendChild(newText);   			
			newInput = document.createElement('input');
			newInput.value="1";
			newInput.setAttribute('ID', 'YieldMS');
			MainHTML.appendChild(newInput);
			MainHTML.appendChild(document.createElement('br'));
			MainHTML.appendChild(document.createElement('br'));

			//create the latency text
			newDiv = document.createElement('div');
			newDiv.setAttribute('ID', 'RoundTripTime');
			MainHTML.appendChild(newDiv);
		}

		//post a reset message to start things off
		g_workerThread.postMessage("reset");
	}
	else
	{
		alert("Your browser doesn't support web workers.  You might try chrome (recomended) or firefox instead.");
	}
}



//hook up our event listener
window.addEventListener('load', function(){onPageLoaded();}, false);