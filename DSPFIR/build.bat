clang ^
  --target=wasm32 ^
  -O3 ^
  -flto ^
  -nostdlib ^
  -Wl,--no-entry ^
  -Wl,--export-dynamic ^
  -Wl,--lto-O3 ^
  -o FIR.wasm ^
  -Wl,-z,stack-size=8388608 ^
  -Wall ^
  *.c
