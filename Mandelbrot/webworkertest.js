/*==================================================

Created by Alan Wolfe
mandelbrot{at}demofox.org
http://demofox.org

October 2011

==================================================*/

var g_workerThreads;
var g_imgd;

var g_imgWidth = 290;
var g_imgHeight = 290;

var g_startMS;
var g_requestsInFlight = 0;

var g_defaultCameraPosX = 0;
var g_defaultCameraPosY = 0;
var g_defaultCameraWidth = 5;
var g_defaultColorBG = "#000000";
var g_defaultColor1a = "#000000";
var g_defaultColor1b = "#0000FF";
var g_defaultColor2a = "#0000FF";
var g_defaultColor2b = "#00FF00";
var g_defaultColor3a = "#00FF00";
var g_defaultColor3b = "#FFFF00";
var g_defaultColor4a = "#FFFF00";
var g_defaultColor4b = "#FF0000";
var g_defaultColor1Bias = 0.8;
var g_defaultColor2Bias = 0.5;
var g_defaultColor3Bias = 0.5;
var g_defaultColor4Bias = 0.5;

var g_cameraPosX;
var g_cameraPosY;
var g_cameraWidth;
var g_colorBG;
var g_color1a;
var g_color1b;
var g_color2a;
var g_color2b;
var g_color3a;
var g_color3b;
var g_color4a;
var g_color4b;
var g_color1Bias;
var g_color2Bias;
var g_color3Bias;
var g_color4Bias;

//1 worker thread by default
var g_threadCount = 2;

//auto incrementing number used to identify requests
var g_renderID = 0;
var g_requestsInFlightForCurrentRender = 0;

var g_antiAliasing = false;
var g_dataPeicemeal = false;
var g_renderDataAlways = true;

function setValueByName(name, value)
{
  if(name == "BG")
  {
    g_colorBG = value;
  }
  else if(name == "Color1a")
  {
    g_color1a = value;
  }
  else if(name == "Color1b")
  {
    g_color1b = value;
  }
  else if(name == "Color2a")
  {
    g_color2a = value;
  }
  else if(name == "Color2b")
  {
    g_color2b = value;
  }
  else if(name == "Color3a")
  {
    g_color3a = value;
  }
  else if(name == "Color3b")
  {
    g_color3b = value;
  }
  else if(name == "Color4a")
  {
    g_color4a = value;
  }
  else if(name == "Color4b")
  {
    g_color4b = value;
  }
  else if(name == "Color1Bias")
  {
    g_color1Bias = value;
  }
  else if(name == "Color2Bias")
  {
    g_color2Bias = value;
  }
  else if(name == "Color3Bias")
  {
    g_color3Bias = value;
  }
  else if(name == "Color4Bias")
  {
    g_color4Bias = value;
  }
}

function getValueByName(name)
{
  if(name == "BG")
  {
    return g_colorBG;
  }
  else if(name == "Color1a")
  {
    return g_color1a;
  }  
  else if(name == "Color1b")
  {
    return g_color1b;
  }    
  else if(name == "Color2a")
  {
    return g_color2a;
  }  
  else if(name == "Color2b")
  {
    return g_color2b;
  }    
  else if(name == "Color3a")
  {
    return g_color3a;
  }  
  else if(name == "Color3b")
  {
    return g_color3b;
  }    
  else if(name == "Color4a")
  {
    return g_color4a;
  }  
  else if(name == "Color4b")
  {
    return g_color4b;
  }   
  else if(name == "Color1Bias")
  {
    return g_color1Bias;
  }
  else if(name == "Color2Bias")
  {
    return g_color2Bias;
  }
  else if(name == "Color3Bias")
  {
    return g_color3Bias;
  }
  else if(name == "Color4Bias")
  {
    return g_color4Bias;
  }      
}

function getDefaultFromName(name)
{
  if(name == "BG")
  {
    return g_defaultColorBG;
  }
  else if(name == "Color1a")
  {
    return g_defaultColor1a;
  }  
  else if(name == "Color1b")
  {
    return g_defaultColor1b;
  }  
  else if(name == "Color2a")
  {
    return g_defaultColor2a;
  }  
  else if(name == "Color2b")
  {
    return g_defaultColor2b;
  }  
  else if(name == "Color3a")
  {
    return g_defaultColor3a;
  }  
  else if(name == "Color3b")
  {
    return g_defaultColor3b;
  }  
  else if(name == "Color4a")
  {
    return g_defaultColor4a;
  }  
  else if(name == "Color4b")
  {
    return g_defaultColor4b;
  }
  else if(name == "Color1Bias")
  {
    return g_defaultColor1Bias;
  }
  else if(name == "Color2Bias")
  {
    return g_defaultColor2Bias;
  }
  else if(name == "Color3Bias")
  {
    return g_defaultColor3Bias;
  }
  else if(name == "Color4Bias")
  {
    return g_defaultColor4Bias;
  }      
}

function resetToDefaults()
{
  resetCamera();

  g_colorBG = g_defaultColorBG;
  g_color1a = g_defaultColor1a;
  g_color1b = g_defaultColor1b;
  g_color2a = g_defaultColor2a;
  g_color2b = g_defaultColor2b;
  g_color3a = g_defaultColor3a;
  g_color3b = g_defaultColor3b;
  g_color4a = g_defaultColor4a;
  g_color4b = g_defaultColor4b;
  g_color1Bias = g_defaultColor1Bias;
  g_color2Bias = g_defaultColor2Bias;
  g_color3Bias = g_defaultColor3Bias;
  g_color4Bias = g_defaultColor4Bias;
}

function getQuerystring(key, default_)
{
  if (default_==null) default_="";
  key = key.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regex = new RegExp("[\\?&]"+key+"=([^&#]*)");
  var qs = regex.exec(window.location.href);
  if(qs == null)
    return default_;
  else
    return qs[1];
}

function setThreadCount(value)
{
  if(g_workerThreads)
  {
    g_threadCount = value; 
    return true;
  }
  else
  {
    alert("Your browser does not support web workers unfortunately!  Try chrome (prefered) or firefox.");
    var zerothreadoption = document.getElementById('threadcount0');
    if(zerothreadoption)
    {
      zerothreadoption.checked = true;
    }
    return false;
  }
}

function getRGBFromHTMLColor(value)
{
  //try and parse an html color code
  if(value.substr(0,1) == "#")
  {
    var red;
    var green;
    var blue;

    //get the hex codes
    if(value.length == 7)
    {
      red = value.substr(1,2);
      green = value.substr(3,2);
      blue = value.substr(5,2);
    }
    else if(value.length == 4)
    {
      red = value.substr(1,1);
      green = value.substr(2,1);
      blue = value.substr(3,1);      
    }

    //if we could get the hex codes
    if(red != null && green != null && blue != null && red != NaN && green != NaN && blue != NaN)
    {
      //convert from hex to decimal
      red = parseInt(red,16);
      green = parseInt(green,16);
      blue = parseInt(blue,16);
          
      //if the conversion went ok
      if(red != null && green != null && blue != null && red != NaN && green != NaN && blue != NaN)
      {
        return [red, green, blue];
      }
    }
  }  

  //if we couldn't parse it, return null
  return null;
}

function onBiasBoxChange(box, name)
{
  //if our number is parsable as a float, make sure it's in range and then set it
  var value = parseFloat(box.value);
  if(value != null)
  {
    if(value > 1)
    {
      value = 1;
    }
    else if(value < 0)
    {
      value = 0;
    }

    box.value = value;
  }
  //else set the default
  else
  {
    box.value = getDefaultFromName(name);
  }

  //set the variable to the value of the box
  setValueByName(name,box.value)

}

function onColorBoxChange(box, name)
{
  //try and parse the color from the box
  //if we can't, set it to default
  if(!getRGBFromHTMLColor(box.value))
  {
    box.value = getDefaultFromName(name);
  }

  //set the variable to the value of the box
  setValueByName(name,box.value)
}

function parseCommandLine()
{
  g_cameraPosX = parseFloat(getQuerystring("camerax",g_cameraPosX));
  g_cameraPosY = parseFloat(getQuerystring("cameray",g_cameraPosY));
  g_cameraWidth = parseFloat(getQuerystring("camerawidth",g_cameraWidth));
  g_colorBG = unescape(getQuerystring("colorbg",g_colorBG));
  g_color1a = unescape(getQuerystring("color1a",g_color1a));
  g_color1b = unescape(getQuerystring("color1b",g_color1b));
  g_color2a = unescape(getQuerystring("color2a",g_color2a));
  g_color2b = unescape(getQuerystring("color2b",g_color2b));
  g_color3a = unescape(getQuerystring("color3a",g_color3a));
  g_color3b = unescape(getQuerystring("color3b",g_color3b));
  g_color4a = unescape(getQuerystring("color4a",g_color4a));
  g_color4b = unescape(getQuerystring("color4b",g_color4b));
  g_color1Bias = parseFloat(getQuerystring("color1bias",g_color1Bias));
  g_color2Bias = parseFloat(getQuerystring("color2bias",g_color2Bias));
  g_color3Bias = parseFloat(getQuerystring("color3bias",g_color3Bias));
  g_color4Bias = parseFloat(getQuerystring("color4bias",g_color4Bias));
}

function resetCamera()
{
  g_cameraPosX = g_defaultCameraPosX
  g_cameraPosY = g_defaultCameraPosY;
  g_cameraWidth = g_defaultCameraWidth;
}

function zoomOut()
{
  g_cameraWidth *= 2;
  redrawImage();  
}

function zoomIn()
{
  g_cameraWidth /= 2;
  redrawImage();  
}

function updateMandelink()
{
  //make the new url line
  var URL = "?";

  if(g_cameraPosX != g_defaultCameraPosX)
  {
    URL += "camerax="+escape(g_cameraPosX)+"&";
  }

  if(g_cameraPosY != g_defaultCameraPosY)
  {
    URL += "cameray="+escape(g_cameraPosY)+"&";
  }

  if(g_cameraWidth != g_defaultCameraWidth)
  {
    URL += "camerawidth="+escape(g_cameraWidth)+"&";
  }

  if(g_colorBG != g_defaultColorBG)
  {
    URL += "colorbg="+escape(g_colorBG)+"&";
  }  

  if(g_color1a != g_defaultColor1a)
  {
    URL += "color1a="+escape(g_color1a)+"&";
  }  

  if(g_color1b != g_defaultColor1b)
  {
    URL += "color1b="+escape(g_color1b)+"&";
  }  

  if(g_color2a != g_defaultColor2a)
  {
    URL += "color2a="+escape(g_color2a)+"&";
  }  

  if(g_color2b != g_defaultColor2b)
  {
    URL += "color2b="+escape(g_color2b)+"&";
  }  

  if(g_color3a != g_defaultColor3a)
  {
    URL += "color3a="+escape(g_color3a)+"&";
  }  

  if(g_color3b != g_defaultColor3b)
  {
    URL += "color3b="+escape(g_color3b)+"&";
  }  

  if(g_color4a != g_defaultColor4a)
  {
    URL += "color4a="+escape(g_color4a)+"&";
  }  

  if(g_color4b != g_defaultColor4b)
  {
    URL += "color4b="+escape(g_color4b)+"&";
  }  

  if(g_color1Bias != g_defaultColor1Bias)
  {
    URL += "color1bias="+escape(g_color1Bias)+"&";
  }    

  if(g_color2Bias != g_defaultColor2Bias)
  {
    URL += "color2bias="+escape(g_color2Bias)+"&";
  }    

  if(g_color3Bias != g_defaultColor3Bias)
  {
    URL += "color3bias="+escape(g_color3Bias)+"&";
  }    

  if(g_color4Bias != g_defaultColor4Bias)
  {
    URL += "color4bias="+escape(g_color4Bias)+"&";
  }    

  URL = window.location.href.split("?")[0] + URL;

  var link = document.getElementById('Mandelink');
  if(link)
  {
    link.setAttribute('href', URL);    
    link.innerHTML = URL;
  }
}

function redrawImage()
{
  //increment our request ID
  g_renderID++;

  //handle varying aspect ratios by increasing or decreasing width
  var minx = g_cameraPosX - (g_cameraWidth * 0.5 * (g_imgWidth / g_imgHeight));  
  var maxx = g_cameraPosX + (g_cameraWidth * 0.5 * (g_imgWidth / g_imgHeight));  
  var miny = g_cameraPosY - g_cameraWidth * 0.5;
  var maxy = g_cameraPosY + g_cameraWidth * 0.5;  

  //sart our timer
  g_startMS = new Date().getTime();

  //get our background color
  bgcolor = getRGBFromHTMLColor(g_colorBG);
  color1a = getRGBFromHTMLColor(g_color1a);
  color1b = getRGBFromHTMLColor(g_color1b);
  color2a = getRGBFromHTMLColor(g_color2a);
  color2b = getRGBFromHTMLColor(g_color2b);
  color3a = getRGBFromHTMLColor(g_color3a);
  color3b = getRGBFromHTMLColor(g_color3b);
  color4a = getRGBFromHTMLColor(g_color4a);
  color4b = getRGBFromHTMLColor(g_color4b);
  color1Bias = g_color1Bias;
  color2Bias = g_color2Bias;
  color3Bias = g_color3Bias;
  color4Bias = g_color4Bias;

  g_requestsInFlightForCurrentRender = 0;

  //if main thread rendering
  if(g_threadCount == 0)
  {
    //render
    outData = renderMandelbrot(bgcolor,color1a,color1b,color2a,color2b,color3a,color3b,color4a,color4b,[color1Bias,color2Bias,color3Bias,color4Bias],0,1, g_imgWidth, g_imgHeight, minx, maxx, miny, maxy);

    //copy to image
    copyImageDataToImageBuffer(outData[0],outData[1],true);

    //copy image to screen
    copyImageToScreen(true);
  }
  //else worker thread rendering
  else
  {
    for(var index = 0; index < g_threadCount; ++index)
    {
      //tell the thread to start rendering
      g_workerThreads[index].postMessage({'width'     : g_imgWidth,
                                          'height'    : g_imgHeight,
                                          'minx'      : minx,
                                          'miny'      : miny,
                                          'maxx'      : maxx,
                                          'maxy'      : maxy,
                                          'BG'        : bgcolor,
                                          'Color1a'   : color1a,
                                          'Color1b'   : color1b,
                                          'Color2a'   : color2a,
                                          'Color2b'   : color2b,
                                          'Color3a'   : color3a,
                                          'Color3b'   : color3b,
                                          'Color4a'   : color4a,
                                          'Color4b'   : color4b,
                                          'ColorBias' : [color1Bias,color2Bias,color3Bias,color4Bias],
                                          'threadid'  : index,
                                          'threadmax' : g_threadCount,
                                          'renderid'  : g_renderID,
                                          'piecemeal' : g_dataPeicemeal
                                          });

      //increment how many requests are in flight for the current render
      g_requestsInFlightForCurrentRender++;

      //increment our in flight requests
      g_requestsInFlight++;                                        
    }

    //update how many requests are pending
    var LoadText = document.getElementById('LoadText');
    if(LoadText)
    {
      LoadText.innerHTML = g_requestsInFlight + " request(s) pending...";
    }
  }   

  //update the link
  updateMandelink();
}

function onClickCanvas(e)
{
  //get the mouse position
  var mouseX = e.pageX - g_elem.offsetLeft;
  var mouseY = e.pageY - g_elem.offsetTop; 

  //convert to a percent, taking into account the border
  var percentX = (mouseX - 5) / g_imgWidth;
  var percentY = (mouseY - 5) / g_imgHeight;

  //move the camera to the new place
  var realWidth = g_cameraWidth * (g_imgWidth / g_imgHeight);
  var realHeight = g_cameraWidth;
  g_cameraPosX += (percentX - 0.5) * (realWidth);
  g_cameraPosY += (percentY - 0.5) * (realHeight);

  //zoom in
  g_cameraWidth /= 2;

  //re-render the image
  redrawImage();
}

function copyImageDataToImageBuffer(pixeldata,starty)
{
    var numPixels = pixeldata.length
    var destOffset = starty * g_imgWidth * 4;
    for (var i = 0; i < numPixels; i++)
    {
      g_imgd.data[destOffset + i] = pixeldata[i];
    }  
}

function copyImageToScreen(finalize)
{
  //if we shouldn't always render data, and this isn't the finalize data copy, ignore it
  if(!g_renderDataAlways && !finalize)
  {
    return;
  }

  //anti alias if we should
  if(finalize && g_antiAliasing)
  {
    var sampleIndex;
    for(var index = 0; index < g_imgd.data.length ; index+=4)
    {
      var sampleCount = 1;
      var sampleTotal = [g_imgd.data[index + 0],g_imgd.data[index + 1],g_imgd.data[index + 2]];

      //up
      sampleIndex = index - (g_imgWidth * 4);
      if(sampleIndex >= 0)
      {
        sampleCount++;
        sampleTotal[0] += g_imgd.data[sampleIndex + 0];
        sampleTotal[1] += g_imgd.data[sampleIndex + 1];
        sampleTotal[2] += g_imgd.data[sampleIndex + 2];
      }

      //down
      sampleIndex = index + (g_imgWidth * 4);
      if(sampleIndex < g_imgd.data.length)
      {
        sampleCount++;
        sampleTotal[0] += g_imgd.data[sampleIndex + 0];
        sampleTotal[1] += g_imgd.data[sampleIndex + 1];
        sampleTotal[2] += g_imgd.data[sampleIndex + 2];
      }

      //left
      sampleIndex = index -4;
      if(sampleIndex >= 0)
      {
        sampleCount++;
        sampleTotal[0] += g_imgd.data[sampleIndex + 0];
        sampleTotal[1] += g_imgd.data[sampleIndex + 1];
        sampleTotal[2] += g_imgd.data[sampleIndex + 2];
      }   
      
      //right
      sampleIndex = index + 4;
      if(sampleIndex < g_imgd.data.length)
      {
        sampleCount++;
        sampleTotal[0] += g_imgd.data[sampleIndex + 0];
        sampleTotal[1] += g_imgd.data[sampleIndex + 1];
        sampleTotal[2] += g_imgd.data[sampleIndex + 2];
      }             

      g_imgd.data[index + 0] = sampleTotal[0] / sampleCount;
      g_imgd.data[index + 1] = sampleTotal[1] / sampleCount;
      g_imgd.data[index + 2] = sampleTotal[2] / sampleCount;
    }
  }

  //put the image data down
  g_context.putImageData(g_imgd, 5, 5);
      
  if(finalize)
  {
    //show how long it took
    var LoadText = document.getElementById('LoadText');
    if(LoadText)
    {
      LoadText.innerHTML = "Rendered in: " + (new Date().getTime() - g_startMS) + "ms";

      if(g_antiAliasing)
      {
        LoadText.innerHTML += " (including blurring)"
      }
    }  
  }
}

function onMessageFromThread(data)
{
  //decriment our in flight requests if this is a "finalize" message
  if(data.finalize)
  {
    g_requestsInFlight--;
  }

  //ignore all responses except those for our current render ID
  if(data.renderid == g_renderID)
  {
    //copy the data we got into the image data, if there was any image data (in a finalize message there might not be)
    if(data.pixeldata != null && data.starty != null)
    {
      copyImageDataToImageBuffer(data.pixeldata,data.starty,false);

      //show data on the screen as it comes in
      if(!data.finalize)
      {
        copyImageToScreen(false);
      }
    }

    //only do the next stuff if this is a finalize message
    if(data.finalize)
    {
      //decrimount the number of requests in flight for the current render
      g_requestsInFlightForCurrentRender--;

      //if we are done with this render
      if(g_requestsInFlightForCurrentRender == 0)
      {
        //put our image on the screen
        copyImageToScreen(true);
      }
      else
      {
        //show data on the screen as it comes in
        copyImageToScreen(false);
      }
    }
  }

  //update the text to show how many responses we are waiting on
  if(g_requestsInFlightForCurrentRender != 0)
  {
    var LoadText = document.getElementById('LoadText');
    if(LoadText)
    {
      LoadText.innerHTML = g_requestsInFlight + " request(s) pending...";
    }    
  }
}

function SetResolution(width,height)
{
  //store off the new resolution, adding a little border on the edge
  g_imgWidth = width - 10;
  g_imgHeight = height - 10;

  //set our canvas to the new size
  g_elem.width = width;
  g_elem.height = height;
  g_elem.style.width = width + "px";
  g_elem.style.height = height + "px";

  //recreate our image data buffer
  makeImageDataBuffer();

  //redraw the image
  redrawImage();  
}

function onErrorFromThread(e)
{
  alert('Error in thread: Line ' + e.lineno + ' in ' + e.filename + ': ' + e.message);  
}

function addPageControls()
{
  var MainHTML = document.getElementById('MainHTML');
  if(MainHTML)
  {
    var newTable;
    var newTr;
    var newTd;
    var newDiv;
    var newInput;
    var newText;
    var newButton
        
    //create the loadtext text
    var newDiv = document.createElement('div');
    newDiv.setAttribute('ID', 'LoadText');
    MainHTML.appendChild(newDiv);

    //add the instructions
    newDiv = document.createElement('div');
    newDiv.innerHTML = "Click on the image to zoom in";
    MainHTML.appendChild(newDiv);
    MainHTML.appendChild(document.createElement('br'));    

    //create the "re-render" button
    newButton = document.createElement('button');
    newButton.innerHTML = "Re-render";
    newButton.setAttribute('onClick', 'redrawImage();');
    MainHTML.appendChild(newButton);
    newButton = document.createElement('button');
    newButton.innerHTML = "Zoom Out";
    newButton.setAttribute('onClick', 'zoomOut();');
    MainHTML.appendChild(newButton);     
    newButton = document.createElement('button');
    newButton.innerHTML = "Zoom In";
    newButton.setAttribute('onClick', 'zoomIn();');
    MainHTML.appendChild(newButton);     
    newButton = document.createElement('button');
    newButton.innerHTML = "Reset Camera";
    newButton.setAttribute('onClick', 'resetCamera();redrawImage();');
    MainHTML.appendChild(newButton);    
    MainHTML.appendChild(document.createElement('br'));
    MainHTML.appendChild(document.createElement('br'));

    //create the settings table
    newTable = document.createElement('table');
    newTable.style.border = "1px solid";
    newTable.style.borderCollapse = "collapse";    
    MainHTML.appendChild(newTable);
      newTr = document.createElement('tr');
      newTr.style.fontWeight = 700;
      newTr.style.textDecoration = "underline";
      newTr.style.backgroundColor ='#002000'      
      newTable.appendChild(newTr);
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newText = document.createTextNode("Resolution");
          newTd.appendChild(newText);   
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newText = document.createTextNode("Worker Threads");
          newTd.appendChild(newText);                     
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newText = document.createTextNode("Colors");
          newTd.appendChild(newText);
          //this is our color label
        newTd = document.createElement('td');
        newTr.appendChild(newTd);          
          //this is our first color       
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          //this is our 2nd color
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newText = document.createTextNode("Color Bias");
          newTd.appendChild(newText);        
          //this is our bias          
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newText = document.createTextNode("Options");
          newTd.appendChild(newText);        
      newTr = document.createElement('tr');
      newTable.appendChild(newTr);       
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'radio');
          newInput.setAttribute('name', 'resolution');
          newInput.setAttribute('onClick', 'SetResolution(100,100);');
          newText = document.createTextNode("100x100");
          newTd.appendChild(newInput);
          newTd.appendChild(newText);
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'radio');
          newInput.setAttribute('name', 'threadcount');
          newInput.setAttribute('onClick', 'return setThreadCount(0);');
          newInput.setAttribute('ID', 'threadcount0');
          if(!g_workerThreads)
          {
            newInput.setAttribute('checked', 'true');          
          }          
          newText = document.createTextNode("0 (all on main thread)");
          newTd.appendChild(newInput);
          newTd.appendChild(newText);                  
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newText = document.createTextNode("BG: ");          
          newTd.appendChild(newText);                    
        newTd = document.createElement('td');
        newTr.appendChild(newTd);          
          newInput = document.createElement('input');
          newInput.setAttribute('value', getValueByName("BG"));
          newInput.setAttribute('onChange', 'onColorBoxChange(this, "BG");');
          newTd.appendChild(newInput)        
        newTd = document.createElement('td');
        newTr.appendChild(newTd);   
          //no 2nd color for BG
        newTd = document.createElement('td');
        newTr.appendChild(newTd);   
          //no bias for BG        
        newTd = document.createElement('td');
        newTr.appendChild(newTd);              
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'checkbox');
          newInput.setAttribute('onClick', 'g_antiAliasing = ! g_antiAliasing;');
          newText = document.createTextNode("Blur (poor man's AA, runs on main thread)");
          newTd.appendChild(newInput);
          newTd.appendChild(newText);        
      newTr = document.createElement('tr');
      newTable.appendChild(newTr);        
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'radio');
          newInput.setAttribute('name', 'resolution');
          newInput.setAttribute('onClick', 'SetResolution(200,200);');
          newText = document.createTextNode("200x200");
          newTd.appendChild(newInput);
          newTd.appendChild(newText);
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'radio');
          newInput.setAttribute('name', 'threadcount');
          newInput.setAttribute('onClick', 'return setThreadCount(1);');
          newText = document.createTextNode("1 (all one 1 web worker)");
          newTd.appendChild(newInput);
          newTd.appendChild(newText);                   
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newText = document.createTextNode("Range 1: ");          
          newTd.appendChild(newText);                    
        newTd = document.createElement('td');
        newTr.appendChild(newTd);          
          newInput = document.createElement('input');
          newInput.setAttribute('value', getValueByName("Color1a"));
          newInput.setAttribute('onChange', 'onColorBoxChange(this, "Color1a");');
          newTd.appendChild(newInput);        
        newTd = document.createElement('td');
        newTr.appendChild(newTd);   
          newInput = document.createElement('input');
          newInput.setAttribute('value', getValueByName("Color1b"));
          newInput.setAttribute('onChange', 'onColorBoxChange(this, "Color1b");'); 
          newTd.appendChild(newInput);    
        newTd = document.createElement('td');
        newTr.appendChild(newTd);   
          newInput = document.createElement('input');
          newInput.setAttribute('value', getValueByName("Color1Bias"));
          newInput.setAttribute('onChange', 'onBiasBoxChange(this, "Color1Bias");'); 
          newTd.appendChild(newInput);
        newTd = document.createElement('td');
        newTr.appendChild(newTd);              
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'checkbox');
          newInput.setAttribute('onClick', 'g_dataPeicemeal = ! g_dataPeicemeal;');
          newText = document.createTextNode("Threads send data row by row");
          newTd.appendChild(newInput);
          newTd.appendChild(newText);                     
      newTr = document.createElement('tr');
      newTable.appendChild(newTr);         
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'radio');
          newInput.setAttribute('name', 'resolution');
          newInput.setAttribute('checked', 'true');          
          newInput.setAttribute('onClick', 'SetResolution(300,300);');
          newText = document.createTextNode("300x300");
          newTd.appendChild(newInput);
          newTd.appendChild(newText);
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'radio');
          newInput.setAttribute('name', 'threadcount');
          if(g_workerThreads)
          {
            newInput.setAttribute('checked', 'true');          
          }
          newInput.setAttribute('onClick', 'return setThreadCount(2);');
          newText = document.createTextNode("2");
          newTd.appendChild(newInput);
          newTd.appendChild(newText);          
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newText = document.createTextNode("Range 2: ");          
          newTd.appendChild(newText);                    
        newTd = document.createElement('td');
        newTr.appendChild(newTd);          
          newInput = document.createElement('input');
          newInput.setAttribute('value', getValueByName("Color2a"));
          newInput.setAttribute('onChange', 'onColorBoxChange(this, "Color2a");');
          newTd.appendChild(newInput)        
        newTd = document.createElement('td');
        newTr.appendChild(newTd);   
          newInput = document.createElement('input');
          newInput.setAttribute('value', getValueByName("Color2b"));
          newInput.setAttribute('onChange', 'onColorBoxChange(this, "Color2b");'); 
          newTd.appendChild(newInput)    
        newTd = document.createElement('td');
        newTr.appendChild(newTd);   
          newInput = document.createElement('input');
          newInput.setAttribute('value', getValueByName("Color2Bias"));
          newInput.setAttribute('onChange', 'onBiasBoxChange(this, "Color2Bias");'); 
          newTd.appendChild(newInput);
        newTd = document.createElement('td');
        newTr.appendChild(newTd);           
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'checkbox');
          newInput.setAttribute('checked', 'true');
          newInput.setAttribute('onClick', 'g_renderDataAlways = ! g_renderDataAlways;');
          newText = document.createTextNode("Render data as it comes in");
          newTd.appendChild(newInput);
          newTd.appendChild(newText);   
      newTr = document.createElement('tr');
      newTable.appendChild(newTr);
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'radio');
          newInput.setAttribute('name', 'resolution');
          newInput.setAttribute('onClick', 'SetResolution(400,400);');
          newText = document.createTextNode("400x400");
          newTd.appendChild(newInput);
          newTd.appendChild(newText);    
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'radio');
          newInput.setAttribute('name', 'threadcount');
          newInput.setAttribute('onClick', 'return setThreadCount(3);');
          newText = document.createTextNode("3");
          newTd.appendChild(newInput);
          newTd.appendChild(newText);             
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newText = document.createTextNode("Range 3: ");          
          newTd.appendChild(newText);                    
        newTd = document.createElement('td');
        newTr.appendChild(newTd);          
          newInput = document.createElement('input');
          newInput.setAttribute('value', getValueByName("Color3a"));
          newInput.setAttribute('onChange', 'onColorBoxChange(this, "Color3a");');
          newTd.appendChild(newInput)        
        newTd = document.createElement('td');
        newTr.appendChild(newTd);   
          newInput = document.createElement('input');
          newInput.setAttribute('value', getValueByName("Color3b"));
          newInput.setAttribute('onChange', 'onColorBoxChange(this, "Color3b");'); 
          newTd.appendChild(newInput)    
        newTd = document.createElement('td');
        newTr.appendChild(newTd);   
          newInput = document.createElement('input');
          newInput.setAttribute('value', getValueByName("Color3Bias"));
          newInput.setAttribute('onChange', 'onBiasBoxChange(this, "Color3Bias");'); 
          newTd.appendChild(newInput);    
        newTd = document.createElement('td');
        newTr.appendChild(newTd);   
          //option                         
      newTr = document.createElement('tr');
      newTable.appendChild(newTr);
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'radio');
          newInput.setAttribute('name', 'resolution');
          newInput.setAttribute('onClick', 'SetResolution(500,500);');
          newText = document.createTextNode("500x500");
          newTd.appendChild(newInput);
          newTd.appendChild(newText);
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'radio');
          newInput.setAttribute('name', 'threadcount');
          newInput.setAttribute('onClick', 'return setThreadCount(4);');
          newText = document.createTextNode("4");
          newTd.appendChild(newInput);
          newTd.appendChild(newText);             
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newText = document.createTextNode("Range 4: ");          
          newTd.appendChild(newText);                    
        newTd = document.createElement('td');
        newTr.appendChild(newTd);          
          newInput = document.createElement('input');
          newInput.setAttribute('value', getValueByName("Color4a"));
          newInput.setAttribute('onChange', 'onColorBoxChange(this, "Color4a");');
          newTd.appendChild(newInput)        
        newTd = document.createElement('td');
        newTr.appendChild(newTd);   
          newInput = document.createElement('input');
          newInput.setAttribute('value', getValueByName("Color4b"));
          newInput.setAttribute('onChange', 'onColorBoxChange(this, "Color4b");'); 
          newTd.appendChild(newInput)    
        newTd = document.createElement('td');
        newTr.appendChild(newTd);   
          newInput = document.createElement('input');
          newInput.setAttribute('value', getValueByName("Color4Bias"));
          newInput.setAttribute('onChange', 'onBiasBoxChange(this, "Color4Bias");'); 
          newTd.appendChild(newInput);      
        newTd = document.createElement('td');
        newTr.appendChild(newTd);   
          //option                
      newTr = document.createElement('tr');
      newTable.appendChild(newTr);
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'radio');
          newInput.setAttribute('name', 'resolution');
          newInput.setAttribute('onClick', 'SetResolution(800,600);');
          newText = document.createTextNode("800x600");
          newTd.appendChild(newInput);
          newTd.appendChild(newText);   
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'radio');
          newInput.setAttribute('name', 'threadcount');
          newInput.setAttribute('onClick', 'return setThreadCount(8);');
          newText = document.createTextNode("8");
          newTd.appendChild(newInput);
          newTd.appendChild(newText);             
        newTd = document.createElement('td');
        newTr.appendChild(newTd);   
          //empty   
        newTd = document.createElement('td');
        newTr.appendChild(newTd);   
          //empty   
        newTd = document.createElement('td');
        newTr.appendChild(newTd);   
          //empty   
        newTd = document.createElement('td');
        newTr.appendChild(newTd);   
          //empty                     
        newTd = document.createElement('td');
        newTr.appendChild(newTd);   
          //option                                 
      newTr = document.createElement('tr');
      newTable.appendChild(newTr);
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'radio');
          newInput.setAttribute('name', 'resolution');
          newInput.setAttribute('onClick', 'SetResolution(1024,768);');
          newText = document.createTextNode("1024x768");
          newTd.appendChild(newInput);
          newTd.appendChild(newText); 
        newTd = document.createElement('td');
        newTr.appendChild(newTd);
          newInput = document.createElement('input');
          newInput.setAttribute('type', 'radio');
          newInput.setAttribute('name', 'threadcount');
          newInput.setAttribute('onClick', 'return setThreadCount(16);');
          newText = document.createTextNode("16");
          newTd.appendChild(newInput);
          newTd.appendChild(newText);             
        newTd = document.createElement('td');
        newTr.appendChild(newTd);   
          //empty   
        newTd = document.createElement('td');
        newTr.appendChild(newTd);   
          //empty   
        newTd = document.createElement('td');
        newTr.appendChild(newTd);   
          //empty   
        newTd = document.createElement('td');
        newTr.appendChild(newTd);   
          //empty                                           
        newTd = document.createElement('td');
        newTr.appendChild(newTd);   
          //option

    //add the "a" element where we are going to put the link each time
    MainHTML.appendChild(document.createElement('br')); 
    newText = document.createTextNode("Share what you are looking at with your friends by giving them the link below");
    MainHTML.appendChild(newText);    
    MainHTML.appendChild(document.createElement('br'));     
    MainHTML.appendChild(document.createElement('br'));   
    newText = document.createTextNode("Mandelink:");
    MainHTML.appendChild(newText);    
    MainHTML.appendChild(document.createElement('br')); 
    newLink = document.createElement('a');
    newLink.setAttribute('ID', 'Mandelink');
    MainHTML.appendChild(newLink);    

    //update the link
    updateMandelink();    
  }
}

function makeImageDataBuffer()
{
    //create the image buffer
    g_imgd = false;
    if (g_context.createImageData)
    {
      g_imgd = g_context.createImageData(g_imgWidth, g_imgHeight);
    }
    else if (g_context.getImageData)
    {
      g_imgd = g_context.getImageData(0, 0, g_imgWidth, g_imgHeight);
    }
    else
    {
      g_imgd = {'width' : g_imgWidth, 'height' : g_imgHeight, 'data' : new Array(g_imgWidth*g_imgHeight*4)};
    }

    //fill the context with green to start out (and give it that green border)
    g_context.fillStyle   = "#00FF20";
    g_context.fillRect(0, 0, g_elem.offsetWidth, g_elem.offsetHeight);
}


function init()
{
  resetToDefaults();

  parseCommandLine();

  makeImageDataBuffer();

  //if web workers are supported, set them up
  if(typeof(Worker) !== "undefined")
  {
    g_workerThreads = new Array(16);

    for(var index = 0; index < 16; index++)
    {
      g_workerThreads[index] = new Worker("webworkertestthread.js");

      //handle messages from worker thread
      g_workerThreads[index].onmessage = function (event)
      {
          onMessageFromThread(event.data);
      };      

      //handle errors from worker thread
      g_workerThreads[index].onerror = function(e)
      {
        onErrorFromThread(e);
      };
    }
  }
  //else set the thread count to zero
  else
  {
    g_threadCount = 0;
  }

  //register our onclick event
  g_elem.onclick = function(e){onClickCanvas(e)};

  //add the page controls
  addPageControls();

  //draw the image for the first time
  redrawImage();
}