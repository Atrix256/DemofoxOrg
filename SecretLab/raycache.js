/*==================================================

Created by Alan Wolfe
jsraytrace{at}demofox.org
http://demofox.org

October 2011

==================================================*/

//////////////////////////////////////////////////////////
//                   CONSTRUCTOR
//////////////////////////////////////////////////////////

/*
This function takes in the following arguments:
  resolutionWidth - a number representing the width in pixels of the camera (how many rays are cast on the X axis)
  resolutionHeight - a number representing the height in pixels of the camera (how many rays are cast on the Y axis)
*/
function RayCache(resolutionWidth, resolutionHeight)
{
	//store off the parameters
	this.m_resolutionWidth = resolutionWidth;
	this.m_resolutionHeight = resolutionHeight;

	//initialize this to null
	this.m_nextRayCacheIndex = null;

	//remember that we are dirty
	this.m_dirty = true;
}

//////////////////////////////////////////////////////////
//                   FUNCTIONS
//////////////////////////////////////////////////////////

RayCache.prototype.setResolution = function(width, height)
{
	//store off the parameters
	if(width)
		this.m_resolutionWidth = width;

	if(height)
		this.m_resolutionHeight = height;

	//remember that we are dirty
	this.m_dirty = true;	
}

RayCache.prototype.onCameraChanged = function()
{
	//whenever the camera changes, it invalidates our rays so remember that we are dirty
	this.m_dirty = true;
}

RayCache.prototype.update = function(width, height)
{
	//if we aren't dirty, nothing to do
	if(!this.m_dirty)
		return;

	//remember that we are no longer dirty
	this.m_dirty = false;

	//create a new array
	this.m_rayCache = new Array(this.m_resolutionWidth * this.m_resolutionHeight);
	this.m_nextRayCacheIndex = this.m_resolutionWidth * this.m_resolutionHeight;
}

RayCache.prototype.getOrCreateRayCache = function(rayIndex)
{
	//if we need to generate a new ray cache item
	if(rayIndex == null)
	{
		//store the new index
		rayIndex = this.m_nextRayCacheIndex;
		
		//increment the next ray cache index since we are using one
		this.m_nextRayCacheIndex++;		
	}

	//if there is no raycache item in this slot yet.  Happens due to the above, but also happens for the screen rays since they dont
	//go through this function to be created.  (OPTIMIZE: perhaps they should, so this if check doesn't have to happen for all rays each time)
	if(this.m_rayCache[rayIndex] == null)
	{
		this.m_rayCache[rayIndex] = {childRays: {}};
	}	

	//return the ray cache item and the newly created index
	return [this.m_rayCache[rayIndex],rayIndex];
}