/*==================================================

Created by Alan Wolfe
jsraytrace{at}demofox.org
http://demofox.org

October 2011

==================================================*/

function init()
{
  //all is well
  return true;
}

function drawPixels()
{
  var width = 50;//g_elem.offsetWidth;
  var height = 50;//g_elem.offsetHeight;

  var imgd = false;
  if (g_context.createImageData)
  {
    imgd = g_context.createImageData(width, height);
  }
  else if (g_context.getImageData)
  {
    imgd = g_context.getImageData(0, 0, width, height);
  }
  else
  {
    imgd = {'width' : width, 'height' : height, 'data' : new Array(width*height*4)};
  }

  // Loop over each pixel.
  var pix = imgd.data;
  for (var i = 0, n = pix.length; i < n; i += 4)
  {
    pix[i  ] = 255; // the red channel
    pix[i+3] = 127; // the alpha channel
  }  

  // Draw the ImageData object.
  g_context.putImageData(imgd, 0, 0);
}

function update()
{
  //get our current phase
  var phase = (g_currentMS * 0.005) % (2 * Math.PI);

  //get our current color value
  var color = Math.floor(((Math.sin(phase) + 1) / 2) * 255);
  var green = "";
  if(color < 16)
  {
    green = "0";
  }
  green += color.toString(16);

  //fill the screen with this color value as green
  g_context.fillStyle   = "#00" + green + "00";
  g_context.fillRect(0, 0, g_elem.offsetWidth, g_elem.offsetHeight); 

  //draw some pixels on the screen
  drawPixels();
}