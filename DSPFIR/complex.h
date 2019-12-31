#ifndef COMPLEX_H
#define COMPLEX_H

struct ComplexValue
{
    double real;
    double imaginary;
};

inline struct ComplexValue MakeComplexValue(double real, double imaginary)
{
    struct ComplexValue ret;
    ret.real = real;
    ret.imaginary = imaginary;
    return ret;
}

inline struct ComplexValue Z(int delay, double angle)
{
    struct ComplexValue ret;

    ret.real = inl_cos((double)delay * angle);
    ret.imaginary = inl_sin((double)delay * angle);

    return ret;
}

inline struct ComplexValue Add(const struct ComplexValue* A, const struct ComplexValue* B)
{
    struct ComplexValue ret;

    ret.real = A->real + B->real;
    ret.imaginary = A->imaginary + B->imaginary;

    return ret;
}

inline struct ComplexValue Multiply(const struct ComplexValue* A, const struct ComplexValue* B)
{
    struct ComplexValue ret;

    ret.real = A->real * B->real - A->imaginary * B->imaginary;
    ret.imaginary = A->real * B->imaginary + A->imaginary * B->real;

    return ret;
}

inline double Length(const struct ComplexValue* V)
{
    return sqrt(V->real * V->real + V->imaginary * V->imaginary);
}

#endif // COMPLEX_H