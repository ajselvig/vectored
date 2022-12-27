import { expect, test } from 'vitest'
import {d2PathDef, PathDef, pathDef2d, points2Def, printPathDef, transformPath} from './path'
import * as tuff from 'tuff-core'
const mat = tuff.mat
const vec = tuff.vec

function printDefs(d: string, def: PathDef) {
    const lines = [
        d, '     ↓', printPathDef(def)
    ]
    console.log(lines.join("\n"))
}

test("polyline points parsing", () => {
    let points = "0,1 2,3, 4,5"
    let def = points2Def(points, "open")
    expect(def.vertices.length).eq(3)
    expect(def.vertices[0].point).toMatchObject({x: 0, y: 1})
    expect(def.vertices[0].type).eq("point")
})

test("d line parsing", () => {
    let d = "M 1,2.5 L 3.5,4 l 2,-2 Z"
    let def = d2PathDef(d)
    let subpath = def.subpaths[0]
    printDefs(d, def)
    expect(subpath.openOrClosed).eq('closed')
    expect(subpath.vertices.length).eq(3)
    expect(subpath.vertices[0].point).toMatchObject({x: 1, y: 2.5})
    expect(subpath.vertices[1].point).toMatchObject({x: 3.5, y: 4})
    expect(subpath.vertices[2].point).toMatchObject({x: 5.5, y: 2})

    // re-generate the d - can't include relative components
    d = "M 0,1.5 L 1,1.5 L 1,0 Z"
    def = d2PathDef(d)
    printDefs(d, def)
    expect(pathDef2d(def)).eq(d)
})

test("vertical and horizontal line parsing", () => {
    let d = "M 0 0 V 1 H 1 V -1 Z"
    let def = d2PathDef(d)
    let subpath = def.subpaths[0]
    printDefs(d, def)
    expect(subpath.vertices.length).eq(4)
})

test("nested path parsing", () => {
    const d = "M0,0h18v6H9v1H5V6H0V0z M1,5h2V2h1v3h1V1H1V5z M6,1v5h2V5h2V1H6z M8,2h1v2H8V2z M11,1v4h2V2h1v3h1V2h1v3h1V1H11z"
    const def = d2PathDef(d)
    printDefs(d, def)
    expect(def.subpaths.length).eq(5)
    const subpath = def.subpaths[0]
    expect(subpath.vertices.length).eq(8)
})


test("d curve parsing", () => {
    // single curve with default symmetric vertices
    let d = "M 0,0 C 0,1 2,1 2,0"
    let def = d2PathDef(d)
    printDefs(d, def)
    let subpath = def.subpaths[0]
    expect(subpath.openOrClosed).eq('open')
    expect(subpath.vertices.length).eq(2)
    
    expect(subpath.vertices[0].type).eq("symmetric")
    expect(subpath.vertices[0].point).toMatchObject({x: 0, y: 0})
    expect(vec.isMirror(subpath.vertices[0].in!, subpath.vertices[0].out!)).toBeTruthy() // in is computed
    expect(subpath.vertices[0].out).toMatchObject({x: 0, y: 1})

    expect(subpath.vertices[1].type).eq("symmetric")
    expect(subpath.vertices[1].in).toMatchObject({x: 0, y: 1})
    expect(subpath.vertices[1].point).toMatchObject({x: 2, y: 0})
    expect(subpath.vertices[1].out).toMatchObject({x: -0, y: -1}) // extrapolated
    expect(pathDef2d(def)).eq(d) // re-generate the d

    // three curves with asymmetric and explicitly symmetric vertices
    d = "M 0,0 C 0,2 1,4 3,4 C 6,4 6,2 6,0 C 6,-2 5,-3 3,-3"
    def = d2PathDef(d)
    subpath = def.subpaths[0]
    printDefs(d, def)
    expect(subpath.vertices.length).eq(4)
    expect(subpath.vertices[0].type).eq("symmetric")
    expect(subpath.vertices[1].type).eq("asymmetric")
    expect(subpath.vertices[2].type).eq("symmetric") // explicit
    expect(subpath.vertices[3].type).eq("symmetric")
    expect(pathDef2d(def)).eq(d)

    // a line followed by a curve should produce a disjoint vertex with no in control point
    d = "M 0,0 L 0,1 C 1,2 2,2 3,1"
    def = d2PathDef(d)
    subpath = def.subpaths[0]
    printDefs(d, def)
    expect(subpath.vertices.length).eq(3)
    expect(subpath.vertices[0].type).eq("point")
    expect(subpath.vertices[1].type).eq("disjoint")
    expect(subpath.vertices[1].in).toBeUndefined()
    expect(subpath.vertices[2].type).eq("symmetric")
    expect(pathDef2d(def)).eq(d)

    // a curve followed by a line should produce a disjoint vertex with no in control point
    d = "M 0,0 C 0,1 1,1 1,0 L 2,0"
    def = d2PathDef(d)
    subpath = def.subpaths[0]
    printDefs(d, def)
    expect(subpath.vertices.length).eq(3)
    expect(subpath.vertices[0].type).eq("symmetric")
    expect(subpath.vertices[1].type).eq("disjoint")
    expect(subpath.vertices[1].out).toBeUndefined()
    expect(subpath.vertices[2].type).eq("point")
    expect(pathDef2d(def)).eq(d)


})

test("path transforming", () => {
    const d = "M 0,0 C 0,1 2,1 2,0"
    const def = d2PathDef(d)
    printDefs(d, def)
    const vertices = def.subpaths[0].vertices
    
    // translate
    const dx = 1
    const dy = 2
    const translate = mat.translate(mat.identity(), dx, dy)
    const translatedDef = transformPath(def, translate)
    const translatedVertices = translatedDef.subpaths[0].vertices
    expect(translatedVertices[0].point.x).eq(vertices[0].point.x + dx)
    expect(translatedVertices[0].point.y).eq(vertices[0].point.y + dy)

})