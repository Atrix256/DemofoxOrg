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

#include "atan.h"

#endif // MATH_H