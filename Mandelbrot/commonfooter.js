/*==================================================

Created by Alan Wolfe
mandelbrot{at}demofox.org
http://demofox.org

October 2011

==================================================*/

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
        init();
      }
      else
      {
      	alert("Could not get html5 2d context, your browser doesn't support it! Try firefox or chrome");
      }
    }
    else
    {
      alert("The getContext function was missing, your browser doesn't support it! Try firefox or chrome"); 
    }
  }
  else
  {
    alert("Could not get element 'MainCanvas'");	
  }
}

//hook up our event listener
window.addEventListener('load', function(){onPageLoaded();}, false);