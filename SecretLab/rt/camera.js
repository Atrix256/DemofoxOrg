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
  eye - a 3 array representing where the eye (camera) is, in 3d space
  target - a 3 array representing where the eye's target (what it's looking at) is, in 3d space
  up - a 3 array representing the up vector - ie which direction is "up" relative to the camera
  resolutionWidth - a number representing the width in pixels of the camera (how many rays are cast on the X axis)
  resolutionHeight - a number representing the height in pixels of the camera (how many rays are cast on the Y axis)
  viewWidth - a number representing the width in world units, of the rectangle that is mapped to the pixels
  viewHeight - a number representing the height in world units, of the rectangle that is mapped to the pixels
*/
function Camera(scene, eye, target, up, resolutionWidth, resolutionHeight, viewWidth, viewHeight)
{	
	//store the parameters
	if(eye)
		this.m_eye = Vector3_copy(eye);
	else
		this.m_eye = [0,0,0];

	if(target)
		this.m_target = Vector3_copy(target);
	else
		this.m_target = [0,0,10];

	if(up)
		this.m_up = Vector3_copy(up);
	else
		this.m_up = [0,1,0];

	if(resolutionWidth)
		this.m_resolutionWidth = resolutionWidth;
	else
		this.m_resolutionWidth = 100;

	if(resolutionHeight)
		this.m_resolutionHeight = resolutionHeight;
	else
		this.m_resolutionHeight = 100;

	if(viewWidth)
		this.m_viewWidth = viewWidth;
	else
		this.m_viewWidth = 8;

	if(viewHeight)
		this.m_viewHeight = viewHeight;
	else
		this.m_viewHeight = 8;

	//we are not in ortho mode until we are specifically told to go into ortho mode
	this.m_orthoMode = false;

	//create the ray cache for this camera
	this.m_rayCache = new RayCache(this.m_resolutionWidth , this.m_resolutionHeight);
	
	//store the scene this camera uses
	this.m_scene = scene;

	//red blue 3d isn't on til it's explicitly turned on
	this.m_redBlue3dOn = false;

	//the 3d offset for red/blue 3d mode
	this.m_3dOffset = [1,0,0];

	//mark that we are dirty
	this.m_dirty = true;
}

//////////////////////////////////////////////////////////
//                   FUNCTIONS
//////////////////////////////////////////////////////////

Camera.prototype.update = function()
{

	//update the secondary camera if there is one
	if(this.m_redBlueCamera)
		this.m_redBlueCamera.update();

	//update the ray cache
	this.m_rayCache.update();

	//if the camera isn't dirty, it doesn't need an update
	if(!this.m_dirty)
		return;

	//else, we are going to update it so mark it as clean
	this.m_dirty = false;

	//calculate our camera's forward and right vectors
	var vecFwd = Vector3_copy(this.m_target);
	Vector3_subtract(vecFwd,this.m_eye);
	Vector3_normalize(vecFwd);
	var vecLeft = Vector3_cross(vecFwd,this.m_up);

	//make space for how many rays we are going to have
	this.m_rays = new Array(this.m_resolutionWidth * this.m_resolutionHeight);

	//loop through all the rows
	var percenty = -0.5;
	var rayIndex = 0;
	var deltax = 1 / this.m_resolutionWidth;
	var deltay = 1 / this.m_resolutionHeight;
	for(indexy = 0; indexy < this.m_resolutionHeight; indexy++)
	{
		var percentx = -0.5;
		var verticalComponent = Vector3_copy(this.m_up);
		Vector3_multiplyScalar(verticalComponent,this.m_viewHeight * percenty);
		//loop through all the columns
		for(var indexx = 0; indexx < this.m_resolutionWidth; indexx++)
		{
			//calculate the current normalized vector
			var dir = Vector3_copy(this.m_target);
			var left = Vector3_copy(vecLeft);
			Vector3_multiplyScalar(left,this.m_viewWidth  * percentx);
			Vector3_subtract(dir,left);
			Vector3_subtract(dir,verticalComponent);

			var origin = Vector3_copy(this.m_eye);
			if(this.m_orthoMode)
			{
				Vector3_subtract(origin,left);
				Vector3_subtract(origin,verticalComponent);				
			}

			Vector3_subtract(dir,origin);
			Vector3_normalize(dir);

			this.m_rays[rayIndex] = [origin,[dir[0],dir[1],dir[2]]];

			//move to the next ray destination percent on the x axis
			percentx += deltax;

			//move to the next ray
			rayIndex++;
		}

		//move to the next ray destination percent on the y axis
		percenty += deltay;
	}
}

//this function returns the cached ray for the specified ray index
Camera.prototype.getRay = function(rayIndex)
{
	return this.m_rays[rayIndex];
}

/*
This function takes in the following arguments:
  eye - a 3 array representing where the eye (camera) is, in 3d space
  target - a 3 array representing where the eye's target (what it's looking at) is, in 3d space
  up - a 3 array representing the up vector - ie which direction is "up" relative to the camera
*/
Camera.prototype.lookAt = function(eye, target, up)
{
	if(this.m_redBlueCamera)
	{
		var otherEye = Vector3_copy(eye);
		var otherTarget = Vector3_copy(target);
		Vector3_add(otherEye, this.m_3dOffset);
		Vector3_add(otherTarget, this.m_3dOffset);
		this.m_redBlueCamera.lookAt(otherEye, otherTarget, up);
	}

	//store the parameters
	if(eye)
		this.m_eye = Vector3_copy(eye);

	if(target)
		this.m_target = Vector3_copy(target);

	if(up)
		this.m_up = Vector3_copy(up);
		
	//throw out all cached data
	this.setDirty();
}

/*
This function takes in the following arguments:
  width - a number representing the width in pixels of the camera (how many rays are cast on the X axis)
  height - a number representing the height in pixels of the camera (how many rays are cast on the Y axis)
*/
Camera.prototype.setResolution = function(width, height)
{
	if(this.m_redBlueCamera)
		this.m_redBlueCamera.setResolution(width,height);

	//store the parameters
	if(width)
		this.m_resolutionWidth = width;

	if(height)
		this.m_resolutionHeight = height;

	//mark that we are dirty
	this.m_dirty = true;		

	//tell our ray cache about the change
	this.m_rayCache.setResolution(this.m_resolutionWidth, this.m_resolutionHeight);	
}

/*
This function takes in the following arguments:
  width - a number representing the width in world units, of the rectangle that is mapped to the pixels
  height - a number representing the height in world units, of the rectangle that is mapped to the pixels
*/
Camera.prototype.setViewRectSize = function(width, height)
{
	if(this.m_redBlueCamera)
		this.m_redBlueCamera.setViewRectSize(width,height);

	//store the parameters
	if(width)
		this.m_viewWidth = width;

	if(height)
		this.m_viewHeight = height;

	//throw out all cached data
	this.setDirty();
}

//this function takes a bool saying whether the camera should be in ortho mode or not
Camera.prototype.setOrthoMode = function(orthoMode)
{
	if(this.m_redBlueCamera)
		this.m_redBlueCamera.setOrthoMode(orthoMode);

	//set the ortho mode
	this.m_orthoMode = orthoMode;

	//throw out all cached data
	this.setDirty();
}

Camera.prototype.setRedBlue3d = function (redBlue3d)
{
	//remember whether red blue is on or not
	this.m_redBlue3dOn = redBlue3d;

	//if we are turning on red blue 3d mode, create a subcamera for the second view
	if(redBlue3d)
	{
		var otherEye = Vector3_copy(this.m_eye);
		var otherTarget = Vector3_copy(this.m_target);
		Vector3_add(otherEye, this.m_3dOffset);
		Vector3_add(otherTarget, this.m_3dOffset);
				
		this.m_redBlueCamera = new Camera(this.m_scene,
										  otherEye,
										  otherTarget,
										  this.m_up,
										  this.m_resolutionWidth,
										  this.m_resolutionHeight,
										  this.m_viewWidth,
										  this.m_viewHeight);
	}
}

Camera.prototype.setScene = function(scene)
{
	if(this.m_redBlueCamera)
		this.m_redBlueCamera.setScene(scene);

	//set the new scene
	this.m_scene = scene;

	//throw out all cached data
	this.setDirty();
}

Camera.prototype.isDirty = function()
{
	return this.m_dirty;
}

//this function is used to invalidate the camera's data.  this is useful if you ever just need to invalidate all cached data
Camera.prototype.setDirty = function()
{
	if(this.m_redBlueCamera)
		this.m_redBlueCamera.setDirty();

	//mark that we are dirty
	this.m_dirty = true;		

	//tell our ray cache that the camera was changed (invalidated in this case, so it should be invalidated too)
	this.m_rayCache.onCameraChanged();	
}

Camera.prototype.getColorForRay = function(rayIndex,g_maxRayBounce, shadingOn, reflectionsOn, shadowsOn)
{
	//get the color for this ray
	var colorForRay = this.m_scene.getColorForRay(this.m_rayCache,this.m_rays[rayIndex],rayIndex,g_maxRayBounce, shadingOn, reflectionsOn, shadowsOn);

	//if there's a red blue camera
	if(this.m_redBlue3dOn && this.m_redBlueCamera)
	{
		//convert the color we already have as grey scale and put it in the red channel
		var colorAverage = (colorForRay[0] + colorForRay[1] + colorForRay[2]) / 3;
		colorForRay[0] = colorAverage;
		colorForRay[1] = 0;
		colorForRay[2] = 0;

		//get the other ray color
		var otherColorForRay = this.m_redBlueCamera.getColorForRay(rayIndex,g_maxRayBounce, shadingOn, reflectionsOn, shadowsOn);

		//convert it to grey scale and store it in the blue and green channel
		colorAverage = (otherColorForRay[0] + otherColorForRay[1] + otherColorForRay[2]) / 3;
		colorForRay[1] = 0;
		colorForRay[2] = colorAverage;
	}

	//return our color
	return colorForRay;
}

//////////////////////////////////////////////////////////
//               DEBUG FUNCTIONS
//////////////////////////////////////////////////////////
