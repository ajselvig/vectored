
import { expect, test } from 'vitest'
import tsSvg from '/assets/test/typescript.svg?raw'
import viteSvg from '/assets/test/vite.svg?raw'
import Project from '../model/project'
import Group from '../model/group'

test("svg parsing", () => {
    expect(true).true

    const project = new Project()

    const tsTile = project.loadTile(tsSvg)
    expect(tsTile.left).eq(0)
    expect(tsTile.top).eq(0)
    expect(tsTile.right).eq(256)
    expect(tsTile.bottom).eq(256)
    expect(tsTile.count).eq(1)

    const g = tsTile.children[0] as Group
    expect(g.count).eq(3)

    const viteTile = project.loadTile(viteSvg)
    expect(viteTile.right).eq(410)
    expect(viteTile.bottom).eq(404)
    expect(viteTile.count).eq(2)

    const grad = viteTile.getPaintServer('paint0_linear')
    expect(grad).toBeDefined()
    expect(grad.type).eq('linear')
    expect(grad.stops.length).eq(2)

})