/*==================================================

Created by Alan Wolfe
jsraytrace{at}demofox.org
http://demofox.org

November 2011

==================================================*/

//////////////////////////////////////////////////////////
//                   CONSTRUCTOR
//////////////////////////////////////////////////////////

//this function expects three 3 arrays for the 3 points of the triangle
function TrianglePrimitive(a,b,c)
{
	this.m_points = [];
	this.m_points[0] = Vector3_copy(a);
	this.m_points[1] = Vector3_copy(b);
	this.m_points[2] = Vector3_copy(c);

	this.m_diffuseColor = [1,1,1];
	this.m_specularColor = [1,1,1];
	this.m_isLight = false;
	this.m_reflection = 0;
	this.m_diffuse = 1;

	//calculate the normal of the triangle and cache it off
	var ab = Vector3_copy(b);
	Vector3_subtract(ab,a);
	var ac = Vector3_copy(c);
	Vector3_subtract(ac,a);
	this.m_n = Vector3_cross(ab,ac);
	Vector3_normalize(this.m_n);

	//calculate the aabb of the triangle and cache it off
	this.m_aabb = new Array(6);

	//for points B and C
	for(var pointIndex = 0; pointIndex < 3; ++pointIndex)
	{
		//for eaxh axis
		for(var axisIndex = 0; axisIndex < 3; ++axisIndex)
		{
			//if the current point's current axis value is less than the aabb's minimum axis value
			//then set the new aabb minimum axis value
			if(pointIndex == 0 || this.m_points[pointIndex][axisIndex] < this.m_aabb[axisIndex])
			{
				this.m_aabb[axisIndex] = this.m_points[pointIndex][axisIndex];
			}

			//if the current point's current axis value is greater than the aabb's maximum axis value
			//then set the new aabb maximum axis value
			if(pointIndex == 0 || this.m_points[pointIndex][axisIndex] > this.m_aabb[axisIndex + 3])
			{
				this.m_aabb[axisIndex + 3] = this.m_points[pointIndex][axisIndex];
			}			
		}
	}
}

//////////////////////////////////////////////////////////
//                   FUNCTIONS
//////////////////////////////////////////////////////////

TrianglePrimitive.prototype.getReflection = function()
{
	return this.m_reflection;
}

TrianglePrimitive.prototype.setReflection = function(r)
{
	this.m_reflection = r;
}

TrianglePrimitive.prototype.getDiffuse = function()
{
	return this.m_diffuse;
}

TrianglePrimitive.prototype.setDiffuse = function(d)
{
	this.m_diffuse = d;
}

TrianglePrimitive.prototype.getIsLight = function()
{
	return false;
}

TrianglePrimitive.prototype.getDiffuseColor = function()
{
	return this.m_diffuseColor;
}

TrianglePrimitive.prototype.getSpecularColor = function()
{
	return this.m_specularColor;
}

TrianglePrimitive.prototype.setDiffuseColor = function(r,g,b)
{
	this.m_diffuseColor[0] = r;
	this.m_diffuseColor[1] = g;
	this.m_diffuseColor[2] = b;
}

TrianglePrimitive.prototype.setSpecularColor = function(r,g,b)
{
	this.m_specularColor[0] = r;
	this.m_specularColor[1] = g;
	this.m_specularColor[2] = b;
}

TrianglePrimitive.prototype.setColor = function(r,g,b)
{
	this.setDiffuseColor(r,g,b);
	this.setSpecularColor(r,g,b);
}

//get the normal at the specified point p (3 array)
TrianglePrimitive.prototype.getNormal = function(p)
{
	return Vector3_copy(this.m_n);
}

/*return the AABB of this primitive.
  returns a 6 array:
    0 - Min X
    1 - Min Y
    2 - Min Z
    3 - Max X
    4 - Max Y
    5 - Max Z
*/
TrianglePrimitive.prototype.getAABB = function()
{
	return this.m_aabb;
}

//this function expects a Ray3 representing the ray
//it returns whether or not the ray intersects this triange, the "time" it intersects and the intersection point, if so, as indices 0,1,2
//it also returns the barycentric coordinates as indices 3,4,5
//adapted from "Real Time Collision Detection" 5.3.6
TrianglePrimitive.prototype.rayIntersects = function(ray,maxDistance)
{
	//calculate n
	var ab = Vector3_copy(this.m_points[1]);
	Vector3_subtract(ab,this.m_points[0]);
	var ac = Vector3_copy(this.m_points[2]);
	Vector3_subtract(ac,this.m_points[0]);
	var n = Vector3_cross(ab,ac);

	//calculate d
	var qp = Vector3_copy(ray[1]);
	Vector3_multiplyScalar(qp,-1);
	var d = Vector3_dot(qp,n);
	if(d <= 0)
		return [false,0];

	//calculate e
	var ap = Vector3_copy(ray[0]);
	Vector3_subtract(ap,this.m_points[0]);
	var e = Vector3_cross(qp,ap);

	//calculate t
	var t = Vector3_dot(ap,n) / d;

	if(t < 0)
		return [false, 0];	

	//enforce a max distance if we should
	if(maxDistance != null)
	{
		if(t > maxDistance)
		{
			return [false,0];
		}
	}		

	//calculate v
	var v = Vector3_dot(ac,e) / d;

	//calculate w
	var w = -Vector3_dot(ab,e) / d;

	//calculate u
	var u = 1 - v - w;

	if(u < 0 || v < 0 || w < 0)
		return [false,0];

	//calculate the intersection point
	var intersectPoint = Vector3_copy(ray[1]);
	Vector3_multiplyScalar(intersectPoint,t);
	Vector3_add(intersectPoint,ray[0]);

	//return our data!
	return [true,t,intersectPoint,u,v,w];


	/*
	var ab = Vector3_copy(this.m_points[1]);
	Vector3_subtract(ab,this.m_points[0]);
	var ac = Vector3_copy(this.m_points[2]);
	Vector3_subtract(ac,this.m_points[0]);

	//our barycentric coordiantes
	var u;
	var v;
	var w;
	
	//calcualte qp (not pq!)
	var qp = Vector3_copy(ray[1]);
	Vector3_multiplyScalar(qp,-1);

	//compute triangle normal. can be precalculated or cached if intersecting
	//multiple segments against the same triangle (we are precalculating it yep)
	var n = Vector3_copy(this.m_n);

	//compute denominator d.  If d <= 0, segment is parallel or points away from triangle
	//so exit early
	var d = Vector3_dot(qp,n);
	if(d <= 0)
		return [false,0];

	//compute intersection t value of pq with plane of triangle. A ray
	//intersects iff 0 <= t.  Segment intersects iff 0 <= t <= 1. Delay
	//dividing by d until intersection has been found to pierce triangle
	var ap = Vector3_copy(ray[0]);
	Vector3_subtract(ap,this.m_points[0]);
	var t = Vector3_dot(ap,n);

	if(t < 0)
		return [false, 0];

	//enforce a max distance if we should
	if(maxDistance != null)
	{
		if(t * d > maxDistance)
		{
			return [false,0];
		}
	}

	//turn off this test to get a plane test
	if(false)
	{
		//compute barycentric coordinate components and test if within bounds
		var e = Vector3_cross(qp,ap);
		v = Vector3_dot(ac,e);
		if(v < 0 || v > d)
			return [false,0];

		w = -Vector3_dot(ab,e);
		if(w < 0 || v + w > d)
			return [false,0];

		var ood = 1 / d;
		v *= ood;
		w *= ood;	
		u = 1 - v - w;	
	}
	else if(true)
	{
		var ood = 1 / d;
		t *= ood;

		//calculate the intersection point
		var intersectPoint = Vector3_copy(ray[1]);
		Vector3_multiplyScalar(intersectPoint,t);
		Vector3_add(intersectPoint,ray[0]);
			
		//calculate barrycentric coordinates and make sure we are in the triangle
		var v0 = Vector3_copy(this.m_points[2]);
		Vector3_subtract(v0,this.m_points[0]);

		var v1 = Vector3_copy(this.m_points[1]);
		Vector3_subtract(v0,this.m_points[0]);		

		var v2 = Vector3_copy(intersectPoint);
		Vector3_subtract(v0,this.m_points[0]);

		var dot00 = Vector3_dot(v0, v0);
		var dot01 = Vector3_dot(v0, v1);
		var dot02 = Vector3_dot(v0, v2);
		var dot11 = Vector3_dot(v1, v1);
		var dot12 = Vector3_dot(v1, v2);

		var invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
		u = (dot11 * dot02 - dot01 * dot12) * invDenom;
		v = (dot00 * dot12 - dot01 * dot02) * invDenom;
		w = 1 - u - v;	

		if((u >= 0) && (v >= 0) && (w >= 0))
		{
			return [true,t,intersectPoint,u,v,w];
		}
		else
		{
			return [false,0];
		}
	}
	//plane test
	else
	{
		//segment / ray intersects triangle.  Preform delayed division and compute the last barycentric coordinate component
		var ood = 1 / d;
		t *= ood;

		//calculate the intersection point
		var intersectPoint = Vector3_copy(ray[1]);
		Vector3_multiplyScalar(intersectPoint,t);
		Vector3_add(intersectPoint,ray[0]);

		//return our data!
		return [true,t,intersectPoint,u,v,w];
	}
	*/
}

//////////////////////////////////////////////////////////
//               DEBUG FUNCTIONS
//////////////////////////////////////////////////////////