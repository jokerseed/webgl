import { Test } from "./Test";

class Main {
    public context2d: CanvasRenderingContext2D;
    public contextBitmap: ImageBitmapRenderingContext;
    public contextWebgl: WebGLRenderingContext;
    public contextWebgl2: WebGL2RenderingContext;

    public webGLcanvas: HTMLCanvasElement;

    constructor() {
        let canvas = document.getElementById("2d") as HTMLCanvasElement;
        this.context2d = canvas.getContext("2d");
        let canvas2 = document.getElementById("bitmap") as HTMLCanvasElement;
        this.contextBitmap = canvas2.getContext("bitmaprenderer");
        let canvas3 = this.webGLcanvas = document.getElementById("3d") as HTMLCanvasElement;
        this.contextWebgl2 = canvas3.getContext("webgl2");
        if (!this.contextWebgl2) this.contextWebgl = canvas3.getContext("webgl");

        // canvas3.onmousedown = this.ClickWebGLCanvas.bind(this);
    }

    ClickWebGLCanvas(evt: MouseEvent) {
        console.log("Click position x:" + evt.clientX + " y:" + evt.clientY);
        let x = evt.clientX;
        let y = evt.clientY;
        let rect = (evt.target as Element).getBoundingClientRect();
        x = ((x - rect.left) - this.webGLcanvas.height / 2) / (this.webGLcanvas.height / 2);
        y = (this.webGLcanvas.width / 2 - (y - rect.top)) / (this.webGLcanvas.width / 2);
        this.Point2(x, y, 0.0);
    }

    /**获取webgl上下文 */
    GetWebglContext() {
        return this.contextWebgl2 || this.contextWebgl;
    }

    /**初始化shader方法 */
    initShaders(context: WebGLRenderingContext | WebGL2RenderingContext, vs: string, fs: string): WebGLProgram {
        /**着色器对象 */
        let vshader = context.createShader(context.VERTEX_SHADER);
        /**从文件中载入着色器程序 */
        context.shaderSource(vshader, vs);
        /**编译着色器代码 */
        context.compileShader(vshader);
        /**检测着色器状态 */
        let a = context.getShaderParameter(vshader, context.COMPILE_STATUS);
        /**获取检测日志 */
        context.getShaderInfoLog(vshader);
        /**着色器对象 */
        let fshader = context.createShader(context.FRAGMENT_SHADER);
        /**从文件中载入着色器程序 */
        context.shaderSource(fshader, fs);
        /**编译着色器代码 */
        context.compileShader(fshader);
        /**检测着色器状态 */
        let b = context.getShaderParameter(fshader, context.COMPILE_STATUS);
        /**获取检测日志 */
        context.getShaderInfoLog(fshader);
        /**创建程序对象 */
        let p = context.createProgram();
        /**分配着色器对象 着色器对象可以为空的或者未编译的*/
        context.attachShader(p, vshader);
        /**分配着色器对象 */
        context.attachShader(p, fshader);
        /**连接着色器 */
        context.linkProgram(p);
        /**告知webgl系统绘制的时候使用哪个程序对象 也可以作为切换着色器*/
        context.useProgram(p);
        return p;
    }

    /**绘制蓝色矩形 */
    public DrawRectangle() {
        this.context2d.fillStyle = "rgba(0,0,255,1.0)";
        this.context2d.fillRect(120, 10, 150, 150);
    }

    /**清空canvas */
    public ClearCanvas() {
        /**开启多边形消除功能 */
        /**自动在z轴添加偏移量  这个量由物体表面相对观察者实现决定的 */
        this.GetWebglContext().enable(this.GetWebglContext().POLYGON_OFFSET_FILL);
        /**指定计算偏移量的参数 */
        this.GetWebglContext().polygonOffset(1.0, 1.0);
        /**开启隐藏面消除功能 */
        /**如果两个物体深度一样，深度检测有限的精度就无法检测前后位置关系了 */
        this.GetWebglContext().enable(this.GetWebglContext().DEPTH_TEST);
        /**禁用某个功能 */
        // this.GetWebglContext().disable(this.GetWebglContext().DEPTH_TEST);
        //在下一次clearColor前只需要指定一次
        this.GetWebglContext().clearColor(0.0, 0.0, 0.0, 1.0);

        /**清除颜色缓冲区 */
        this.GetWebglContext().clear(this.contextWebgl2.COLOR_BUFFER_BIT);
        /**清除深度缓冲区 */
        this.GetWebglContext().clear(this.GetWebglContext().DEPTH_BUFFER_BIT);
        /**另一种写法 */
        // this.GetWebglContext().clear(this.contextWebgl2.COLOR_BUFFER_BIT | this.GetWebglContext().DEPTH_BUFFER_BIT);
    }

    /**绘制一个点 */
    public Point() {
        let vshader_source = `void main(){
                gl_Position=vec4(0.0,0.0,0.0,1.0);
                gl_PointSize=10.0;
        }`;
        let fshader_source = `void main(){
            gl_FragColor=vec4(1.0,0.0,0.0,1.0);
        }`;
        this.initShaders(this.GetWebglContext(), vshader_source, fshader_source);
        this.ClearCanvas();
        this.GetWebglContext().drawArrays(this.GetWebglContext().POINTS, 0, 1);
    }

    /** 绘制一个点  使用attribute向着色器传输数据 */
    public Point2(x: number = 0.0, y: number = 0.5, z: number = 0.0) {
        let vs = `attribute vec4 a_Position;
        void main(){
            gl_Position = a_Position;
            gl_PointSize = 10.0;
        }`;
        let fs = `void main(){
            gl_FragColor=vec4(1.0,0.0,0.0,1.0);
        }`;
        let p = this.initShaders(this.GetWebglContext(), vs, fs);
        let a_Position = this.GetWebglContext().getAttribLocation(p, 'a_Position');
        if (a_Position < 0) {
            console.log('Failed to get the store location of a_Position');
            return;
        }
        this.GetWebglContext().vertexAttrib3f(a_Position, x, y, z);
        this.ClearCanvas();
        this.GetWebglContext().drawArrays(this.GetWebglContext().POINTS, 0, 1);
    }

    /**绘制一个点  使用uniform修改点的颜色 */
    public Point3() {
        let vshader_source = `void main(){
            gl_Position=vec4(0.0,0.0,0.0,1.0);
            gl_PointSize=10.0;
        }`;
        let fshader_source = `precision mediump float;
        uniform vec4 u_FragColor;
        void main(){
            gl_FragColor=u_FragColor;
        }`;
        let p = this.initShaders(this.GetWebglContext(), vshader_source, fshader_source);
        let u_FragColor = this.GetWebglContext().getUniformLocation(p, 'u_FragColor');
        this.GetWebglContext().uniform4f(u_FragColor, 0.0, 1.0, 0.0, 1.0);
        this.ClearCanvas();
        this.GetWebglContext().drawArrays(this.GetWebglContext().POINTS, 0, 1);
    }

    /**绘制多个点 */
    public DrawMultiPoint() {
        let vs = `attribute vec4 a_Position;
        void main(){
            gl_Position = a_Position;
            gl_PointSize = 10.0;
        }`;
        let fs = `void main(){
            gl_FragColor=vec4(1.0,0.0,0.0,1.0);
        }`;
        let p = this.initShaders(this.GetWebglContext(), vs, fs);
        let a_Position = this.GetWebglContext().getAttribLocation(p, 'a_Position');
        if (a_Position < 0) {
            console.log('Failed to get the store location of a_Position');
            return;
        }
        this.ClearCanvas();
        this.GetWebglContext().vertexAttrib3f(a_Position, 0.0, 0.0, 0.0);
        this.GetWebglContext().drawArrays(this.GetWebglContext().POINTS, 0, 1);
        this.GetWebglContext().vertexAttrib3f(a_Position, 0.0, 0.5, 0.0);
        this.GetWebglContext().drawArrays(this.GetWebglContext().POINTS, 0, 1);
        this.GetWebglContext().vertexAttrib3f(a_Position, 0.5, 0.0, 0.0);
        this.GetWebglContext().drawArrays(this.GetWebglContext().POINTS, 0, 1);
    }

    /**利用缓冲区对象绘制多个点
     * 使用缓冲区后  无法使用vertexAttrib[1234]f方法向attribute传递参数了
     */
    public DrawMultiPoint2() {
        let vs = `attribute vec4 a_Position;
        attribute float a_PositionSize;
        void main(){
            gl_Position = a_Position;
            gl_PointSize = a_PositionSize;
        }`;
        let fs = `void main(){
            gl_FragColor=vec4(1.0,0.0,0.0,1.0);
        }`;
        let p = this.initShaders(this.GetWebglContext(), vs, fs);
        let vertices = new Float32Array([0.0, 0.5, -0.5, -0.5, 0.5, -0.5]);
        let sizes = new Float32Array([10.0, 20.0, 30.0]);
        //创建缓冲区对象
        let vertexbuf = this.GetWebglContext().createBuffer();
        //绑定缓冲区对象   this.GetWebglContext().ARRAY_BUFFER表示缓冲区对象中包含了顶点的数据
        this.GetWebglContext().bindBuffer(this.GetWebglContext().ARRAY_BUFFER, vertexbuf);
        //向缓冲区中写入数据
        this.GetWebglContext().bufferData(this.GetWebglContext().ARRAY_BUFFER, vertices, this.GetWebglContext().STATIC_DRAW);
        let a_Position = this.GetWebglContext().getAttribLocation(p, 'a_Position');
        //将缓冲区对象分配给a_Position变量
        this.GetWebglContext().vertexAttribPointer(a_Position, 2, this.GetWebglContext().FLOAT, false, 0, 0);
        //连接a_Position变量与分配给他的缓冲区对象
        this.GetWebglContext().enableVertexAttribArray(a_Position);

        let sizebuf = this.GetWebglContext().createBuffer();
        this.GetWebglContext().bindBuffer(this.GetWebglContext().ARRAY_BUFFER, sizebuf);
        this.GetWebglContext().bufferData(this.GetWebglContext().ARRAY_BUFFER, sizes, this.GetWebglContext().STATIC_DRAW);
        let a_PositionSize = this.GetWebglContext().getAttribLocation(p, 'a_PositionSize');
        this.GetWebglContext().vertexAttribPointer(a_PositionSize, 1, this.GetWebglContext().FLOAT, false, 0, 0);
        this.GetWebglContext().enableVertexAttribArray(a_PositionSize);

        this.ClearCanvas();
        this.GetWebglContext().drawArrays(this.GetWebglContext().POINTS, 0, 3);
    }

    /**绘制三角形 */
    public DrawTriangles() {
        let vs = `attribute vec4 a_Position;
        void main(){
            gl_Position = a_Position;
        }`;
        let fs = `void main(){
            gl_FragColor=vec4(1.0,0.0,0.0,1.0);
        }`;
        let p = this.initShaders(this.GetWebglContext(), vs, fs);
        let vertices = new Float32Array([0.0, 0.5, -0.5, -0.5, 0.5, -0.5]);
        //创建缓冲区对象
        let vertexbuf = this.GetWebglContext().createBuffer();
        //绑定缓冲区对象   this.GetWebglContext().ARRAY_BUFFER表示缓冲区对象中包含了顶点的数据
        this.GetWebglContext().bindBuffer(this.GetWebglContext().ARRAY_BUFFER, vertexbuf);
        //像缓冲区中写入数据
        this.GetWebglContext().bufferData(this.GetWebglContext().ARRAY_BUFFER, vertices, this.GetWebglContext().STATIC_DRAW);
        let a_Position = this.GetWebglContext().getAttribLocation(p, 'a_Position');
        //将缓冲区对象分配给a_Position变量
        this.GetWebglContext().vertexAttribPointer(a_Position, 2, this.GetWebglContext().FLOAT, false, 0, 0);
        //连接a_Position变量与分配给他的缓冲区对象
        this.GetWebglContext().enableVertexAttribArray(a_Position);
        this.ClearCanvas();
        this.GetWebglContext().drawArrays(this.GetWebglContext().TRIANGLES, 0, 3);
    }

    /**绘制可平移变换的三角形 */
    public DrawTrianglesCanTranslate(x, y, z) {
        let vs = `attribute vec4 a_Position;
        uniform vec4 u_Translation;
        void main(){
            gl_Position = a_Position + u_Translation;
        }`;
        let fs = `void main(){
            gl_FragColor=vec4(1.0,0.0,0.0,1.0);
        }`;
        let p = this.initShaders(this.GetWebglContext(), vs, fs);
        let vertices = new Float32Array([0.0, 0.5, -0.5, -0.5, 0.5, -0.5]);
        //创建缓冲区对象
        let vertexbuf = this.GetWebglContext().createBuffer();
        //绑定缓冲区对象   this.GetWebglContext().ARRAY_BUFFER表示缓冲区对象中包含了顶点的数据
        this.GetWebglContext().bindBuffer(this.GetWebglContext().ARRAY_BUFFER, vertexbuf);
        //像缓冲区中写入数据
        this.GetWebglContext().bufferData(this.GetWebglContext().ARRAY_BUFFER, vertices, this.GetWebglContext().STATIC_DRAW);
        let a_Position = this.GetWebglContext().getAttribLocation(p, 'a_Position');
        //将缓冲区对象分配给a_Position变量
        this.GetWebglContext().vertexAttribPointer(a_Position, 2, this.GetWebglContext().FLOAT, false, 0, 0);
        //连接a_Position变量与分配给他的缓冲区对象
        this.GetWebglContext().enableVertexAttribArray(a_Position);

        let u_Translation = this.GetWebglContext().getUniformLocation(p, 'u_Translation');
        this.GetWebglContext().uniform4f(u_Translation, x, y, z, 0.0);

        this.ClearCanvas();
        this.GetWebglContext().drawArrays(this.GetWebglContext().TRIANGLES, 0, 3);
    }

    /**绘制可旋转变换的三角形 */
    public DrawTrianglesCanRotation(angle: number) {
        let vs = `attribute vec4 a_Position;
        uniform float u_CosB,u_SinB;
        void main(){
            gl_Position.x = a_Position.x*u_CosB-a_Position.y*u_SinB;
            gl_Position.y = a_Position.x*u_SinB+a_Position.y*u_CosB;
            gl_Position.z = a_Position.z;
            gl_Position.w = 1.0;
        }`;
        let fs = `void main(){
            gl_FragColor=vec4(1.0,0.0,0.0,1.0);
        }`;
        let p = this.initShaders(this.GetWebglContext(), vs, fs);

        let a = angle * Math.PI / 180;
        let cosb = this.GetWebglContext().getUniformLocation(p, 'u_CosB');
        this.GetWebglContext().uniform1f(cosb, Math.cos(a));
        let sinb = this.GetWebglContext().getUniformLocation(p, 'u_SinB');
        this.GetWebglContext().uniform1f(sinb, Math.sin(a));

        let vertices = new Float32Array([0.0, 0.5, -0.5, -0.5, 0.5, -0.5]);
        //创建缓冲区对象
        let vertexbuf = this.GetWebglContext().createBuffer();
        //绑定缓冲区对象   this.GetWebglContext().ARRAY_BUFFER表示缓冲区对象中包含了顶点的数据
        this.GetWebglContext().bindBuffer(this.GetWebglContext().ARRAY_BUFFER, vertexbuf);
        //像缓冲区中写入数据
        this.GetWebglContext().bufferData(this.GetWebglContext().ARRAY_BUFFER, vertices, this.GetWebglContext().STATIC_DRAW);
        let a_Position = this.GetWebglContext().getAttribLocation(p, 'a_Position');
        //将缓冲区对象分配给a_Position变量
        this.GetWebglContext().vertexAttribPointer(a_Position, 2, this.GetWebglContext().FLOAT, false, 0, 0);
        //连接a_Position变量与分配给他的缓冲区对象
        this.GetWebglContext().enableVertexAttribArray(a_Position);



        this.ClearCanvas();
        this.GetWebglContext().drawArrays(this.GetWebglContext().TRIANGLES, 0, 3);
    }

    /**使用旋转矩阵  绘制可旋转变换的三角形 */
    public DrawTrianglesCanRotationByMatrix(angle: number) {
        let vs = `attribute vec4 a_Position;
        uniform mat4 u_xformMatrix;
        void main(){
            gl_Position=a_Position*u_xformMatrix;
        }`;
        let fs = `void main(){
            gl_FragColor=vec4(1.0,0.0,0.0,1.0);
        }`;
        let p = this.initShaders(this.GetWebglContext(), vs, fs);

        let a = angle * Math.PI / 180;
        let cosb = Math.cos(a);
        let sinb = Math.sin(a);
        let mat = new Float32Array([
            cosb, sinb, 0.0, 0.0,
            -sinb, cosb, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0
        ]);
        let mm = this.GetWebglContext().getUniformLocation(p, 'u_xformMatrix');
        this.GetWebglContext().uniformMatrix4fv(mm, false, mat);

        let vertices = new Float32Array([0.0, 0.5, -0.5, -0.5, 0.5, -0.5]);
        //创建缓冲区对象
        let vertexbuf = this.GetWebglContext().createBuffer();
        //绑定缓冲区对象   this.GetWebglContext().ARRAY_BUFFER表示缓冲区对象中包含了顶点的数据
        this.GetWebglContext().bindBuffer(this.GetWebglContext().ARRAY_BUFFER, vertexbuf);
        //像缓冲区中写入数据
        this.GetWebglContext().bufferData(this.GetWebglContext().ARRAY_BUFFER, vertices, this.GetWebglContext().STATIC_DRAW);
        let a_Position = this.GetWebglContext().getAttribLocation(p, 'a_Position');
        //将缓冲区对象分配给a_Position变量
        this.GetWebglContext().vertexAttribPointer(a_Position, 2, this.GetWebglContext().FLOAT, false, 0, 0);
        //连接a_Position变量与分配给他的缓冲区对象
        this.GetWebglContext().enableVertexAttribArray(a_Position);

        this.ClearCanvas();
        this.GetWebglContext().drawArrays(this.GetWebglContext().TRIANGLES, 0, 3);
    }

    /**符合变换  就是多个变换矩阵相乘   获得复合变换矩阵  多个变换矩阵相乘要注意顺序，顺序不一样也会导致变换的结果不一样*/
    /**todo */

    /**requestAnimationFrame 
     * 请求浏览器在将来某个时间再次调用某个函数   如果要循环调用就要在该函数内再次调用他本身
    */

    /**顶点着色器向片元着色器传递颜色参数 */
    public vsTOfsColor() {
        let vs = `
        attribute vec4 a_Position;
        attribute vec4 a_Color;
        varying vec4 v_Color;
        void main(){
            gl_Position=a_Position;
            gl_PointSize=10.0;
            v_Color=a_Color;
        }
        `;
        /**片元着色器要加上这个精度设定,因为片元着色器中没有默认精度
         *  precision mediump float;//中等精度
            precision highp float;//高精度
            precision lowp int;//低精度
         */
        let fs = `
        precision mediump float;
        varying vec4 v_Color;
        void main(){
            gl_FragColor=v_Color;
        }
        `;
        let p = this.initShaders(this.GetWebglContext(), vs, fs);

        let vertices = new Float32Array([
            0.0, 0.5, 1.0, 0.0, 0.0,
            -0.5, -0.5, 0.0, 1.0, 0.0,
            0.5, -0.5, 0.0, 0.0, 1.0
        ]);
        let fsize = vertices.BYTES_PER_ELEMENT;
        //创建缓冲区对象
        let vertexbuf = this.GetWebglContext().createBuffer();
        //绑定缓冲区对象   this.GetWebglContext().ARRAY_BUFFER表示缓冲区对象中包含了顶点的数据
        this.GetWebglContext().bindBuffer(this.GetWebglContext().ARRAY_BUFFER, vertexbuf);
        //像缓冲区中写入数据
        this.GetWebglContext().bufferData(this.GetWebglContext().ARRAY_BUFFER, vertices, this.GetWebglContext().STATIC_DRAW);
        let a_Position = this.GetWebglContext().getAttribLocation(p, 'a_Position');
        //将缓冲区对象分配给a_Position变量
        this.GetWebglContext().vertexAttribPointer(a_Position, 2, this.GetWebglContext().FLOAT, false, fsize * 5, 0);
        //连接a_Position变量与分配给他的缓冲区对象
        this.GetWebglContext().enableVertexAttribArray(a_Position);
        //像缓冲区中写入数据
        this.GetWebglContext().bufferData(this.GetWebglContext().ARRAY_BUFFER, vertices, this.GetWebglContext().STATIC_DRAW);
        let a_Color = this.GetWebglContext().getAttribLocation(p, 'a_Color');
        //将缓冲区对象分配给a_Position变量
        this.GetWebglContext().vertexAttribPointer(a_Color, 3, this.GetWebglContext().FLOAT, false, fsize * 5, fsize * 2);
        //连接a_Position变量与分配给他的缓冲区对象
        this.GetWebglContext().enableVertexAttribArray(a_Color);

        this.ClearCanvas();
        this.GetWebglContext().drawArrays(this.GetWebglContext().TRIANGLES, 0, 3);
    }

    /**2d纹理映射 */
    /**
     * 多个纹理同理
     * 使用多个u_Sampler
     * 不同纹理单元用texture2D取出的纹理相互*得到最终的纹理
     */
    public textureQuad() {
        let vs = `
        attribute vec4 a_Position;
        attribute vec2 a_TexCoord;
        varying vec2 v_TexCoord;
        void main(){
            gl_Position=a_Position;
            v_TexCoord=a_TexCoord;
        }
        `;
        let fs = `
        precision highp float;
        uniform sampler2D u_Sampler;
        varying vec2 v_TexCoord;
        void main(){
            gl_FragColor=texture2D(u_Sampler,v_TexCoord);
        }
        `;
        let p = this.initShaders(this.GetWebglContext(), vs, fs);

        let vertices = new Float32Array([
            -0.5, 0.5, 0.0, 1.0,
            -0.5, -0.5, 0.0, 0.0,
            0.5, 0.5, 1.0, 1.0,
            0.5, -0.5, 1.0, 0.0
        ]);

        let fsize = vertices.BYTES_PER_ELEMENT;
        //创建缓冲区对象
        let vertexbuf = this.GetWebglContext().createBuffer();
        //绑定缓冲区对象   this.GetWebglContext().ARRAY_BUFFER表示缓冲区对象中包含了顶点的数据
        this.GetWebglContext().bindBuffer(this.GetWebglContext().ARRAY_BUFFER, vertexbuf);
        //像缓冲区中写入数据
        this.GetWebglContext().bufferData(this.GetWebglContext().ARRAY_BUFFER, vertices, this.GetWebglContext().STATIC_DRAW);
        let a_Position = this.GetWebglContext().getAttribLocation(p, 'a_Position');
        //将缓冲区对象分配给a_Position变量
        this.GetWebglContext().vertexAttribPointer(a_Position, 2, this.GetWebglContext().FLOAT, false, fsize * 4, 0);
        //连接a_Position变量与分配给他的缓冲区对象
        this.GetWebglContext().enableVertexAttribArray(a_Position);

        //像缓冲区中写入数据
        this.GetWebglContext().bufferData(this.GetWebglContext().ARRAY_BUFFER, vertices, this.GetWebglContext().STATIC_DRAW);
        let a_TexCoord = this.GetWebglContext().getAttribLocation(p, 'a_TexCoord');
        //将缓冲区对象分配给a_Position变量
        this.GetWebglContext().vertexAttribPointer(a_TexCoord, 2, this.GetWebglContext().FLOAT, false, fsize * 4, fsize * 2);
        //连接a_Position变量与分配给他的缓冲区对象
        this.GetWebglContext().enableVertexAttribArray(a_TexCoord);

        //创建纹理对象
        let texture = this.GetWebglContext().createTexture();
        let u_Sampler = this.GetWebglContext().getUniformLocation(p, "u_Sampler");
        let image = new Image();
        image.crossOrigin = "anonymous";
        image.onload = function (gl: WebGL2RenderingContext | WebGLRenderingContext, texture: WebGLTexture, image: HTMLImageElement, u_Sampler: WebGLUniformLocation, n: number) {
            //对纹理对象进行y轴反转
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
            //开启0号纹理单元
            gl.activeTexture(gl.TEXTURE0);
            //向target绑定纹理对象
            gl.bindTexture(gl.TEXTURE_2D, texture);
            //配置纹理参数
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            //配置纹理图像
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
            //将0号纹理传递给着色器
            gl.uniform1i(u_Sampler, 0);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
        }.bind(this, this.GetWebglContext(), texture, image, u_Sampler, 4);
        image.src = "http://192.168.30.138/aa.jpg";
    }


    /**
     * 预处理指令
     * 
     * #if 条件表达式
     * 如果条件表达式为真，执行这里
     * #endif
     * 
     * #ifdef 某宏
     * 如果定义了某宏，执行这里
     * #endif
     * 
     * #ifndef 某宏
     * 如果没有定义某宏，执行这里
     * #endif
     * 
     * 示例
     * #define NUM 100
     * #if NUM == 100
     * 如果宏NUM为100，执行这里
     * #else
     * 否则执行这里
     * #endif
     * 
     * 在着色器顶部使用#version 101指定着色器版本，默认100
     */

    /**从三维世界某个点去看几个错落摆放的三角形 */
    public lookAtTriangles() {
        let vs = `
        attribute vec4 a_Position;
        attribute vec4 a_Color;
        uniform mat4 u_ViewMatrix;
        varying vec4 v_Color;
        void main(){
            gl_Position = u_ViewMatrix * a_Position;
            v_Color = a_Color;
        }
        `;
        let fs = `
        precision highp float;
        varying vec4 v_Color;
        void main(){
            gl_FragColor = v_Color;
        }
        `;
        let p = this.initShaders(this.GetWebglContext(), vs, fs);
        let verticesColors = new Float32Array([
            0.0, 0.5, -0.4, 0.4, 1.0, 0.4,
            -0.5, -0.5, -0.4, 0.4, 1.0, 0.4,
            0.5, -0.5, -0.4, 0.4, 1.0, 0.4,

            0.5, 0.4, -0.2, 1.0, 0.4, 0.4,
            -0.5, 0.4, -0.2, 1.0, 0.4, 0.4,
            0.0, -0.6, -0.2, 1.0, 0.4, 0.4,

            0.2, 0.7, 0.0, 0.4, 0.4, 1.0,
            -0.3, -0.3, 0.0, 0.4, 0.4, 1.0,
            0.7, -0.3, 0.0, 0.4, 0.4, 1.0
        ]);
        let n = 9;
        let fsize = verticesColors.BYTES_PER_ELEMENT;
        let vertexColorBuffer = this.GetWebglContext().createBuffer();
        this.GetWebglContext().bindBuffer(this.GetWebglContext().ARRAY_BUFFER, vertexColorBuffer);
        this.GetWebglContext().bufferData(this.GetWebglContext().ARRAY_BUFFER, verticesColors, this.GetWebglContext().STATIC_DRAW);
        let a_Position = this.GetWebglContext().getAttribLocation(p, 'a_Position');
        //将缓冲区对象分配给a_Position变量
        this.GetWebglContext().vertexAttribPointer(a_Position, 3, this.GetWebglContext().FLOAT, false, fsize * 6, 0);
        //连接a_Position变量与分配给他的缓冲区对象
        this.GetWebglContext().enableVertexAttribArray(a_Position);
        //像缓冲区中写入数据
        this.GetWebglContext().bufferData(this.GetWebglContext().ARRAY_BUFFER, verticesColors, this.GetWebglContext().STATIC_DRAW);
        let a_Color = this.GetWebglContext().getAttribLocation(p, 'a_Color');
        //将缓冲区对象分配给a_Position变量
        this.GetWebglContext().vertexAttribPointer(a_Color, 3, this.GetWebglContext().FLOAT, false, fsize * 6, fsize * 3);
        //连接a_Position变量与分配给他的缓冲区对象
        this.GetWebglContext().enableVertexAttribArray(a_Color);

        let u_ViewMatrix = this.GetWebglContext().getUniformLocation(p, 'u_ViewMatrix');
        let viewMatrix = new Matrix4();
        /**观察点  目标点  观察点上方向  向量  设置视图矩阵*/
        // let m = viewMatrix.setLookAt(0.20, 0.25, 0.25, 0, 0, 0, 0, 1, 0);
        /**设置视角区域  正交视角 正交投影矩阵*/
        /**如果可视空间的宽高比与canvas不一至，显示出的画面会被拉伸或压缩 */
        let m = viewMatrix.setOrtho(-1, 1, -1, 1, 0.0, 0.4);
        this.GetWebglContext().uniformMatrix4fv(u_ViewMatrix, false, m.elements);
        this.ClearCanvas();
        this.GetWebglContext().drawArrays(this.GetWebglContext().TRIANGLES, 0, n);
    }

    /**从三维世界某个点去看几个错落摆放的三角形 */
    public lookAtTriangles2() {
        let vs = `
        attribute vec4 a_Position;
        attribute vec4 a_Color;
        uniform mat4 u_ViewMatrix;
        uniform mat4 u_PerMatrix;
        uniform mat4 u_ModelMatrix;
        varying vec4 v_Color;
        void main(){
            gl_Position = u_PerMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
            v_Color = a_Color;
        }
        `;
        let fs = `
        precision highp float;
        varying vec4 v_Color;
        void main(){
            gl_FragColor = v_Color;
        }
        `;
        let p = this.initShaders(this.GetWebglContext(), vs, fs);
        let verticesColors = new Float32Array([
            0.0, 1, -4.0, 0.4, 1.0, 0.4,
            -0.5, -0.5, -4.0, 0.4, 1.0, 0.4,
            0.5, -0.5, -4.0, 0.4, 1.0, 0.4,

            0.5, 0.4, -2.0, 1.0, 0.4, 0.4,
            -0.5, 0.4, -2.0, 1.0, 0.4, 0.4,
            0.0, -0.6, -2.0, 1.0, 0.4, 0.4,

            0.2, 0.7, 0.0, 0.4, 0.4, 1.0,
            -0.3, -0.3, 0.0, 0.4, 0.4, 1.0,
            0.7, -0.3, 0.0, 0.4, 0.4, 1.0,

            0.2, 0.7, 0.0, 0.1, 0.9, 1.0,
            -0.3, -0.3, 0.0, 0.1, 0.9, 1.0,
            0.7, -0.9, 0.0, 0.1, 0.9, 1.0
        ]);
        let n = 12;
        let fsize = verticesColors.BYTES_PER_ELEMENT;
        let vertexColorBuffer = this.GetWebglContext().createBuffer();
        this.GetWebglContext().bindBuffer(this.GetWebglContext().ARRAY_BUFFER, vertexColorBuffer);
        this.GetWebglContext().bufferData(this.GetWebglContext().ARRAY_BUFFER, verticesColors, this.GetWebglContext().STATIC_DRAW);
        let a_Position = this.GetWebglContext().getAttribLocation(p, 'a_Position');
        //将缓冲区对象分配给a_Position变量
        this.GetWebglContext().vertexAttribPointer(a_Position, 3, this.GetWebglContext().FLOAT, false, fsize * 6, 0);
        //连接a_Position变量与分配给他的缓冲区对象
        this.GetWebglContext().enableVertexAttribArray(a_Position);
        //像缓冲区中写入数据
        this.GetWebglContext().bufferData(this.GetWebglContext().ARRAY_BUFFER, verticesColors, this.GetWebglContext().STATIC_DRAW);
        let a_Color = this.GetWebglContext().getAttribLocation(p, 'a_Color');
        //将缓冲区对象分配给a_Position变量
        this.GetWebglContext().vertexAttribPointer(a_Color, 3, this.GetWebglContext().FLOAT, false, fsize * 6, fsize * 3);
        //连接a_Position变量与分配给他的缓冲区对象
        this.GetWebglContext().enableVertexAttribArray(a_Color);

        let u_ViewMatrix = this.GetWebglContext().getUniformLocation(p, 'u_ViewMatrix');
        let u_PerMatrix = this.GetWebglContext().getUniformLocation(p, 'u_PerMatrix');
        let u_ModelMatrix = this.GetWebglContext().getUniformLocation(p, 'u_ModelMatrix');
        let viewMatrix = new Matrix4();
        let perMatrix = new Matrix4();
        let modelMatrix = new Matrix4();
        /**视图矩阵 */
        let la = viewMatrix.setLookAt(0, 0, 5, 0, 0, 0, 0, 1, 0);
        /**透视投影矩阵 */
        let pc = perMatrix.setPerspective(30, this.webGLcanvas.width / this.webGLcanvas.height, 1, 100);
        /**modelMatrix模型矩阵   其实就是变化矩阵 */
        let mo = modelMatrix.setTranslate(-0.75, 0, 0);
        this.GetWebglContext().uniformMatrix4fv(u_ViewMatrix, false, la.elements);
        this.GetWebglContext().uniformMatrix4fv(u_PerMatrix, false, pc.elements);
        this.GetWebglContext().uniformMatrix4fv(u_ModelMatrix, false, mo.elements);

        this.ClearCanvas();

        this.GetWebglContext().drawArrays(this.GetWebglContext().TRIANGLES, 0, n);

        mo = modelMatrix.setTranslate(0.75, 0, 0);
        this.GetWebglContext().uniformMatrix4fv(u_ModelMatrix, false, mo.elements);
        this.GetWebglContext().drawArrays(this.GetWebglContext().TRIANGLES, 0, n);
    }

    /**
     * 绘制立方体
     *  */
    public createCube() {
        /**
         * 不推荐
         * 用drawArrays方式
         * 用TRIANGLE绘制   要6*6=36个顶点   一次draw
         * 用TRIANGLE_STRIP绘制  要4*9=24个顶点   六次draw
         */
        /**
         * 推荐
         * 用drawElements方式   会保持顶点数最小
         * 如果想要给立方体的每个面单独指定颜色  就要未每个顶点创建单独的索引和颜色
         */
        let vs = `
        attribute vec4 a_Position;
        attribute vec4 a_Color;
        uniform mat4 u_ViewMatrix;
        uniform mat4 u_PerMatrix;
        uniform mat4 u_ModelMatrix;
        varying vec4 v_Color;
        void main(){
            gl_Position = u_PerMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
            v_Color = a_Color;
        }
        `;
        let fs = `
        precision highp float;
        varying vec4 v_Color;
        void main(){
            gl_FragColor = v_Color;
        }
        `;
        let p = this.initShaders(this.GetWebglContext(), vs, fs);
        let verticesColors = new Float32Array([
            1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
            -1.0, 1.0, 1.0, 1.0, 0.0, 1.0,
            -1.0, -1.0, 1.0, 1.0, 0.0, 0.0,
            1.0, -1.0, 1.0, 1.0, 1.0, 0.0,
            1.0, -1.0, -1.0, 0.0, 1.0, 0.0,
            1.0, 1.0, -1.0, 0.0, 1.0, 1.0,
            -1.0, 1.0, -1.0, 0.0, 0.0, 1.0,
            -1.0, -1.0, -1.0, 0.0, 0.0, 0.0
        ]);
        /**顶点索引 */
        let indices = new Uint8Array([
            0, 1, 2, 0, 2, 3,
            0, 3, 4, 0, 4, 5,
            0, 5, 6, 0, 6, 1,
            1, 6, 7, 1, 7, 2,
            7, 4, 3, 7, 3, 2,
            4, 7, 6, 4, 6, 5
        ]);
        let fsize = verticesColors.BYTES_PER_ELEMENT;
        let vertexColorBuffer = this.GetWebglContext().createBuffer();
        this.GetWebglContext().bindBuffer(this.GetWebglContext().ARRAY_BUFFER, vertexColorBuffer);
        this.GetWebglContext().bufferData(this.GetWebglContext().ARRAY_BUFFER, verticesColors, this.GetWebglContext().STATIC_DRAW);
        let a_Position = this.GetWebglContext().getAttribLocation(p, 'a_Position');
        //将缓冲区对象分配给a_Position变量
        this.GetWebglContext().vertexAttribPointer(a_Position, 3, this.GetWebglContext().FLOAT, false, fsize * 6, 0);
        //连接a_Position变量与分配给他的缓冲区对象
        this.GetWebglContext().enableVertexAttribArray(a_Position);
        //像缓冲区中写入数据
        this.GetWebglContext().bufferData(this.GetWebglContext().ARRAY_BUFFER, verticesColors, this.GetWebglContext().STATIC_DRAW);
        let a_Color = this.GetWebglContext().getAttribLocation(p, 'a_Color');
        //将缓冲区对象分配给a_Position变量
        this.GetWebglContext().vertexAttribPointer(a_Color, 3, this.GetWebglContext().FLOAT, false, fsize * 6, fsize * 3);
        //连接a_Position变量与分配给他的缓冲区对象
        this.GetWebglContext().enableVertexAttribArray(a_Color);

        let indexBuffer = this.GetWebglContext().createBuffer();
        this.GetWebglContext().bindBuffer(this.GetWebglContext().ELEMENT_ARRAY_BUFFER, indexBuffer);
        this.GetWebglContext().bufferData(this.GetWebglContext().ELEMENT_ARRAY_BUFFER, indices, this.GetWebglContext().STATIC_DRAW);

        let u_ViewMatrix = this.GetWebglContext().getUniformLocation(p, 'u_ViewMatrix');
        let u_PerMatrix = this.GetWebglContext().getUniformLocation(p, 'u_PerMatrix');
        let u_ModelMatrix = this.GetWebglContext().getUniformLocation(p, 'u_ModelMatrix');
        let viewMatrix = new Matrix4();
        let perMatrix = new Matrix4();
        let modelMatrix = new Matrix4();
        /**视图矩阵 */
        let la = viewMatrix.setLookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
        /**透视投影矩阵 */
        let pc = perMatrix.setPerspective(30, this.webGLcanvas.width / this.webGLcanvas.height, 1, 100);
        /**modelMatrix模型矩阵   其实就是变化矩阵 */
        let mo = modelMatrix.setTranslate(0, 0, 0);
        this.GetWebglContext().uniformMatrix4fv(u_ViewMatrix, false, la.elements);
        this.GetWebglContext().uniformMatrix4fv(u_PerMatrix, false, pc.elements);
        this.GetWebglContext().uniformMatrix4fv(u_ModelMatrix, false, mo.elements);

        this.ClearCanvas();

        this.GetWebglContext().drawElements(this.GetWebglContext().TRIANGLES, indices.length, this.GetWebglContext().UNSIGNED_BYTE, 0);
    }

    /**
     * 光源
     * 平行光
     * 点光源
     * 环境光
     * 
     * 物体反射   (反射光颜色=漫反射光颜色+环境光反射颜色)
     * 漫反射   针对平行光和点光源    反射强度受入射角影响,角度越大越强    反射光颜色取决于入射光颜色和角度还有表面基底色(反射光颜色=入射光颜色*表面基底色*cos角度)
     * 环境反射  (反射光颜色=入射光颜色*表面基底色)
     */

    /**
     * 绘制纯色立方体     
     * 平行光下的漫反射效果
     * 点光源逐顶点处理漫反射效果
     * 点光源逐片元处理漫反射效果
     * 环境光反射效果
     * 运动物体光照反射效果的变化处理
     *  */
    public createCube2() {
        /**
         * 不推荐
         * 用drawArrays方式
         * 用TRIANGLE绘制   要6*6=36个顶点   一次draw
         * 用TRIANGLE_STRIP绘制  要4*9=24个顶点   六次draw
         */
        /**
         * 推荐
         * 用drawElements方式   会保持顶点数最小
         * 如果想要给立方体的每个面单独指定颜色  就要未每个顶点创建单独的索引和颜色
         */
        let vs = `
        attribute vec4 a_Position;
        attribute vec4 a_Color;
        attribute vec4 a_Normal;   //法向量
        uniform mat4 u_ViewMatrix;
        uniform mat4 u_PerMatrix;
        uniform mat4 u_ModelMatrix;
        uniform mat4 u_NormalMatrix;   //用来改变法向量的矩阵
        uniform vec3 u_LightColor;   //平行光线颜色
        uniform vec3 u_LightColor2;   //点光源颜色
        uniform vec3 u_LightDirection;   //归一化的世界坐标
        uniform vec3 u_AmbientLight;    //环境光
        uniform vec3 u_LightPosition;    //点光源位置
        varying vec4 v_Color;
        varying vec3 v_Normal;
        varying vec3 v_Position;
        void main(){
            gl_Position = u_PerMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
            //对法向量进行归一化
            vec3 normal = normalize(vec3(a_Normal*u_NormalMatrix));
            //计算光线方向和法向量的点积  因为做了归一化所以点积结果就是cos角度  点积如果小于0说明入射光射向了表面的背面
            float nDotL = max(dot(u_LightDirection,normal),0.0);
            //计算漫反射光颜色
            vec3 diffuse = u_LightColor * vec3(a_Color) * nDotL;
            //计算环境光反色颜色
            vec3 ambient = u_AmbientLight * vec3(a_Color);
            //顶点的世界坐标
            vec4 vertexPosition = u_ModelMatrix * a_Position;
            //计算点光源光线方向并归一化处理
            vec3 pointLightDirection = normalize(u_LightPosition - vec3(vertexPosition));
            float nDotL2 = max(dot(pointLightDirection,normal),0.0);
            vec3 diffuse2 = u_LightColor2 * vec3(a_Color) * nDotL2;
            //暂时不考虑物体透明度的问题也就是颜色的第四个分量
            //v_Color = vec4(diffuse+diffuse2+ambient,a_Color.a);    //这个是逐顶点计算光照的

            v_Position = vec3(u_ModelMatrix * a_Position);
            v_Normal = normalize(vec3(a_Normal*u_NormalMatrix));
            v_Color = a_Color;      //这是逐片元光照用的
        }
        `;
        let fs = `
        precision highp float;
        varying vec4 v_Color;
        varying vec3 v_Normal;
        varying vec3 v_Position;
        //点光源
        uniform vec3 u_LightColor3;   
        uniform vec3 u_LightPosition3;
        void main(){
            //gl_FragColor = v_Color;    //这个是逐顶点计算光照的

            vec3 normal3 = normalize(v_Normal);
            vec3 lightDirection3 = normalize(u_LightPosition3-v_Position);
            float nDotL3 = max(dot(lightDirection3,normal3),0.0);
            vec3 diffuse3 = u_LightColor3 * vec3(v_Color) * nDotL3;
            gl_FragColor = vec4(diffuse3,v_Color.a);
        }
        `;
        let p = this.initShaders(this.GetWebglContext(), vs, fs);
        /**顶点和颜色矩阵 */
        let verticesColors = new Float32Array([
            1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
            -1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
            -1.0, -1.0, 1.0, 1.0, 1.0, 1.0,
            1.0, -1.0, 1.0, 1.0, 1.0, 1.0,
            1.0, -1.0, -1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, -1.0, 1.0, 1.0, 1.0,
            -1.0, 1.0, -1.0, 1.0, 1.0, 1.0,
            -1.0, -1.0, -1.0, 1.0, 1.0, 1.0
        ]);
        /**顶点索引 */
        let indices = new Uint8Array([
            0, 1, 2, 0, 2, 3,
            0, 3, 4, 0, 4, 5,
            0, 5, 6, 0, 6, 1,
            1, 6, 7, 1, 7, 2,
            7, 4, 3, 7, 3, 2,
            4, 7, 6, 4, 6, 5
        ]);
        /**法向量 */
        let normals = new Float32Array([
            0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
            1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
            -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
            0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
            0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0
        ]);
        let fsize = verticesColors.BYTES_PER_ELEMENT;
        let vertexColorBuffer = this.GetWebglContext().createBuffer();
        this.GetWebglContext().bindBuffer(this.GetWebglContext().ARRAY_BUFFER, vertexColorBuffer);
        this.GetWebglContext().bufferData(this.GetWebglContext().ARRAY_BUFFER, verticesColors, this.GetWebglContext().STATIC_DRAW);
        let a_Position = this.GetWebglContext().getAttribLocation(p, 'a_Position');
        //将缓冲区对象分配给a_Position变量
        this.GetWebglContext().vertexAttribPointer(a_Position, 3, this.GetWebglContext().FLOAT, false, fsize * 6, 0);
        //连接a_Position变量与分配给他的缓冲区对象
        this.GetWebglContext().enableVertexAttribArray(a_Position);
        //像缓冲区中写入数据
        this.GetWebglContext().bufferData(this.GetWebglContext().ARRAY_BUFFER, verticesColors, this.GetWebglContext().STATIC_DRAW);
        let a_Color = this.GetWebglContext().getAttribLocation(p, 'a_Color');
        //将缓冲区对象分配给a_Color变量
        this.GetWebglContext().vertexAttribPointer(a_Color, 3, this.GetWebglContext().FLOAT, false, fsize * 6, fsize * 3);
        //连接a_Color变量与分配给他的缓冲区对象
        this.GetWebglContext().enableVertexAttribArray(a_Color);

        let normalBuffer = this.GetWebglContext().createBuffer();
        this.GetWebglContext().bindBuffer(this.GetWebglContext().ELEMENT_ARRAY_BUFFER, normalBuffer);
        this.GetWebglContext().bufferData(this.GetWebglContext().ELEMENT_ARRAY_BUFFER, normals, this.GetWebglContext().STATIC_DRAW);
        let a_Normal = this.GetWebglContext().getAttribLocation(p, 'a_Normal');
        this.GetWebglContext().vertexAttribPointer(a_Normal, 3, this.GetWebglContext().FLOAT, false, fsize * 3, 0);
        this.GetWebglContext().enableVertexAttribArray(a_Normal);

        let indexBuffer = this.GetWebglContext().createBuffer();
        this.GetWebglContext().bindBuffer(this.GetWebglContext().ELEMENT_ARRAY_BUFFER, indexBuffer);
        this.GetWebglContext().bufferData(this.GetWebglContext().ELEMENT_ARRAY_BUFFER, indices, this.GetWebglContext().STATIC_DRAW);

        let u_ViewMatrix = this.GetWebglContext().getUniformLocation(p, 'u_ViewMatrix');
        let u_PerMatrix = this.GetWebglContext().getUniformLocation(p, 'u_PerMatrix');
        let u_ModelMatrix = this.GetWebglContext().getUniformLocation(p, 'u_ModelMatrix');
        let u_LightColor = this.GetWebglContext().getUniformLocation(p, 'u_LightColor');
        let u_LightDirection = this.GetWebglContext().getUniformLocation(p, 'u_LightDirection');
        let u_AmbientLight = this.GetWebglContext().getUniformLocation(p, 'u_AmbientLight');
        let u_NormalMatrix = this.GetWebglContext().getUniformLocation(p, "u_NormalMatrix");
        let u_LightColor2 = this.GetWebglContext().getUniformLocation(p, 'u_LightColor2');
        let u_LightPosition = this.GetWebglContext().getUniformLocation(p, 'u_LightPosition');
        let u_LightColor3 = this.GetWebglContext().getUniformLocation(p, 'u_LightColor3');
        let u_LightPosition3 = this.GetWebglContext().getUniformLocation(p, 'u_LightPosition3');

        /**设置点光源颜色 */
        this.GetWebglContext().uniform3f(u_LightColor2, 0.0, 0.0, 0.0);
        /**设置点光源位置 */
        this.GetWebglContext().uniform3f(u_LightPosition, 0.0, 3.0, 4.0);

        /**设置逐片元点光源颜色 */
        this.GetWebglContext().uniform3f(u_LightColor3, 1.0, 1.0, 1.0);
        /**设置逐片元点光源位置 */
        this.GetWebglContext().uniform3f(u_LightPosition3, 0.0, 3.0, 4.0);

        /**设置平行光线颜色 */
        this.GetWebglContext().uniform3f(u_LightColor, 0.0, 0.0, 0.0);
        /** 设置平行光线方向 */
        let lightDirection = new Vector3([0.5, 3.0, 4.0]);
        lightDirection.normalize();
        this.GetWebglContext().uniform3fv(u_LightDirection, lightDirection.elements);
        /**设置环境光颜色 */
        this.GetWebglContext().uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);

        let viewMatrix = new Matrix4();
        let perMatrix = new Matrix4();
        let modelMatrix = new Matrix4();
        let normalMatrix = new Matrix4();
        /**视图矩阵 */
        let la = viewMatrix.setLookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
        /**透视投影矩阵 */
        let pc = perMatrix.setPerspective(30, this.webGLcanvas.width / this.webGLcanvas.height, 1, 100);
        /**modelMatrix模型矩阵   其实就是变化矩阵 */
        modelMatrix.setTranslate(0, 0, 0);
        let mo = modelMatrix.rotate(30, 0, 0, 1);
        /**获取变换后的法向量   乘以变换矩阵的逆转置矩阵 */
        normalMatrix.setInverseOf(modelMatrix);
        let nm = normalMatrix.transpose();
        this.GetWebglContext().uniformMatrix4fv(u_ViewMatrix, false, la.elements);
        this.GetWebglContext().uniformMatrix4fv(u_PerMatrix, false, pc.elements);
        this.GetWebglContext().uniformMatrix4fv(u_ModelMatrix, false, mo.elements);
        this.GetWebglContext().uniformMatrix4fv(u_NormalMatrix, false, nm.elements);

        this.ClearCanvas();

        this.GetWebglContext().drawElements(this.GetWebglContext().TRIANGLES, indices.length, this.GetWebglContext().UNSIGNED_BYTE, 0);
    }
}

const m = new Main();
// m.DrawRectangle();
// m.ClearCanvas();
// m.Point();
// m.Point2();
// m.Point3();
// m.DrawMultiPoint();
// m.DrawMultiPoint2();
// m.DrawTriangles();
// m.DrawTrianglesCanTranslate(1.0, 0.0, 0.0);
// m.DrawTrianglesCanRotation(90);
// m.DrawTrianglesCanRotationByMatrix(60);
// m.vsTOfsColor();
// m.textureQuad();
// m.lookAtTriangles();
// m.lookAtTriangles2();
// m.createCube();
m.createCube2();


Test.test();