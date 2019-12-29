typedef unsigned char byte;

// TODO: could we return float maybe?

static const int c_numHeights = 1024;

byte s_graphHeight[c_numHeights];

double radians(double degrees)
{
	return degrees * 3.14159265359 / 180.0;
}

double fract(double f)
{
	return f - (double)((int)(f));
}

double absval(double f)
{
	return f < 0.0f ? -f : f;
}

float Sin(const float _x)
{
	// from #3 at https://blog.demofox.org/2014/11/04/four-ways-to-calculate-sine-without-trig/

    // make a triangle wave that has y values from 0-1, where y is 0 at x=0
	float x = absval(fract((_x - radians(90.0)) / radians(360.0))*2.0-1.0);

	// smoothstep
    return x * x * (3.0 - 2.0 * x) * 2.0 - 1.0;
}

byte* GetGraphHeights()
{
	for (int i = 0; i < c_numHeights; ++i)
	{
		double phase = 45 * (double)(i) / (double)(c_numHeights);
		double value = (Sin(phase) * 0.5 + 0.5) * 128.0;
		s_graphHeight[i] = (byte)(value);
	}
	return s_graphHeight;
}

// TODO: get rid of this
int Add(int a, int b) {
  return a*a + b*b + a + b;
}

// TODO: can we choose which things to export?
// TODO: 4 spaces instead of tabs