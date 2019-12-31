#include "fdlibm/fdlibm.h"

#define export __attribute__((visibility("default")))

// TODO: i don't think we need byte
typedef unsigned char byte;

static const int c_graphWidth = 512;

static const double c_pi = 3.14159265359;
static const double c_twoPi = 2.0 * c_pi;

double s_graphHeight[c_graphWidth];  // TODO: get rid of this

double g_frequencyResponse[c_graphWidth];

extern double sqrt(double);
//extern double sin(double);
//extern double cos(double);

void * memset(void * ptr, int value, unsigned long num)
{
    unsigned char v = (unsigned char)value;
    unsigned char* p = (unsigned char*)ptr;
    for(unsigned long i = 0; i < num; ++i)
        p[i] = v;
    return ptr;
}

double modulus(double x, double m)
{
	return x - ((double)((int)(x/m)))*m;
}

// https://en.wikipedia.org/wiki/Bhaskara_I's_sine_approximation_formula#Equivalent_forms_of_the_formula
double Sine(double angle)
{
	angle = modulus(angle, c_twoPi);
    if (angle < 0.0f)
        angle += c_twoPi;

	double multiplier = angle >= c_pi ? -1.0 : 1.0;
	if (angle >= c_pi)
		angle -= c_pi;

	return 16.0 * angle * (c_pi - angle) / (5.0*c_pi*c_pi - 4.0 * angle * (c_pi - angle)) * multiplier;
}

double Cosine(double angle)
{
	return Sine(angle + c_pi / 2.0);
}

/*
double sin(double a)
{
	return Sine(a);
}

double cos(double a)
{
	return Cosine(a);
}
*/

export int GetGraphWidth()
{
	return c_graphWidth;
}

export int GetGraphHeight()
{
	return c_graphWidth / 4;
}

// TODO: standardize capitalization? maybe make a math.h header?
double absval(double x)
{
	return x < 0.0f ? -x : x;
}

double fract(double x)
{
    return x - (double)((int)x);
}



// TODO: phase response too
// TODO: option for log vs not

// TODO: probably don't need this struct
struct ComplexValue
{
	double real;
	double imaginary;
};

struct ComplexValue MakeComplexValue(double real, double imaginary)
{
	struct ComplexValue ret;
	ret.real = real;
	ret.imaginary = imaginary;
	return ret;
}

struct ComplexValue Z(int delay, double angle)
{
	struct ComplexValue ret;

	ret.real = cos((double)delay * angle);
	ret.imaginary = sin((double)delay * angle);

	return ret;
}

struct ComplexValue Add(const struct ComplexValue* A, const struct ComplexValue* B)
{
	struct ComplexValue ret;

	ret.real = A->real + B->real;
	ret.imaginary = A->imaginary + B->imaginary;

	return ret;
}

struct ComplexValue Multiply(const struct ComplexValue* A, const struct ComplexValue* B)
{
    struct ComplexValue ret;

    ret.real = A->real * B->real - A->imaginary * B->imaginary;
    ret.imaginary = A->real * B->imaginary + A->imaginary * B->real;

    return ret;
}


/*
double sqrt(double v)
{
	// TODO: implement!
	return v;
}
*/

double Length(const struct ComplexValue* V)
{
	return sqrt(V->real * V->real + V->imaginary * V->imaginary);
}

export double* GetFrequencyResponse_Linear(double _A0, double _Alpha1)
{
	// transfer function of linear IIR is
	// H(z) = A0 * (1 + Alpha1 * z^(-1))
	//
	// z = e^(iw)
	//
	// e^(ix) = cos(x) + i*sin(x)
	//
	// Zero of filter is where z = -Alpha1

	struct ComplexValue A0 = MakeComplexValue(_A0, 0.0);
	struct ComplexValue Alpha1 = MakeComplexValue(_Alpha1, 0.0);
	struct ComplexValue One = MakeComplexValue(1.0, 0.0);

	for (int i = 0; i < c_graphWidth; ++i)
	{
		double phase = c_pi * (double)(i) / (double)(c_graphWidth);

		struct ComplexValue result = Z(-1, phase);
		result = Multiply(&Alpha1, &result);
		result = Add(&One, &result);
		result = Multiply(&A0, &result);

		g_frequencyResponse[i] = Length(&result);
	}

	// TODO: maybe only re-calculate these if the parameters changed from the last time? if it's too slow to do every frame
	return g_frequencyResponse;
}

export double* GetGraphHeights(double A0, double A1, double A2)
{
	for (int i = 0; i < c_graphWidth; ++i)
	{
		double phase = c_twoPi * A0 * (double)(i) / (double)(c_graphWidth);
		double value = sin(phase) * 0.5 + 0.5;
		//double value = (Triangle(phase)) * 0.5 + 0.5;
		//value = sqrt(value);
		s_graphHeight[i] = value * A1 + A2;
	}
	return s_graphHeight;
}

// TODO: 4 spaces instead of tabs in .c files
// TODO: anti alias the graph drawing

// TODO: maybe math functions from here: http://www.netlib.org/fdlibm/
// TODO: can i get libm somehow?
// TODO: an example pole/zero plotter. https://www.earlevel.com/main/2013/10/28/pole-zero-placement-v2/

/*
Blog:

- link the "roll dice A and take A+B, roll dice B and take A+B, for LPF, subtraction for HPF" to this order 1 filter. show how it's the same thing. 1 for A, +1 or -1 for B
- link to convolution
- source of math functions: http://www.netlib.org/fdlibm/

*/
