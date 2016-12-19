/*==================================================

Created by Alan Wolfe
jsraytrace{at}demofox.org
http://demofox.org

October 2011

==================================================*/

//////////////////////////////////////////////////////////
//                   CONSTRUCTOR
//////////////////////////////////////////////////////////

//this function expects a 3 array for p - the center of the sphere, and a radius r
function SpherePrimitive(p,r)
{
	if(p)
		this.m_p = p;
	else
		this.m_p = [0,0,0];

	if(r)
		this.m_r = r;
	else
		this.m_r = 1;

	this.m_diffuseColor = [1,1,1];
	this.m_specularColor = [1,1,1];
	this.m_isLight = false;
	this.m_reflection = 0;
	this.m_diffuse = 1;
}

//////////////////////////////////////////////////////////
//                   FUNCTIONS
//////////////////////////////////////////////////////////

SpherePrimitive.prototype.getReflection = function()
{
	return this.m_reflection;
}

SpherePrimitive.prototype.setReflection = function(r)
{
	this.m_reflection = r;
}

SpherePrimitive.prototype.getDiffuse = function()
{
	return this.m_diffuse;
}

SpherePrimitive.prototype.setDiffuse = function(d)
{
	this.m_diffuse = d;
}

SpherePrimitive.prototype.getIsLight = function()
{
	return this.m_isLight;
}

SpherePrimitive.prototype.setIsLight = function(l)
{
	this.m_isLight = l;
}

SpherePrimitive.prototype.getDiffuseColor = function()
{
	return this.m_diffuseColor;
}

SpherePrimitive.prototype.getSpecularColor = function()
{
	return this.m_specularColor;
}

SpherePrimitive.prototype.setDiffuseColor = function(r,g,b)
{
	this.m_diffuseColor[0] = r;
	this.m_diffuseColor[1] = g;
	this.m_diffuseColor[2] = b;
}

SpherePrimitive.prototype.setSpecularColor = function(r,g,b)
{
	this.m_specularColor[0] = r;
	this.m_specularColor[1] = g;
	this.m_specularColor[2] = b;
}

SpherePrimitive.prototype.setColor = function(r,g,b)
{
	this.setDiffuseColor(r,g,b);
	this.setSpecularColor(r,g,b);
}

//get the normal at the specified point p (3 array)
SpherePrimitive.prototype.getNormal = function(p)
{
	var norm = Vector3_copy(p);
	Vector3_subtract(norm,this.m_p);
	Vector3_normalize(norm);
	return norm;
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
SpherePrimitive.prototype.getAABB = function()
{
	var aabb = new Array(6);

	aabb[0] = this.m_p[0] - this.m_r;
	aabb[1] = this.m_p[1] - this.m_r;
	aabb[2] = this.m_p[2] - this.m_r;

	aabb[3] = this.m_p[0] + this.m_r;
	aabb[4] = this.m_p[1] + this.m_r;
	aabb[5] = this.m_p[2] + this.m_r;

	return aabb;
}

//this function expects two 3 array's in a 2 array representing the ray
//it returns whether or not the ray intersects this sphere, the "time" it intersects and the intersection point, if so, as indices 0,1,2
//adapted from "Real Time Collision Detection" 5.3.2
SpherePrimitive.prototype.rayIntersects = function(ray,maxDistance)
{
	//get the vector from the center of this circle to where the ray begins.
	var m = Vector3_copy(ray[0]);
	Vector3_subtract(m,this.m_p);

    //get the dot product of the above vector and the ray's vector
	var b = Vector3_dot(m,ray[1]);

	var c = Vector3_dot(m,m) - this.m_r * this.m_r;

	//exit if r's origin outside s (c > 0) and r pointing away from s (b > 0)
	if(c > 0 && b > 0)
	{
		return [false,0];
	}

	//calculate discriminant
	var discr = b * b - c;

	//a negative discriminant corresponds to ray missing sphere
	if(discr < 0)
	{
		return [false,0];
	}

	//ray now found to intersect sphere, compute smallest t value of intersection
	var t = -b - Math.sqrt(discr);

	//if t is negative, ray started inside sphere so clamp t to zero
	if(t < 0)
	  t = 0;

	//enforce a max distance if we should (should we just make a separate function to get rid of this if etc?)
	if(maxDistance != null)
	{
		if(t > maxDistance)
		{
			return [false,0];
		}
	}

    //compute the point of intersection
    var q = Vector3_copy(ray[1]);
    Vector3_multiplyScalar(q,t);
    Vector3_add(q,ray[0]);

	return [true,t,q];
}

//////////////////////////////////////////////////////////
//               DEBUG FUNCTIONS
//////////////////////////////////////////////////////////