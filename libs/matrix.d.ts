/*
 * @Author: Joker
 * @Date: 2023-07-13 09:45:17
 * @LastEditTime: 2023-08-02 16:08:29
 * @filePath: Do not edit
 * @Description: 
 */
declare class Matrix4 {
    elements: any;
    setLookAt(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ): Matrix4;
    setOrtho(left, right, bottom, top, near, far): Matrix4;
    /**
     * 
     * @param fovy 可视空间顶面与底面的夹角
     * @param aspect 
     * @param near 
     * @param far 
     */
    setPerspective(fovy, aspect, near, far): Matrix4;
    multiply(other): Matrix4;
    setTranslate(x, y, z): Matrix4;
    setInverseOf(other): Matrix4;
    transpose(): Matrix4;
    rotate(angle, x, y, z): Matrix4;
}

declare class Vector3 {
    elements: any;
    constructor(mat: number[]);
    normalize(): Vector3;
}