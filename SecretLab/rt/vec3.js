/*==================================================

Created by Alan Wolfe
jsraytrace{at}demofox.org
http://demofox.org

October 2011

==================================================*/

/*
//////////////////////////////////////////////////////////
//                   CONSTRUCTOR
//////////////////////////////////////////////////////////

//takes in the x,y,z components of the vector
//OR takes in another vec3 (as parameter x) to copy
function Vec3(x,y,z)
{
	//if they gave us a vec3
	if(x != null && x.m_x != null)
	{
		this.m_x = x.m_x;
		this.m_y = x.m_y;
		this.m_z = x.m_z;
	}
	else
	{
		this.m_x = 0;
		this.m_y = 0;
		this.m_z = 0;

		if(x)
			this.m_x = x;

		if(y)
			this.m_y = y;

		if(z)
			this.m_z = z;
	}
}

//////////////////////////////////////////////////////////
//                   FUNCTIONS
//////////////////////////////////////////////////////////

Vec3.prototype.multiplyScalar = function(scale)
{
	return new Vec3(this.m_x * scale, this.m_y * scale, this.m_z * scale);
}

Vec3.prototype.multiply = function(other)
{
	return new Vec3(this.m_x * other.m_x, this.m_y * other.m_y, this.m_z * other.m_z);
}

Vec3.prototype.add = function(other) 
{
	return new Vec3(this.m_x + other.m_x, this.m_y + other.m_y, this.m_z + other.m_z);
}

Vec3.prototype.subtract = function(other) 
{
	return new Vec3(this.m_x - other.m_x, this.m_y - other.m_y, this.m_z - other.m_z);
}

Vec3.prototype.dot = function(other)
{
	return (this.m_x * other.m_x + this.m_y * other.m_y + this.m_z * other.m_z)
}

Vec3.prototype.cross = function(other)
{
	var ret = new Vec3;
	
	ret.m_x = this.m_y * other.m_z - this.m_z * other.m_y;
	ret.m_y = this.m_z * other.m_x - this.m_x * other.m_z;
	ret.m_z = this.m_x * other.m_y - this.m_y * other.m_x;

	return ret;
}

Vec3.prototype.length = function() 
{
	return Math.sqrt((this.m_x * this.m_x) + (this.m_y * this.m_y) + (this.m_z * this.m_z));
}

Vec3.prototype.normalize = function() 
{
	var length = this.length();
	this.m_x /= length;
	this.m_y /= length;
	this.m_z /= length;
}

//////////////////////////////////////////////////////////
//               DEBUG FUNCTIONS
//////////////////////////////////////////////////////////
Vec3.prototype.alert = function(prefix)
{
	if(prefix)
		alert(prefix + ": " + this.m_x + ", " + this.m_y + ", " + this.m_z);
	else
		alert(this.m_x + ", " + this.m_y + ", " + this.m_z);
}
*/

//just functions- OOP was slow, which is sad ):
function Vector3_copy(v)
{
	return v.slice(0);
}

function Vector3_subtract(va,vb)
{
	va[0] -= vb[0];
	va[1] -= vb[1];
	va[2] -= vb[2];
}

function Vector3_add(va,vb)
{
	va[0] += vb[0];
	va[1] += vb[1];
	va[2] += vb[2];
}

function Vector3_multiply(va,vb)
{
	va[0] *= vb[0];
	va[1] *= vb[1];
	va[2] *= vb[2];
}

function Vector3_length(v)
{
	return Math.sqrt((v[0] * v[0]) + (v[1] * v[1]) + (v[2] * v[2]))
}

function Vector3_normalize(v)
{
	var len = Vector3_length(v);
	v[0] /= len;
	v[1] /= len;
	v[2] /= len;
}

function Vector3_cross(va,vb)
{
	ret = [0,0,0];
	
	ret[0] = va[1] * vb[2] - va[2] * vb[1];
	ret[1] = va[2] * vb[0] - va[0] * vb[2];
	ret[2] = va[0] * vb[1] - va[1] * vb[0];

	return ret;
}

function Vector3_dot(va,vb)
{
	return (va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2]);
}

function Vector3_multiplyScalar(v,s)
{
	v[0] *= s;
	v[1] *= s;
	v[2] *= s;
}