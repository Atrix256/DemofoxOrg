/*==================================================

Created by Alan Wolfe
jsraytrace{at}demofox.org
http://demofox.org

October 2011

==================================================*/

//////////////////////////////////////////////////////////
//                   CONSTRUCTOR
//////////////////////////////////////////////////////////

function Scene(gridSize)
{
	this.m_primitives = [];
	this.m_scenegraph = new SceneGraph(this,gridSize);
	this.m_nextPrimitiveID = 0;
}

//////////////////////////////////////////////////////////
//                   FUNCTIONS
//////////////////////////////////////////////////////////


//this function takes a 3 array "point" and the primitive index of the light
//this function returns true if a line segment from the collision point can reach the light, else it returns false
Scene.prototype.PointShadowedFromLight = function(point,collisionPrimitiveIndex,lightPrimitiveIndex)
{
	//get the vector from the point to the light and the distance of that vector
	var vector = Vector3_copy(this.m_primitives[lightPrimitiveIndex].m_p);
	var distance = Vector3_length(vector);
	vector[0] /= distance;
	vector[1] /= distance;
	vector[2] /= distance;


	//see if we hit anything
	var collisionResults = this.m_scenegraph.getRayIntersection([point,vector],distance, false, collisionPrimitiveIndex);

	//return whether or not we did
	return collisionResults[0] != -1;
}

//this function expects a Ray3 and returns an array with 3 elements representing the R,G,B values of the pixel, in the form of 0 to 1
Scene.prototype.getColorForRay = function(rayCache,ray,rayIndex,bouncesAllowed, shadingOn, reflectionsOn, shadowsOn)
{
	//if we've gone too deep, just return black
	if(bouncesAllowed < 0)
	{
		return [0,0,0];
	}

	//get our cache item from the ray cache
	var rayCacheItem = rayCache.getOrCreateRayCache(rayIndex)[0];

	var closestIndex = -1;
	var closestDistance = 0;
	var collisionPoint = [0,0,0];

	//if we don't have an item in the ray cache, fill in our ray cache
	if(rayCacheItem.intersectionInfo == null)
	{
		//find what our ray hits and store it in the cache
		rayCacheItem.intersectionInfo = this.m_scenegraph.getRayIntersection(ray);
	}

	//get our intersection info from the cache
	closestIndex = rayCacheItem.intersectionInfo[0];
	closestDistance = rayCacheItem.intersectionInfo[1];
	collisionPoint = rayCacheItem.intersectionInfo[2];

	//if no closest found, return black and no intersection info
	if(closestIndex == -1)
		return [0,0,0];

	//return the diffuse, unshaded color if shading isn't on
	if(this.m_primitives[closestIndex].getIsLight() || !shadingOn)
		return Vector3_copy(this.m_primitives[closestIndex].getDiffuseColor());

	//our accumulated color, which will be made up of various sources based on which features are present for this primitive
	var accumulatedColor = [0,0,0];

	//if we should render reflections and this primitive has a reflection
	if(reflectionsOn && this.m_primitives[closestIndex].getReflection() > 0)
	{			
		//if we don't have any cached reflection info, calculate it
		if(rayCacheItem.reflectionRayInfo  == null)
		{
			rayCacheItem.reflectionRayInfo = {}

			//calculate the reflection ray
			//vector3 R = a_Ray.GetDirection() - 2.0f * DOT( a_Ray.GetDirection(), N ) * N;
			var N = this.m_primitives[closestIndex].getNormal(collisionPoint);
			var temp = Vector3_copy(N);
			Vector3_multiplyScalar(temp,Vector3_dot(ray[1],N) * 2);
			var R = Vector3_copy(ray[1]);
			Vector3_subtract(R,temp);

			//push our collision point down the ray a tiny amount so our bounce trace doesn't hit this same object again
			var point = Vector3_copy(R);
			Vector3_multiplyScalar(point,0.01);
			Vector3_add(point,collisionPoint);

			//store the reflected ray
			rayCacheItem.reflectionRayInfo.reflectionRay = [point,R];

			//if we don't have a cache item for this reflection ray yet, we need to make one
			if(rayCacheItem.childRays.reflectionRayIndex == null)
			{
				rayCacheItem.childRays.reflectionRayIndex = rayCache.getOrCreateRayCache(null)[1];
			}
		}

		//get the reflected color
		var reflectedColor = this.getColorForRay(rayCache,rayCacheItem.reflectionRayInfo.reflectionRay,rayCacheItem.childRays.reflectionRayIndex,bouncesAllowed - 1,shadingOn, reflectionsOn, shadowsOn);

		//scale it by how much reflection there is
		Vector3_multiplyScalar(reflectedColor,this.m_primitives[closestIndex].getReflection());

		//multiply the reflectedColor by the diffuse color
		Vector3_multiply(reflectedColor,this.m_primitives[closestIndex].getDiffuseColor());

		//add the reflected color into the accumulated color
		Vector3_add(accumulatedColor,reflectedColor);
	}

	//if we don't have lighting info cached, we need to gather that info
	if(!rayCacheItem.lightingInfo)
	{
		rayCacheItem.lightingInfo = [];

		for(var index = 0; index < this.m_primitives.length; index++)
		{
			if(this.m_primitives[index].getIsLight())
			{
				var newLightingInfoItem = {};

				//remember the primitive index of our light
				newLightingInfoItem.lightPrimitiveIndex = index;

				//no shadow calculations yet
				newLightingInfoItem.shade = 1.0;

				//if we should calculate shadows, let's see if anything is between the collision point and the light
				if(shadowsOn)
				{
					if(this.PointShadowedFromLight(collisionPoint,closestIndex,index))
						newLightingInfoItem.shade = 0.0;
				}

				//only consider lights that are visible from the collision point (ie contributes to the color)
				if(newLightingInfoItem.shade > 0)
				{
					//don't add this light unless it contributes
					var addThisLight = false;

					//gather our diffuse information
					{
						newLightingInfoItem.diffuseInfo = {};

						//get the normalized vector from the collision point to the light point
						collisionPointToLight = Vector3_copy(this.m_primitives[index].m_p);
						Vector3_subtract(collisionPointToLight,collisionPoint);
						Vector3_normalize(collisionPointToLight);

						//get the normal of the primitive at the intersection point
						normal = this.m_primitives[closestIndex].getNormal(collisionPoint);
						
						newLightingInfoItem.diffuseInfo.dot = Vector3_dot(normal,collisionPointToLight);

						newLightingInfoItem.diffuseInfo.diffuseAmount = newLightingInfoItem.diffuseInfo.dot * newLightingInfoItem.shade;

						//if this light contributes diffuse, add it to the cache
						if(newLightingInfoItem.diffuseInfo.dot > 0)
						{
							addThisLight = true;
						}
					}

					//gather our specular information
					{
						newLightingInfoItem.specularInfo = {};

						//L is the vector from the intersection point to the light source
						L = Vector3_copy(this.m_primitives[index].m_p);
						Vector3_subtract(L,collisionPoint);
						Vector3_normalize(L);
						
						//N is the normal at the contact point
						N = this.m_primitives[closestIndex].getNormal(collisionPoint);
						
						//vector3 V = a_Ray.GetDirection();
						V = Vector3_copy(ray[1]);

						//vector3 R = L - 2.0f * DOT( L, N ) * N;
						var temp = Vector3_copy(N);
						Vector3_multiplyScalar(temp, 2.0 * Vector3_dot(L,N));
						R = Vector3_copy(L);			
						Vector3_subtract(R,temp);	
						
						newLightingInfoItem.specularInfo.dot = Vector3_dot(V,R);

						newLightingInfoItem.specularInfo.specularAmount = Math.pow(newLightingInfoItem.specularInfo.dot,20) * newLightingInfoItem.shade;

						//if this light contributes specular, add it to the cache
						if(newLightingInfoItem.specularInfo.dot > 0)
						{
							addThisLight = true;
						}
					}

					//only add this light if it contributes to the color
					if(addThisLight)
						rayCacheItem.lightingInfo.push(newLightingInfoItem);					
				}
			}
		}
	}

	//calculate the color using the phong shading model and our cached lighting data
	for(var index = 0; index < rayCacheItem.lightingInfo.length; index++)
	{
		var lightInfo = rayCacheItem.lightingInfo[index];

		var diffuseAmount = this.m_primitives[closestIndex].getDiffuse();
		var specularAmount = 1.0 - diffuseAmount;	

		var lightPrimitiveIndex = lightInfo.lightPrimitiveIndex;
		
		//if this primitive has diffuse
		if(diffuseAmount > 0)
		{
			if(lightInfo.diffuseInfo.dot > 0)
			{
				var diffuseColor = Vector3_copy(this.m_primitives[closestIndex].getDiffuseColor());
				Vector3_multiplyScalar(diffuseColor,lightInfo.diffuseInfo.diffuseAmount * diffuseAmount);
				Vector3_multiply(diffuseColor,this.m_primitives[lightPrimitiveIndex].getDiffuseColor());
				Vector3_add(accumulatedColor,diffuseColor);
			}
		}

		if(specularAmount > 0)
		{
			if(lightInfo.specularInfo.dot > 0)
			{
				var specularColor = Vector3_copy(this.m_primitives[closestIndex].getSpecularColor());
				Vector3_multiplyScalar(specularColor,lightInfo.specularInfo.specularAmount * specularAmount);
				Vector3_add(accumulatedColor,specularColor);
			}
		}
	}

	//return our accumulated color
	return accumulatedColor;
}

Scene.prototype.addPrimitive = function(newPrimitive) 
{
	//add it to the primitive list
	this.m_primitives.push(newPrimitive);	

	//give it a unique ID
	newPrimitive.m_ID = this.m_nextPrimitiveID;
	this.m_nextPrimitiveID++;		

	//add it to the scene graph
	this.m_scenegraph.addPrimitive(newPrimitive);	
}

//this function expects three 3 array's for the 3 points of the triangle
Scene.prototype.addTriangle = function(a,b,c)
{
	//create a new triangle and add it to the primitive list
	var newPrimitive = new TrianglePrimitive(a,b,c);

	//add it to the scene
	this.addPrimitive(newPrimitive);

	//return the primitive so that the material etc can be set
	return newPrimitive;
}

//this function expects a 3 array for p - the center of the sphere, and a radius r
Scene.prototype.addSphere = function(p,r)
{
	//create a new sphere and add it to the primitive list
	var newPrimitive = new SpherePrimitive(p,r);

	//add it to the scene
	this.addPrimitive(newPrimitive);

	//return the primitive so that the material etc can be set
	return newPrimitive;
}

//////////////////////////////////////////////////////////
//               DEBUG FUNCTIONS
//////////////////////////////////////////////////////////