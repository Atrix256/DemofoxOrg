#define export __attribute__((visibility("default")))

typedef unsigned char byte;

static const int c_graphWidth = 512;

double s_graphHeight[c_graphWidth];

export int GetGraphWidth()
{
	return c_graphWidth;
}

export int GetGraphHeight()
{
	return c_graphWidth / 4;
}

double absval(double x)
{
	return x < 0.0f ? -x : x;
}

double fract(double x)
{
    return x - (double)((int)x);
}

double Triangle(double phase)
{
    return absval(fract(phase)-0.5)*4.0-1.0;
}

export double* GetGraphHeights(double A0, double A1, double A2)
{
	for (int i = 0; i < c_graphWidth; ++i)
	{
		double phase = A0 * (double)(i) / (double)(c_graphWidth);
		double value = (Triangle(phase)) * 0.5 + 0.5;
		s_graphHeight[i] = value * A1 + A2;
	}
	return s_graphHeight;
}

// TODO: 4 spaces instead of tabs in .c files