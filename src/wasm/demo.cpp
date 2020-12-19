#include "demo.h"

#include <iostream>
#include <emscripten.h>
#include <emscripten/bind.h>
#include <emscripten/val.h>

DemoObj::DemoObj() {
    num = 54;
    name = "claudia";
}

EMSCRIPTEN_BINDINGS(demoObj) {
    emscripten::class_<DemoObj>("DemoObj")
        .constructor<>()
        .property("num", &DemoObj::num)
        .property("name", &DemoObj::name);
}