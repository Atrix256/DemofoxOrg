/*==================================================

Created by Alan Wolfe
jsraytrace{at}demofox.org
http://demofox.org

October 2011

==================================================*/

var g_FPSframeCount = 0;
var g_currentFrame = 0;
var g_currentMS = 0;
var g_startMS = 0;

function updateWrapper()
{
  //call the update
  update();

  //increment how many frames we've displayed
  g_FPSframeCount++;
  g_currentFrame++;

  //set our next timeout
  setTimeout("updateWrapper()",1);

  g_currentMS = new Date().getTime() - g_startMS;
}

function UpdateFPSDisplay()
{
  //update our fps text if we can
  var FPSText = document.getElementById('FPSText');
  if(FPSText)
  {
    //calculate frame count, set text, and reset the frame count
    var fps = g_FPSframeCount / 2;
    FPSText.innerHTML = "FPS: " + fps.toPrecision(3) + "(" + (1000/fps).toPrecision(4) + " ms)";
    g_FPSframeCount = 0;

    //set the time for when we should next display the FPS display
    setTimeout("UpdateFPSDisplay()",2000);      
  }
}

function initWrapper()
{
  //create and update our fps display
  var MainHTML = document.getElementById('MainHTML');
  if(MainHTML)
  {
    var newDiv = document.createElement('div');
    newDiv.setAttribute('ID', 'FPSText');
    MainHTML.appendChild(newDiv);
  }
  UpdateFPSDisplay();

  //call the scripts init
  var initResult = init();

  g_startMS = new Date().getTime();

  //return whether init was successful or not
  return initResult;
}

function onPageLoaded()
{
  // Get a reference to the element.
  g_elem = document.getElementById('MainCanvas');

  // Always check for properties and methods, to make sure your code doesn't break 
  // in other browsers.
  if (g_elem)
  {
    if(g_elem.getContext)
    {
      // Get the 2d context.
      // Remember: you can only initialize one context per element.
      g_context = g_elem.getContext('2d');
      if (g_context)
      {
        //call init
        if(initWrapper())
        {
          //call the first update, which will start the update chain
          updateWrapper();
        }
      }
      else
      {
      	alert("Could not get html5 2d context, your browser doesn't support it!");
      }
    }
    else
    {
      alert("The getContext function was missing, your browser doesn't support it!"); 
    }
  }
  else
  {
    alert("Could not get element");	
  }
}

//hook up our event listener
window.addEventListener('load', function(){onPageLoaded();}, false);