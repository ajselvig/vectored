import { expect, test } from 'vitest'
import { MatrixTransform, RotateTransform, ScaleTransform, transform2Mat, TranslateTransform } from './transform'
import * as mat from "../geom/mat"


// verify that transform2Mat behaves the same way as the raw 
// matrix transformation functinos
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