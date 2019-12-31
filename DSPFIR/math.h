#ifndef MATH_H
#define MATH_H

typedef unsigned int uint32_t;

#define c_pi 3.14159265359
#define c_twoPi (2.0 * c_pi)

extern double sqrt(double);

// TODO: make inl_
float atanf( float x );

float atan2f( float y, float x );

inline double fabs (double f)
{
    return f < 0.0f ? -f : f;
}

// TODO: rename to fmodf or something?
inline double modulus(double x, double m)
{
    return x - ((double)((int)(x/m)))*m;
}

// sin / cos adapted from
// https://en.wikipedia.org/wiki/Bhaskara_I's_sine_approximation_formula#Equivalent_forms_of_the_formula
inline double inl_sin(double angle)
{
    angle = modulus(angle, c_twoPi);
    if (angle < 0.0f)
        angle += c_twoPi;

    double multiplier = angle >= c_pi ? -1.0 : 1.0;
    if (angle >= c_pi)
        angle -= c_pi;

    return 16.0 * angle * (c_pi - angle) / (5.0*c_pi*c_pi - 4.0 * angle * (c_pi - angle)) * multiplier;
}

inline double inl_cos(double angle)
{
    return inl_sin(angle + c_pi / 2.0);
}

// atan2f adapted from https://stackoverflow.com/a/14100975/2817105

// Approximates atan2(y, x) normalized to the [0,4) range
// with a maximum error of 0.1620 degrees

inline float inl_atan2f( float y, float x )
{
    static const uint32_t sign_mask = 0x80000000;
    static const float b = 0.596227f;

    // Extract the sign bits
    uint32_t ux_s  = sign_mask & (uint32_t)x;
    uint32_t uy_s  = sign_mask & (uint32_t)y;

    // Determine the quadrant offset
    float q = (float)( ( ~ux_s & uy_s ) >> 29 | ux_s >> 30 ); 

    // Calculate the arctangent in the first quadrant
    float bxy_a = fabs( b * x * y );
    float num = bxy_a + y * y;
    float atan_1q =  num / ( x * x + bxy_a + num );

    // Translate it to the proper quadrant
    uint32_t uatan_2q = (ux_s ^ uy_s) | (uint32_t)atan_1q;
    return q + (float)uatan_2q;
} 

#endif // MATH_H