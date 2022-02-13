import { expect, test } from 'vitest'
import {dToPathDef} from './path'
import * as geom from '../util/geom'


test("d line parsing", () => {
    const def = dToPathDef("M 1 2.5 L 3.5 4 l 2 -2 Z")
    expect(def.openOrClosed).eq('closed')
    expect(def.vertices.length).eq(3)
    expect(def.vertices[0].point).toMatchObject(geom.p(1, 2.5))
    expect(def.vertices[1].point).toMatchObject(geom.p(3.5, 4))
    expect(def.vertices[2].point).toMatchObject(geom.p(5.5, 2))
})

test("d curve parsing", () => {
    // single curve with default symmetric vertices
    let def = dToPathDef("C 0 1, 2 1, 2 0")
    expect(def.openOrClosed).eq('open')
    expect(def.vertices.length).eq(2)
    expect(def.vertices[0].point).toMatchObject(geom.p(0, 0))
    expect(def.vertices[0].out).toMatchObject(geom.p(0, 1))
    expect(def.vertices[0].type).toMatchObject("symmetric")
    expect(def.vertices[1].point).toMatchObject(geom.p(2, 0))
    expect(def.vertices[1].type).toMatchObject("symmetric")

    // two curves with an asymmetric middle vertex
    def = dToPathDef("C 0 2, 1 4, 3 4 C 6 4, 6 2, 6 0")
    expect(def.vertices.length).eq(3)
    expect(def.vertices[0].type).toMatchObject("symmetric")
    expect(def.vertices[1].type).toMatchObject("asymmetric")
    expect(def.vertices[2].type).toMatchObject("symmetric")


})