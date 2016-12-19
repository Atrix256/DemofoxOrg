/*==================================================

Created by Alan Wolfe
mandelbrot{at}demofox.org
http://demofox.org

October 2011

==================================================*/

var g_maxIterations = 1023;

function GetBias(time,bias)
{
	if(bias == 0.5)
		return time;
	else
		return (time / ((((1.0/bias) - 2.0)*(1.0 - time))+1.0));
}

function GetGain(time,gain)
{
	if(gain == 0.5)
		return time;
	else
	{
		if(time < 0.5)
			return GetBias(time * 2.0,gain)/2.0;
		else
			return GetBias(time * 2.0 - 1.0,1.0 - gain)/2.0 + 0.5;
	}
}

function renderMandelbrot(bgcolor,color1a,color1b,color2a,color2b,color3a,color3b,color4a,color4b,bias,threadid,threadmax, width, height, minx, maxx, miny, maxy, starty, endy)
{
    //calculate which rows we need to render, if we weren't told by the caller
    if(starty == null || endy == null)
    {
	    if(threadid == 0)
	    {
	    	starty = 0;
	    }
	    else
	    {
	    	starty = Math.floor((threadid) / threadmax * height);
	    }

	    if(threadid == threadmax)
	    {
	    	endy = height;
	    }
	    else
	    {
	    	endy = Math.floor((threadid + 1) / threadmax * height);
	    }
	}

    //calculate our deltas
    var xdelta = (maxx - minx) / width;
    var ydelta = (maxy - miny) / height;

    //for each pixel
    var outData = [];
    var currentY = miny + (starty * ydelta);
    for( var indexY = starty; indexY < endy; ++indexY )
    {
    	var currentX = minx;
    	for( var indexX = 0; indexX < width; ++indexX )
    	{
			var z = 0;
			var zi = 0;
			var inset = true;
			var color = 0;

			var newz;
			var newzi;

			for(indexIter=0; indexIter<g_maxIterations; ++indexIter)
			{
				newz = (z*z)-(zi*zi) + currentX;
				newzi = 2*z*zi + currentY;
				z = newz;
				zi = newzi;

				if(((z*z)+(zi*zi)) > 4)
				{
					inset = false;
					color = indexIter;
					indexIter = g_maxIterations;
				}
			}

			if (inset)
			{
				outData.push(bgcolor[0]);
				outData.push(bgcolor[1]);
				outData.push(bgcolor[2]);
			}
			else
			{ 
				if(color >= 768)
				{
					var percent = GetBias((color - 768) / 255, bias[3]);
					//var percent = (color - 768) / 255;
					outData.push((color4b[0] - color4a[0]) * percent + color4a[0]);
					outData.push((color4b[1] - color4a[1]) * percent + color4a[1]);
					outData.push((color4b[2] - color4a[2]) * percent + color4a[2]);					
				}			
				else if(color >= 512)
				{
					var percent = GetBias((color - 512) / 255, bias[2]);
					//var percent = (color - 512) / 255;
					outData.push((color3b[0] - color3a[0]) * percent + color3a[0]);
					outData.push((color3b[1] - color3a[1]) * percent + color3a[1]);
					outData.push((color3b[2] - color3a[2]) * percent + color3a[2]);				
				}				
				else if(color >= 256)
				{
					var percent = GetBias((color - 256) / 255, bias[1]);
					//var percent = (color - 256) / 255;
					outData.push((color2b[0] - color2a[0]) * percent + color2a[0]);
					outData.push((color2b[1] - color2a[1]) * percent + color2a[1]);
					outData.push((color2b[2] - color2a[2]) * percent + color2a[2]);					
				}
				else
				{
					var percent = GetBias(color / 255, bias[0]);
					//var percent = color / 255;
					outData.push((color1b[0] - color1a[0]) * percent + color1a[0]);
					outData.push((color1b[1] - color1a[1]) * percent + color1a[1]);
					outData.push((color1b[2] - color1a[2]) * percent + color1a[2]);			
				}
			}

			//alpha
			outData.push(255);			
			
			currentX = currentX + xdelta;	
    	}

    	currentY = currentY + ydelta;
    }

	return [outData,starty,endy];
}

//handle messages from main thread
this.onmessage = function (event)
{
	//get our data
    var data = event.data;

    //rendering data
    bgcolor = data.BG;
    color1a = data.Color1a;
    color1b = data.Color1b;
    color2a = data.Color2a;
    color2b = data.Color2b;
    color3a = data.Color3a;
    color3b = data.Color3b;
    color4a = data.Color4a;
    color4b = data.Color4b;
    bias    = data.ColorBias;

    //used in multithreaded situations to know how much we need to render
    threadid = data.threadid;
    threadmax = data.threadmax;

    if(data.piecemeal)
    {
    	var starty;
    	var endy;
	    if(threadid == 0)
	    {
	    	starty = 0;
	    }
	    else
	    {
	    	starty = Math.floor((threadid) / threadmax * data.height);
	    }

	    if(threadid == threadmax)
	    {
	    	endy = height;
	    }
	    else
	    {
	    	endy = Math.floor((threadid + 1) / threadmax * data.height);
	    }

	    for(var index = starty; index < endy; index++)
	    {
		    //render a line
		    outData = renderMandelbrot(bgcolor,color1a,color1b,color2a,color2b,color3a,color3b,color4a,color4b,bias,threadid,threadmax,data.width,data.height,data.minx,data.maxx,data.miny,data.maxy,index,index+1);

		    //send a message back to the main thread with the data for this line
		    postMessage({'pixeldata' : outData[0],
						 'renderid'  : data.renderid,
						 'starty'    : outData[1],
						 'endy'      : outData[2],
						 'finalize'  : false});    	
		}

		//send the finalize message cause we are done
	    postMessage({'finalize'  : true,
				     'renderid'  : data.renderid});
    }
    else
	{
	    //render!
	    outData = renderMandelbrot(bgcolor,color1a,color1b,color2a,color2b,color3a,color3b,color4a,color4b,bias,threadid,threadmax,data.width,data.height,data.minx,data.maxx,data.miny,data.maxy,data.piecemeal);

	    //send a message back to the main thread
	    postMessage({'pixeldata' : outData[0],
					 'renderid'  : data.renderid,
					 'starty'    : outData[1],
					 'endy'      : outData[2],
					 'finalize'  : true});
	}
};