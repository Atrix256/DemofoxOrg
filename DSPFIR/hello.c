#define export __attribute__((visibility("default")))

#include "math.h"
#include "complex.h"

static const int c_graphWidth = 512;

double g_frequencyResponse[c_graphWidth];
double g_phaseResponse[c_graphWidth];
int g_data_order = 0;
double g_data_A0 = 0.0;
double g_data_Alpha1 = 0.0;

export int GetGraphWidth()
{
    return c_graphWidth;
}

export int GetGraphHeight()
{
    return c_graphWidth / 4;
}

void UpdateData_Order1(double _A0, double _Alpha1)
{
	// only recalculate data if the parameters have changed
	if (g_data_order == 1 && g_data_A0 == _A0 && g_data_Alpha1 == _Alpha1)
		return;
	g_data_order = 1;
	g_data_A0 = _A0;
	g_data_Alpha1 = _Alpha1;

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
        g_phaseResponse[i] = inl_atan2f(result.imaginary, result.real);
    }
}

export double* GetFrequencyResponse_Order1(double A0, double Alpha1)
{
	UpdateData_Order1(A0, Alpha1);
    return g_frequencyResponse;
}

export double* GetPhaseResponse_Order1(double A0, double Alpha1)
{
	UpdateData_Order1(A0, Alpha1);
    return g_phaseResponse;
}


// Saving this here in case needed.
/*
void * memset(void * ptr, int value, unsigned long num)
{
    unsigned char v = (unsigned char)value;
    unsigned char* p = (unsigned char*)ptr;
    for(unsigned long i = 0; i < num; ++i)
        p[i] = v;
    return ptr;
}
*/


// TODO: look at celphes for math (from Marc)
// TODO: option for log axes vs not
// TODO: anti alias the graph drawing. smoothstep the distance, using the gradient. use finite differences to get gradient for distance estimation!
// TODO: put labels (text) and lines on graph, both horizontal and vertical.
// TODO: an example pole/zero plotter. https://www.earlevel.com/main/2013/10/28/pole-zero-placement-v2/
// TODO: rename this stuff not to "hello" but to FIR?
// TODO: make sure exports in wasm file are minimal
// TODO: 4 spaces instead of tabs in .c files
// TODO: clean up html. naming things etc.

/*
Blog:

Steps for getting wasm working.
  "I'm totally stumbling in the dark w/ clang and libm etc. Please, someone correct me if you know better."
  * nice to go here to see what's in your wasm files. ensure only minimal things exported. https://webassembly.github.io/wabt/demo/wasm2wat/
  tried getting math functions from here: http://www.netlib.org/fdlibm/. i got sin and cos in, and it was giving garbage values for quite a few values! the readme mentions something about undefined behavior on some platforms.
    GLibc also didn't work well. Hard to separate out just the stuff i needed
    in the end, prefered to make my own functions anyhow. That way i can make them inline and they aren't in the export list.


- talk about the link to the "roll dice A and take A+B, roll dice B and take A+B, for LPF, subtraction for HPF" to this order 1 filter. show how it's the same thing. 1 for A, +1 or -1 for B
- talk about the link link to convolution

*/
