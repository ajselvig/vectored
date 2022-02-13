import { expect, test } from 'vitest'
import {dToPathDef} from './path'
import * as geom from '../util/geom'


test("d parsing", () => {
    const d = "M 1 2.5 L 3.5 4 l 2 -2 Z"
    const def = dToPathDef(d)
    expect(def.openOrClosed).eq('closed')
    expect(def.vertices.length).eq(3)
    expect(def.vertices[0].point).toMatchObject(geom.point(1, 2.5))
    expect(def.vertices[1].point).toMatchObject(geom.point(3.5, 4))
    expect(def.vertices[2].point).toMatchObject(geom.point(5.5, 2))
})