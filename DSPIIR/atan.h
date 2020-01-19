#ifndef ATAN_H
#define ATAN_H

// atan2 adapted from cephes https://www.netlib.org/cephes/

#define PI 3.14159265359
#define PIO2 (PI / 2.0)
#define PIO4 (PI / 4.0)
#define MAXNUM 1.0e308


static const double P[5] = {
-8.750608600031904122785E-1,
-1.615753718733365076637E1,
-7.500855792314704667340E1,
-1.228866684490136173410E2,
-6.485021904942025371773E1,
};

static const double Q[5] = {
    /* 1.000000000000000000000E0, */
     2.485846490142306297962E1,
     1.650270098316988542046E2,
     4.328810604912902668951E2,
     4.853903996359136964868E2,
     1.945506571482613964425E2,
};

/* pi/2 = PIO2 + MOREBITS.  */
#define MOREBITS 6.123233995736765886130E-17

/* tan( 3*pi/8 ) */
#define T3P8 2.41421356237309504880

inline double inl_polevl(double x, const double* coef, int N)
{
    double ans;
    int i;
    const double *p;

    p = coef;
    ans = *p++;
    i = N;

    do
        ans = ans * x + *p++;
    while (--i);

    return(ans);
}

/*							p1evl()	*/
/*                                          N
 * Evaluate polynomial when coefficient of x  is 1.0.
 * Otherwise same as polevl.
 */
inline double inl_p1evl(double x, const double* coef, int N)
{
    double ans;
    const double *p;
    int i;

    p = coef;
    ans = x + *p++;
    i = N - 1;

    do
        ans = ans * x + *p++;
    while (--i);

    return(ans);
}

inline static double inl_atan(double x)
{
    double y, z;
    short sign, flag;

    /* make argument positive and save the sign */
    sign = 1;
    if (x < 0.0)
    {
        sign = -1;
        x = -x;
    }
    /* range reduction */
    flag = 0;
    if (x > T3P8)
    {
        y = PIO2;
        flag = 1;
        x = -(1.0 / x);
    }
    else if (x <= 0.66)
    {
        y = 0.0;
    }
    else
    {
        y = PIO4;
        flag = 2;
        x = (x - 1.0) / (x + 1.0);
    }
    z = x * x;
    z = z * inl_polevl(z, P, 4) / inl_p1evl(z, Q, 5);
    z = x * z + x;
    if (flag == 2)
        z += 0.5 * MOREBITS;
    else if (flag == 1)
        z += MOREBITS;
    y = y + z;
    if (sign < 0)
        y = -y;
    return(y);
}

inline double inl_atan2(double y, double x)
{
    double z, w;
    short code;

    code = 0;

    if (x < 0.0)
        code = 2;
    if (y < 0.0)
        code |= 1;

    if (fabs(x) <= (fabs(y) / MAXNUM)) {
        if (code & 1)
        {
            return(-PIO2);
        }
        if (y == 0.0)
            return(0.0);
        return(PIO2);
    }

    if (y == 0.0)
    {
        if (code & 2)
            return(PI);
        return(0.0);
    }


    switch (code)
    {
    default:
    case 0:
    case 1: w = 0.0; break;
    case 2: w = PI; break;
    case 3: w = -PI; break;
    }

    z = w + inl_atan(y / x);
    return(z);
}

#endif //ATAN_H