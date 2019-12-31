#define export __attribute__((visibility("default")))

#include "math.h"
#include "complex.h"

static const int c_graphWidth = 512;

double g_frequencyResponse[c_graphWidth];
double g_frequencyResponseEstimate[c_graphWidth];
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
    return c_graphWidth / 2;
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

    double zeroPosX = -_Alpha1;
    double zeroPosY = 0.0;

    for (int i = 0; i < c_graphWidth; ++i)
    {
        double phase = c_pi * (double)(i) / (double)(c_graphWidth);

        struct ComplexValue result = Z(-1, phase);
        result = Multiply(&Alpha1, &result);
        result = Add(&One, &result);
        result = Multiply(&A0, &result);

        g_frequencyResponse[i] = Length(&result);
        g_phaseResponse[i] = inl_atan2(result.imaginary, result.real);

        // Get an estimate of frequency response by getting distance from point on circle to the zero
        double circlePosX = inl_cos(phase);
        double circlePosY = inl_sin(phase);
        double distX = circlePosX - zeroPosX;
        double distY = circlePosY - zeroPosY;
        g_frequencyResponseEstimate[i] = sqrt(distX*distX+distY*distY) * _A0;
    }
}

export double* GetFrequencyResponse_Order1(double A0, double Alpha1)
{
	UpdateData_Order1(A0, Alpha1);
    return g_frequencyResponse;
}

export double* GetFrequencyResponseEstimate_Order1(double A0, double Alpha1)
{
	UpdateData_Order1(A0, Alpha1);
    return g_frequencyResponseEstimate;
}

export double* GetPhaseResponse_Order1(double A0, double Alpha1)
{
	UpdateData_Order1(A0, Alpha1);
    return g_phaseResponse;
}

// TODO: from amplitude to decibels: dB = 20 * log10(amplitude)


// TODO: need to get order 2 working!
// TODO: option for log axes vs not
// TODO: anti alias the graph drawing. smoothstep the distance, using the gradient. use finite differences to get gradient for distance estimation!
// TODO: put labels (text) and lines on graph, both horizontal and vertical.
// TODO: an example pole/zero plotter. https://www.earlevel.com/main/2013/10/28/pole-zero-placement-v2/
// TODO: rename this stuff not to "hello" but to FIR?
// TODO: make sure exports in wasm file are minimal
// TODO: clean up html. naming things etc.
// TODO: better layout / colors / etc for html
// TODO: maybe reread chapters in book again to make sure you didn't miss anything
// TODO: check html for lint errors
// TODO: need to get a brief description and title at the top of the page
// TODO: link to the blog post
// TODO: use the filter in real time with web audio?

// TODO: should i get sin / cos from cephes?

// TODO: merge this into master of blog repo!

// TODO: if you make up a function for a transfer function (to get desired frequency / phase response) can you turn that into a difference equation?


/*
Blog:

Steps for getting wasm working.
  "I'm totally stumbling in the dark w/ clang and libm etc. Please, someone correct me if you know better."
  * nice to go here to see what's in your wasm files. ensure only minimal things exported. https://webassembly.github.io/wabt/demo/wasm2wat/
  tried getting math functions from here: http://www.netlib.org/fdlibm/. i got sin and cos in, and it was giving garbage values for quite a few values! the readme mentions something about undefined behavior on some platforms.
    GLibc also didn't work well. Hard to separate out just the stuff i needed
    in the end, prefered to make my own functions anyhow. That way i can make them inline and they aren't in the export list.
   Cephes looks better, and i got atan2 from it: https://www.netlib.org/cephes/  thanks https://twitter.com/marc_b_reynolds

* show how the delay is the functionality of the filter! doing this sample plus last sample makes nyquist disappear. similar frequencies disappear less. etc

* in first order filter. the ratio of A1 / A0 controls the filter. If the values change, but the ratio is preserved, it just adjusts gain (volume control)

* talk about how you can estimate frequency response on the circle by seeing how close the frequency is to the zeroes. it's an estimate (?) but seems really close

- talk about the link to the "roll dice A and take A+B, roll dice B and take A+B, for LPF, subtraction for HPF" to this order 1 filter. show how it's the same thing. 1 for A, +1 or -1 for B
- talk about the link link to convolution

*/
