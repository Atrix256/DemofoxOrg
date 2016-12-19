/*==================================================

Created by Alan Wolfe
jsraytrace{at}demofox.org
http://demofox.org

October 2011

==================================================*/

//////////////////////////////////////////////////////////
//                   CONSTRUCTOR
//////////////////////////////////////////////////////////

//this function expects a 3 array for n - the normal of the plane, and a scalar d
function PlanePrimitive(n,d)
{
	if(n)
		this.m_n = n;
	else
		this.m_n = [0,1,0];

	if(d)
		this.m_d = d;
	else
		this.m_d = 1;

	this.m_diffuseColor = [1,1,1];
	this.m_specularColor = [1,1,1];
	this.m_isLight = false;
	this.m_reflection = 0;
	this.m_diffuse = 1;
}

//////////////////////////////////////////////////////////
//                   FUNCTIONS
//////////////////////////////////////////////////////////

PlanePrimitive.prototype.getReflection = function()
{
	return this.m_reflection;
}

PlanePrimitive.prototype.setReflection = function(r)
{
	this.m_reflection = r;
}

PlanePrimitive.prototype.getDiffuse = function()
{
	return this.m_diffuse;
}

PlanePrimitive.prototype.setDiffuse = function(d)
{
	this.m_diffuse = d;
}

PlanePrimitive.prototype.getIsLight = function()
{
	return this.m_isLight;
}

PlanePrimitive.prototype.setIsLight = function(l)
{
	this.m_isLight = l;
}

PlanePrimitive.prototype.getDiffuseColor = function()
{
	return this.m_diffuseColor;
}

PlanePrimitive.prototype.getSpecularColor = function()
{
	return this.m_specularColor;
}

PlanePrimitive.prototype.setDiffuseColor = function(r,g,b)
{
	this.m_diffuseColor[0] = r;
	this.m_diffuseColor[1] = g;
	this.m_diffuseColor[2] = b;
}

PlanePrimitive.prototype.setSpecularColor = function(r,g,b)
{
	this.m_specularColor[0] = r;
	this.m_specularColor[1] = g;
	this.m_specularColor[2] = b;
}

PlanePrimitive.prototype.setColor = function(r,g,b)
{
	this.setDiffuseColor(r,g,b);
	this.setSpecularColor(r,g,b);
}

//get the normal at the specified point p (3 array)
PlanePrimitive.prototype.getNormal = function(p)
{
	return this.m_n;
}

//this function expects a Ray3 representing the ray
//it returns whether or not the ray intersects this plane and the "time" it intersects, if so
//adapted from "Real Time Collision Detection" 5.3.1
PlanePrimitive.prototype.rayIntersects = function(ray,maxDistance)
{
	/*
	var t = this.m_d - this.m_n.dot(ray.m_p) / this.m_n.dot(ray.m_v);

	//if t >= 0, compute and return intersection point
	if(t >= 0)
	{
		//compute the point of intersection
    	var q = ray.m_p.add(ray.m_v.multiplyScalar(t));

    	//return the collision info
		return [true, t, q];
	}

	//return that no collision happened
	return [false,0];
	*/


	var d = Vector3_dot(this.m_n,ray[1]);
	if (d != 0)
	{
		var dist = -(Vector3_dot(this.m_n,ray[0]) + this.m_d) / d;
		if (dist > 0)
		{
			//enforce a max distance if we should (should we just make a separate function to get rid of this if etc?)
			if(maxDistance != null)
			{
				if(dist > maxDistance)
				{
					return [false,0];
				}
			}			
			var t = dist;
			var q = Vector3_copy(ray[1]);
			Vector3_multiplyScalar(q,t);
			Vector3_add(q,ray[0]);
			return [true, t, q];
		}
	}
	return [false,0];

}

//////////////////////////////////////////////////////////
//               DEBUG FUNCTIONS
//////////////////////////////////////////////////////////