clang ^
  --target=wasm32 ^
  -O3 ^
  -flto ^
  -nostdlib ^
  -Wl,--no-entry ^
  -Wl,--export-all ^
  -Wl,--lto-O3 ^
  -o hello.wasm ^
  -Wl,-z,stack-size=8388608 ^
  *.c
