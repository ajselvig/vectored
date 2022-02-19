import { expect, test } from 'vitest'
import {d2PathDef, PathDef, pathDef2d, printPathDef} from './path'
import * as vec from '../geom/vec'

function printDefs(d: string, def: PathDef) {
    const lines = [
        d, '     ↓', printPathDef(def)
    ]
    console.log(lines.join("\n"))
}

test("d line parsing", () => {
    let d = "M 1 2.5 L 3.5 4 l 2 -2 Z"
    let def = d2PathDef(d)
    printDefs(d, def)
    expect(def.openOrClosed).eq('closed')
    expect(def.vertices.length).eq(3)
    expect(def.vertices[0].point).toMatchObject({x: 1, y: 2.5})
    expect(def.vertices[1].point).toMatchObject({x: 3.5, y: 4})
    expect(def.vertices[2].point).toMatchObject({x: 5.5, y: 2})

    // re-generate the d - can't include relative components
    d = "M 0 1.5 L 1 1.5 L 1 0 Z"
    def = d2PathDef(d)
    printDefs(d, def)
    expect(pathDef2d(def)).eq(d)
})

test("d curve parsing", () => {
    // single curve with default symmetric vertices
    let d = "C 0 1, 2 1, 2 0"
    let def = d2PathDef(d)
    printDefs(d, def)
    expect(def.openOrClosed).eq('open')
    expect(def.vertices.length).eq(2)
    
    expect(def.vertices[0].type).eq("symmetric")
    expect(def.vertices[0].point).toMatchObject({x: 0, y: 0})
    expect(vec.isMirror(def.vertices[0].in!, def.vertices[0].out!)).toBeTruthy() // in is computed
    expect(def.vertices[0].out).toMatchObject({x: 0, y: 1})

    expect(def.vertices[1].type).eq("symmetric")
    expect(def.vertices[1].in).toMatchObject({x: 0, y: 1})
    expect(def.vertices[1].point).toMatchObject({x: 2, y: 0})
    expect(def.vertices[1].out).toMatchObject({x: -0, y: -1}) // extrapolated
    expect(pathDef2d(def)).eq(d) // re-generate the d

    // three curves with asymmetric and explicitly symmetric vertices
    d = "C 0 2, 1 4, 3 4 C 6 4, 6 2, 6 0 C 6 -2, 5 -3, 3 -3"
    def = d2PathDef(d)
    printDefs(d, def)
    expect(def.vertices.length).eq(4)
    expect(def.vertices[0].type).eq("symmetric")
    expect(def.vertices[1].type).eq("asymmetric")
    expect(def.vertices[2].type).eq("symmetric") // explicit
    expect(def.vertices[3].type).eq("symmetric")
    expect(pathDef2d(def)).eq(d)

    // a line followed by a curve should produce a disjoint vertex with no in control point
    d = "L 0 1 C 1 2, 2 2, 3 1"
    def = d2PathDef(d)
    printDefs(d, def)
    expect(def.vertices.length).eq(3)
    expect(def.vertices[0].type).eq("point")
    expect(def.vertices[1].type).eq("disjoint")
    expect(def.vertices[1].in).toBeUndefined()
    expect(def.vertices[2].type).eq("symmetric")
    expect(pathDef2d(def)).eq(d)

    // a curve followed by a line should produce a disjoint vertex with no in control point
    d = "C 0 1, 1 1, 1 0 L 2 0"
    def = d2PathDef(d)
    printDefs(d, def)
    expect(def.vertices.length).eq(3)
    expect(def.vertices[0].type).eq("symmetric")
    expect(def.vertices[1].type).eq("disjoint")
    expect(def.vertices[1].out).toBeUndefined()
    expect(def.vertices[2].type).eq("point")
    expect(pathDef2d(def)).eq(d)


})