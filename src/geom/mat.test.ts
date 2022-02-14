import { expect, test } from 'vitest'
import * as vec from './vec'
import * as mat from './mat'

const epsilon = 0.0000001

test("matrix translation", () => {
    const delta = vec.make(1, 2)
    const m = mat.translate(mat.identity(), delta)
    const v = vec.identity()
    const v1 = mat.transform(m, v)
    expect(v1.x).eq(delta.x)
    expect(v1.y).eq(delta.y)
})

test("matrix rotation", () => {
    const m = mat.rotate(mat.identity(), Math.PI/2)
    const v = vec.make(1, 0)
    const v1 = mat.transform(m, v)
    expect(v1.x).approximately(0, epsilon)
    expect(v1.y).approximately(1, epsilon)
})

test("matrix scaling", () => {
    const m = mat.scale(mat.identity(), 2, 3)
    const v = vec.make(1, 1)
    const v1 = mat.transform(m, v)
    expect(v1.x).approximately(2, epsilon)
    expect(v1.y).approximately(3, epsilon)
})