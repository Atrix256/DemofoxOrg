typedef unsigned char byte;

// TODO: could we return float maybe?

static const int c_numHeights = 1024;

static byte s_graphHeight[c_numHeights];

byte* GetGraphHeights()
{
	for (int i = 0; i < c_numHeights; ++i)
		s_graphHeight[i] = i / 4;
	return s_graphHeight;
}

// TODO: get rid of this
int Add(int a, int b) {
  return a*a + b*b + a + b;
}
