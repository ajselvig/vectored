import { expect, test } from 'vitest'
import { MatrixTransform, parseTransform, RotateTransform, ScaleTransform, transform2Mat, transforms2string, TranslateTransform } from './transform'
import * as mat from "../geom/mat"


// verify that transform2Mat behaves the same way as the raw 
// matrix transformation functions
test("transform2Mat", () => {

    const matrix: MatrixTransform = {
        type: 'matrix',
        a: 1, b: 2, c: 3, d: 4, tx: 5, ty: 6
    }
    expect(transform2Mat(matrix)).toMatchObject(
        mat.make(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty)
    )

    const translation: TranslateTransform = {
        type: 'translate', 
        x: 1, y: 2
    }
    expect(transform2Mat(translation)).toMatchObject(
        mat.translate(mat.identity(), translation)
    )

    const scale: ScaleTransform = {
        type: 'scale',
        x: 1, y: 2
    }
    expect(transform2Mat(scale)).toMatchObject(
        mat.scale(mat.identity(), scale.x, scale.y)
    )

    const rotation: RotateTransform = {
        type: 'rotate',
        a: Math.PI/4,
        x: 0, y: 0
    }
    expect(transform2Mat(rotation)).toMatchObject(
        mat.rotate(mat.identity(), rotation.a)
    )

})


// test parsing transform literals
test("parseTransform", () => {
    const s = "matrix(1, 2, 3, 4, 5, 6) scale(1, 2) translate(3, 4) rotate(90, 0, 1) skewX(30) skewY(60)"
    const transforms = parseTransform(s)
    expect(transforms.length).eq(6)
    expect(transforms[0]).toMatchObject({
        type: 'matrix', a: 1, b: 2, c: 3, d: 4, tx: 5, ty: 6
    })
    expect(transforms[1]).toMatchObject({
        type: 'scale', x: 1, y: 2
    })
    expect(transforms[2]).toMatchObject({
        type: 'translate', x: 3, y: 4
    })
    expect(transforms[3]).toMatchObject({
        type: 'rotate', a: 90, x: 0, y: 1
    })
    expect(transforms[4]).toMatchObject({
        type: 'skewX', a: 30
    })
    expect(transforms[5]).toMatchObject({
        type: 'skewY', a: 60
    })
    expect(transforms2string(transforms)).eq(s)
})