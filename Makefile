WASM2WAT=wasm2wat
WAT2WASM=wat2wasm
WAT2WASM_FLAGS=
ifeq ($(DEBUG),1)
WAT2WASM_FLAGS:=$(WAT2WASM_FLAGS) --debug-names
endif

all:
	yarn -s build

dev:
	yarn -s dev

check:
	yarn -s test

check-watch:
	yarn -s test-watch

lint:
	yarn -s lint

wasm: src/waforth.assembled.wat scripts/word.wasm.hex

src/web/benchmarks/sieve/sieve-c.js:
	emcc src/web/benchmarks/sieve/sieve.c -O2 -o $@ -sEXPORTED_FUNCTIONS=_sieve -sEXPORTED_RUNTIME_METHODS=ccall,cwrap

.PHONY: standalone
standalone:
	$(MAKE) -C src/standalone

%.wasm: %.wat
	$(WAT2WASM) $(WAT2WASM_FLAGS) -o $@ $<

%.wasm.hex: %.wasm
	hexdump -v -e '16/1 "_%02X" "\n"' $< | sed 's/_/\\/g; s/\\u    //g; s/.*/    "&"/' > $@

clean:
	-rm -rf $(WASM_FILES) scripts/word.wasm scripts/word.wasm.hex src/waforth.wat.tmp \
		public/waforth

