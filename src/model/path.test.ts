import { expect, test } from 'vitest'
import {Vertex} from './path'


test("Vertex Zeroing", () => {
    const vertext = new Vertex()
    expect(vertext.point.x).eq(0)
})