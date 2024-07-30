set tscPath = .\node_modules\.bin

set PATH = "%PATH%;%tscPath%"

::tsc --noEmit会检测类型但不编译输出
tsc --noEmit && node ./node_modules/gulp/bin/gulp.js -f ./Y_vite_compile.js build

pause