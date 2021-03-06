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
double g_data_Alpha2 = 0.0;

export int GetGraphWidth()
{
    return c_graphWidth;
}

export int GetGraphHeight()
{
    return c_graphWidth / 2;
}

void UpdateData_Order2(double _A0, double _Alpha1, double _Alpha2)
{
    // only recalculate data if the parameters have changed
    if (g_data_order == 2 && g_data_A0 == _A0 && g_data_Alpha1 == _Alpha1 && g_data_Alpha2 == _Alpha2)
        return;
    g_data_order = 2;
    g_data_A0 = _A0;
    g_data_Alpha1 = _Alpha1;
    g_data_Alpha2 = _Alpha2;

    // transfer function of quadratic FIR is
    // H(z) = A0 * (1 + Alpha1 * z^(-1) + Alpha2 * z^(-2))
    //
    // z = e^(iw)
    //
    // e^(ix) = cos(x) + i*sin(x)
    //
    // Zeroes are at where z is the equation below, which may be purely real, or complex.
    // 0 = -Alpha1 / 2  +-  sqrt(Alpha1^2 - 4*Alpha2) / 2
    // 
    // The above assumes that A0 is 1, so instead of Alpha1 / Alpha2 we just use A1/ A2, since eg A1 = Alpha1 * A0.

    struct ComplexValue A0 = MakeComplexValue(_A0, 0.0);
    struct ComplexValue Alpha1 = MakeComplexValue(_Alpha1, 0.0);
    struct ComplexValue Alpha2 = MakeComplexValue(_Alpha2, 0.0);
    struct ComplexValue One = MakeComplexValue(1.0, 0.0);

    for (int i = 0; i < c_graphWidth; ++i)
    {
        double phase = c_pi * (double)(i) / (double)(c_graphWidth);

        struct ComplexValue result2 = Z(-2, phase);
        result2 = Multiply(&Alpha2, &result2);

        struct ComplexValue result1 = Z(-1, phase);
        result1 = Multiply(&Alpha1, &result1);

        struct ComplexValue result = Add(&One, &result1);
        result = Add(&result, &result2);
        result = Multiply(&A0, &result);

        g_frequencyResponse[i] = Length(&result);
        g_phaseResponse[i] = inl_atan2(result.imaginary, result.real);

        // calculate the location of the zeroes
        double Zero1X = -_Alpha1 / 2.0;
        double Zero1Y = 0.0;
        double Zero2X = -_Alpha1 / 2.0;
        double Zero2Y = 0.0;
        double discriminant = _Alpha1 * _Alpha1 - 4.0 * _Alpha2;
        double sqrtDiscriminantOver2 = sqrt(fabs(discriminant)) / 2.0;
        if (discriminant >= 0.0)
        {
            Zero1X += sqrtDiscriminantOver2;
            Zero2X -= sqrtDiscriminantOver2;
        }
        else
        {
            Zero1Y += sqrtDiscriminantOver2;
            Zero2Y -= sqrtDiscriminantOver2;
        }

        // Get an estimate of frequency response by getting distance from point on circle to the zeros and multiplying them
        double circlePosX = inl_cos(phase);
        double circlePosY = inl_sin(phase);

        double dist1X = circlePosX - Zero1X;
        double dist1Y = circlePosY - Zero1Y;

        double dist2X = circlePosX - Zero2X;
        double dist2Y = circlePosY - Zero2Y;

        g_frequencyResponseEstimate[i] = sqrt(dist1X*dist1X+dist1Y*dist1Y) * sqrt(dist2X*dist2X+dist2Y*dist2Y) * _A0;
    }
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
    //
    // The above assumes that A0 is 1, so instead of Alpha1 / Alpha2 we just use A1/ A2, since eg A1 = Alpha1 * A0.

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

export double* GetFrequencyResponse(double A0, double Alpha1, double Alpha2, int order)
{
    if (order == 1)
        UpdateData_Order1(A0, Alpha1);
    else
        UpdateData_Order2(A0, Alpha1, Alpha2);
    return g_frequencyResponse;
}

export double* GetFrequencyResponseEstimate(double A0, double Alpha1, double Alpha2, int order)
{
    if (order == 1)
        UpdateData_Order1(A0, Alpha1);
    else
        UpdateData_Order2(A0, Alpha1, Alpha2);
    return g_frequencyResponseEstimate;
}

export double* GetPhaseResponse(double A0, double Alpha1, double Alpha2, int order)
{
    if (order == 1)
        UpdateData_Order1(A0, Alpha1);
    else
        UpdateData_Order2(A0, Alpha1, Alpha2);
    return g_phaseResponse;
}
