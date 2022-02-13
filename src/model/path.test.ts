import { expect, test } from 'vitest'
import {dToPathDef} from './path'
import * as vec from '../geom/vec'


test("d line parsing", () => {
    const def = dToPathDef("M 1 2.5 L 3.5 4 l 2 -2 Z")
    expect(def.openOrClosed).eq('closed')
    expect(def.vertices.length).eq(3)
    expect(def.vertices[0].point).toMatchObject({x: 1, y: 2.5})
    expect(def.vertices[1].point).toMatchObject({x: 3.5, y: 4})
    expect(def.vertices[2].point).toMatchObject({x: 5.5, y: 2})
})

test("d curve parsing", () => {
    // single curve with default symmetric vertices
    let def = dToPathDef("C 0 1, 2 1, 2 0")
    expect(def.openOrClosed).eq('open')
    expect(def.vertices.length).eq(2)
    expect(def.vertices[0].point).toMatchObject({x: 0, y: 0})
    expect(vec.isMirror(def.vertices[0].in!, def.vertices[0].out!)).toBeTruthy() // in is computed
    expect(def.vertices[0].out).toMatchObject({x: 0, y: 1})
    expect(def.vertices[0].type).eq("symmetric")
    expect(def.vertices[1].point).toMatchObject({x: 2, y: 0})
    expect(def.vertices[1].type).eq("symmetric")

    // three curves with asymmetric and explicitly symmetric vertices
    def = dToPathDef("C 0 2, 1 4, 3 4 C 6 4, 6 2, 6 0 C 6 -2, 5 -3, 3 -3")
    expect(def.vertices.length).eq(4)
    expect(def.vertices[0].type).eq("symmetric")
    expect(def.vertices[1].type).eq("asymmetric")
    expect(def.vertices[2].type).eq("symmetric") // explicit
    expect(def.vertices[3].type).eq("symmetric")

    // a line followed by a curve should produce a disjoint vertex with no in control point
    def = dToPathDef("L 0 1 C 1 2, 2 2, 3 1")
    expect(def.vertices.length).eq(3)
    expect(def.vertices[0].type).eq("point")
    expect(def.vertices[1].type).eq("disjoint")
    expect(def.vertices[1].in).toBeUndefined()
    expect(def.vertices[2].type).eq("symmetric")

    // a curve followed by a line should produce a disjoint vertex with no in control point
    def = dToPathDef("C 0 1, 1 1, 1 0 L 2 0")
    expect(def.vertices.length).eq(3)
    expect(def.vertices[0].type).eq("symmetric")
    expect(def.vertices[1].type).eq("disjoint")
    expect(def.vertices[1].out).toBeUndefined()
    expect(def.vertices[2].type).eq("point")


})