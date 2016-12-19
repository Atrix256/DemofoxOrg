/*==================================================

Created by Alan Wolfe
jsraytrace{at}demofox.org
http://demofox.org

October 2011

==================================================*/

//////////////////////////////////////////////////////////
//                   CONSTRUCTOR
//////////////////////////////////////////////////////////

function SceneGraph(parentScene, gridSize)
{
	this.m_parentScene = parentScene;
	this.m_gridSize = gridSize;

	this.m_sparsePrimitiveGrid = {};
	this.m_primitiveList = [];
}

//////////////////////////////////////////////////////////
//                   FUNCTIONS
//////////////////////////////////////////////////////////

SceneGraph.prototype.roundDownToGridSize = function(value)
{
	return Math.floor(value / this.m_gridSize) * this.m_gridSize;
}

SceneGraph.prototype.roundUpToGridSize = function(value)
{
	return Math.ceil(value / this.m_gridSize) * this.m_gridSize;
}

SceneGraph.prototype.calculateGridSquare = function(value)
{
	return Math.floor((value / this.m_gridSize));
}

SceneGraph.prototype.calculateTimeToGridSquareEdge = function(value, delta)
{
	if(delta < 0)
	{
		return (this.roundDownToGridSize(value) - value) / delta;
	}
	//if delta is 0, javascript seems to return infinity instead of making a divide by zero.
	//that's the right answer so shrug... not even going to check for that case
	else
	{
		return (this.roundUpToGridSize(value) - value) / delta;
	}
}

SceneGraph.prototype.pointInGrid = function(point)
{
	//for each axis
	for(var index = 0; index < 3; ++index)
	{
		//if it's less than the min or greater than the max, it isn't in the grid
		if(point[index] < this.m_gridAABB[index] || point[index] > this.m_gridAABB[index + 3])
		{
			return false;
		}
	}

	//if we got here, the point is in the grid
	return true;
}

SceneGraph.prototype.fitAABB = function(aabb)
{
	adjustedAABB = new Array(6);

	//mind
	adjustedAABB[0] = this.roundDownToGridSize(aabb[0]);
	adjustedAABB[1] = this.roundDownToGridSize(aabb[1]);
	adjustedAABB[2] = this.roundDownToGridSize(aabb[2]);

	//max
	adjustedAABB[3] = this.roundUpToGridSize(aabb[3]);
	adjustedAABB[4] = this.roundUpToGridSize(aabb[4]);
	adjustedAABB[5] = this.roundUpToGridSize(aabb[5]);

	//if we have no grid AABB yet, make an aabb to hold this primitive
	if(this.m_gridAABB == null)
	{
		this.m_gridAABB = new Array(6);

		//min
		this.m_gridAABB[0] = adjustedAABB[0];
		this.m_gridAABB[1] = adjustedAABB[1];
		this.m_gridAABB[2] = adjustedAABB[2];

		//max
		this.m_gridAABB[3] = adjustedAABB[3];
		this.m_gridAABB[4] = adjustedAABB[4];
		this.m_gridAABB[5] = adjustedAABB[5];
	}
	//else, we need to possibly adjust the grid's AABB to encompass this aabb
	else
	{
		//min
		if(adjustedAABB[0] < this.m_gridAABB[0])
			this.m_gridAABB[0] = adjustedAABB[0];

		if(adjustedAABB[1] < this.m_gridAABB[1])
			this.m_gridAABB[1] = adjustedAABB[1];
			
		if(adjustedAABB[2] < this.m_gridAABB[2])
			this.m_gridAABB[2] = adjustedAABB[2];						

		//max
		if(adjustedAABB[3] > this.m_gridAABB[3])
			this.m_gridAABB[3] = adjustedAABB[3];		

		if(adjustedAABB[4] > this.m_gridAABB[4])
			this.m_gridAABB[4] = adjustedAABB[4];	

		if(adjustedAABB[5] > this.m_gridAABB[5])
			this.m_gridAABB[5] = adjustedAABB[5];
	}
}

SceneGraph.prototype.addPrimitive = function(primitive)
{
	//get the primitive's bounding box
	var aabb = primitive.getAABB();

	//make sure we can hold this aabb
	this.fitAABB(aabb);

	//mark the grid up with this ID
	this.markGridWithPrimitiveID(aabb,primitive.m_ID);

	//add it to the primitive list
	this.m_primitiveList.push(primitive.m_ID);
}

SceneGraph.prototype.markGridWithPrimitiveID = function (aabb,ID)
{
	gridRanges = new Array(6);

	//min
	gridRanges[0] = this.calculateGridSquare(aabb[0]);
	gridRanges[1] = this.calculateGridSquare(aabb[1]);
	gridRanges[2] = this.calculateGridSquare(aabb[2]);

	//max
	gridRanges[3] = this.calculateGridSquare(aabb[3]);
	gridRanges[4] = this.calculateGridSquare(aabb[4]);
	gridRanges[5] = this.calculateGridSquare(aabb[5]);

	//3 dimensional loop to mark each cell with the primitive ID
	for(var x = gridRanges[0]; x <= gridRanges[3]; ++x)
	{
		for(var y = gridRanges[1]; y <= gridRanges[4]; ++y)
		{
			for(var z = gridRanges[2]; z <= gridRanges[5]; ++z)
			{
				var key = x + "_" + y + "_" + z;
				
				if(this.m_sparsePrimitiveGrid[key] == null)
					this.m_sparsePrimitiveGrid[key] = new Array;

				this.m_sparsePrimitiveGrid[key].push(ID);
			}
		}
	}
}

SceneGraph.prototype.getRayIntersection = function(ray, maxDistance, testLights, ignorePrimitiveID)
{
	var rayPos = [ray[0][0], ray[0][1], ray[0][2]];

	var rayTimeStart = 0;
	var rayTimeEnd = maxDistance;

	if(testLights == null)
		testLights = true;

	//move the point down the ray to hit the m_gridAABB if it can (and we aren't already in the box!)
	//for each axis...
	for(var index = 0; index < 3; ++index)
	{
		//if the ray starts before the minimum
		if( rayPos[index] < this.m_gridAABB[index] )
		{
			//if the ray dir isn't going towards the minimum, it misses the box so bail out!
			if(ray[1][index] <= 0)
			{
				//alert("1) bailing out on axis " + index);
				return [-1,0,[0,0,0]];
			}

			//else it is moving towards the mimimum so let's move there!  Add a little extra to go inside
			var time = (( this.m_gridAABB[index] - rayPos[index] ) / ray[1][index]) + 0.01;
			rayPos[0] = rayPos[0] + ray[1][0] * time;
			rayPos[1] = rayPos[1] + ray[1][1] * time;
			rayPos[2] = rayPos[2] + ray[1][2] * time;

			//remember that we've moved this distance down the ray
			rayTimeStart += time;
		}
		//else if the ray starts after the maximum
		else if( rayPos[index] > this.m_gridAABB[index + 3] )
		{
			//if the ray dir isn't going towards the maximum, it misses the box so bail out!
			if(ray[1][index] >= 0)
			{
				//alert("2) bailing out on axis " + index);
				return [-1,0,[0,0,0]];
			}

			//else it is moving towards the maximum so let's move there!  Add a little extra to go inside
			var time = (( this.m_gridAABB[index + 3] - rayPos[index] ) / ray[1][index]) + 0.01;
			rayPos[0] = rayPos[0] + ray[1][0] * time;
			rayPos[1] = rayPos[1] + ray[1][1] * time;
			rayPos[2] = rayPos[2] + ray[1][2] * time;			

			//remember that we've moved this distance down the ray
			rayTimeStart += time;			
		}
		//else the ray starts between the min and max, so leave it where it is!
	}

	//if we aren't in the box, bail
	if(!this.pointInGrid(rayPos))
	{
		//alert("3) bailing out on axis " + index);
		return [-1,0,[0,0,0]];
	}

	//calculate where we are in the grid 
	var gridPos = [];

	//init some vars to start out
	var closestIndex = -1;
	var closestDistance = 0;
	var collisionPoint = [0,0,0];
	var gridPos = [];

	//go until we run outa grid, or we hit something
	while(true)
	{
		//calculate where we are in the grid
		for(var index = 0; index < 3; ++index)
		{
			gridPos[index] = this.calculateGridSquare(rayPos[index]);
		}
			
		//make the key for this grid square
		var key = gridPos[0] + "_" + gridPos[1] + "_" + gridPos[2];

		//calculate our distance to each next grid cell edge
		var timeToEdges = []
		for(var index = 0; index < 3; ++index)
		{
			timeToEdges[index] = this.calculateTimeToGridSquareEdge(rayPos[index],ray[1][index]);
		}

		//find which axis is the shortest travel to the next grid cell edge
		var shortestAxis = 0;
		if(timeToEdges[1] < timeToEdges[shortestAxis])
		{
			shortestAxis = 1;
		}
		if(timeToEdges[2] < timeToEdges[shortestAxis])
		{
			shortestAxis = 2;
		}		

		//if there's anything in this grid cell
		if(this.m_sparsePrimitiveGrid[key] != null)
		{
			//see if we hit anything in the current cell
			var primitiveList = this.m_sparsePrimitiveGrid[key];
			for(var index = 0; index < primitiveList.length; ++index)
			{
				//get the current primitive
				var primitiveIndex = primitiveList[index];

				if(primitiveIndex != ignorePrimitiveID)
				{
					var prim = this.m_parentScene.m_primitives[primitiveIndex];

					//only test if we should test lights or this is not a light
					if(testLights || !prim.getIsLight())
					{
						//see if the ray collides with the primitive
						var collisionResults = prim.rayIntersects([rayPos,ray[1]],rayTimeEnd);

						//if there was a collision
						if(collisionResults[0])
						{
							//if the collision occured in this grid cell
							if(collisionResults[1] < timeToEdges[shortestAxis])
							{
								//if we don't have another collision yet, or it's a closer collision
								if(closestIndex == -1 || collisionResults[1] < closestDistance)
								{
									closestDistance = collisionResults[1];
									closestIndex = primitiveIndex;
									collisionPoint = collisionResults[2];
								}
							}
						}
					}
				}
			}
		}

		//if we've found a hit, return it
		if(closestIndex != -1)
		{
			return [closestIndex, closestDistance + rayTimeStart , collisionPoint];
		}

		//store the shortest time that it takes to get to the next grid cell, and add a lil to enter into the cell instead of being stuck at the edge
		var time = timeToEdges[shortestAxis] + 0.01;

		//remember that we've moved this distance down the ray
		rayTimeStart += time;				

		//advance the ray to the next cell
		for(var index = 0; index < 3; ++index)
		{
			rayPos[index] = rayPos[index] + ray[1][index] * time;
		}

		//if we are now outside of the box, return no hit
		if(!this.pointInGrid(rayPos))
		{
			return [-1,0,[0,0,0]];
		}

		//if we were given a max distance, make sure we haven't gone beyond it
		if(rayTimeEnd != null)
		{
			rayTimeEnd -= time;

			//if we've gone too far, bail
			if(rayTimeEnd < 0 )
			{
				return [-1,0,[0,0,0]];
			}
		}

		//todo: fix this instead of recalculating all 3 from the source
		/*
		//advance our grid position to the next cell
		if(ray[1][shortestAxis] > 0)
		{
			gridPos[shortestAxis]++;
		}
		else
		{
			gridPos[shortestAxis]--;
		}
		*/

		//calculate which grid cell we are in now
		for(var index = 0; index < 3; ++index)
		{
			gridPos[index] = this.calculateGridSquare(rayPos[index]);
		}		
	}
}