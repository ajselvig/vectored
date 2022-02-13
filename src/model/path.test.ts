import { expect, test } from 'vitest'
import {dToPathDef} from './path'


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
    expect(def.vertices[0].out).toMatchObject({x: 0, y: 1})
    expect(def.vertices[0].type).toMatchObject("symmetric")
    expect(def.vertices[1].point).toMatchObject({x: 2, y: 0})
    expect(def.vertices[1].type).toMatchObject("symmetric")

    // two curves with an asymmetric middle vertex
    def = dToPathDef("C 0 2, 1 4, 3 4 C 6 4, 6 2, 6 0")
    expect(def.vertices.length).eq(3)
    expect(def.vertices[0].type).toMatchObject("symmetric")
    expect(def.vertices[1].type).toMatchObject("asymmetric")
    expect(def.vertices[2].type).toMatchObject("symmetric")


})