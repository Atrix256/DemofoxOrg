#define export __attribute__((visibility("default")))

#include "math.h"
#include "complex.h"

static const int c_graphWidth = 512;

double g_frequencyResponse[c_graphWidth];

export int GetGraphWidth()
{
	return c_graphWidth;
}

export int GetGraphHeight()
{
	return c_graphWidth / 4;
}

// TODO: phase response too
// TODO: option for log axes vs not

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

		//g_frequencyResponse[i] = atan2f(1, 2);
	}

	// TODO: maybe only re-calculate these if the parameters changed from the last time? if it's too slow to do every frame
	return g_frequencyResponse;
}


// TODO: 4 spaces instead of tabs in .c files
// TODO: anti alias the graph drawing
// TODO: an example pole/zero plotter. https://www.earlevel.com/main/2013/10/28/pole-zero-placement-v2/
// TODO: rename this stuff not to "hello" but to FIR?
// TODO: make sure exports in wasm file are minimal

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
