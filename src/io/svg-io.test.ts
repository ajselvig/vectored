
import { expect, test } from 'vitest'
import { SvgParser } from './svg-io'
import raw from './test/typescript.svg?raw'
import Project from '../model/project'
import Group from '../model/group'

test("svg parsing", () => {
    expect(true).true

    const project = new Project()

    console.log(raw)
    const parser = new SvgParser(raw)
    const tile = parser.toTile(project)
    expect(tile.left).eq(0)
    expect(tile.top).eq(0)
    expect(tile.right).eq(256)
    expect(tile.bottom).eq(256)
    expect(tile.count).eq(1)

    const g = tile.children[0] as Group
    expect(g.count).eq(3)


})