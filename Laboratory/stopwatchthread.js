/*==================================================

Created by Alan Wolfe
lab{at}demofox.org
http://demofox.org

October 2011

==================================================*/

var g_shouldContinue = false;
var g_timeBucket = 0;
var g_lastTime = 0;
var g_yieldMS = 1;

//handle messages from main thread
this.onmessage = function (event)
{
	if(event.data.msg == "testlatency")
	{
		postMessage({'time0' : event.data.time0,
					 'time1' : new Date().getTime()});
	}
	if(event.data.msg == "start")
	{
		g_yieldMS = event.data.yieldms;
		g_shouldContinue = true;
		g_lastTime = new Date().getTime();
		keepTime();
	}
	if(event.data.msg == "stop")
	{
		g_shouldContinue = false;
	}	
	if(event.data.msg == "reset")
	{
		g_timeBucket = 0;
		reportTime();
	}
}

//reports the time bucket back to the main thread
function reportTime()
{
	postMessage(g_timeBucket / 1000);
}

//this updates the time
function keepTime()
{
	//calculate our new time and tell the main thread about it
	var newTime = new Date().getTime();
	if(newTime != g_lastTime)
	{
		g_timeBucket += newTime - g_lastTime;
		g_lastTime = newTime;

		reportTime();
	}

	//if we should continue, do so, but yield the thread (hopefully this yields so new messages can come in!)
	if(g_shouldContinue)
	{
		setTimeout("keepTime()",g_yieldMS);
	}
}