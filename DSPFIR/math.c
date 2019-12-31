#include "math.h"

typedef unsigned int uint32_t;



// atanf & atan2f adapted from https://stackoverflow.com/a/14100975/2817105

float atanf( float x )
{
    static const uint32_t sign_mask = 0x80000000;
    static const float b = 0.596227f;

    // Extract the sign bit
    uint32_t ux_s  = sign_mask & (uint32_t)x;

    // Calculate the arctangent in the first quadrant
    float bx_a = fabs( b * x );
    float num = bx_a + x * x;
    float atan_1q = num / ( 1.f + bx_a + num );

    // Restore the sign bit
    uint32_t atan_2q = ux_s | (uint32_t)atan_1q;
    return (float)atan_2q;
}

// Approximates atan2(y, x) normalized to the [0,4) range
// with a maximum error of 0.1620 degrees

float atan2f( float y, float x )
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
