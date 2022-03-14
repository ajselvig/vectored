
import { expect, test } from 'vitest'
import Project from '../model/project'
import Group from '../model/group'

import tsSvg from '/assets/test/typescript.svg?raw'
import viteSvg from '/assets/test/vite.svg?raw'
import npmSvg from '/assets/test/npm.svg?raw'
import svgSvg from '/assets/test/svg.svg?raw'

test("svg parsing", () => {
    expect(true).true

    const project = new Project()

    // typescript

    const tsTile = project.loadTile(tsSvg)
    expect(tsTile.left).eq(0)
    expect(tsTile.top).eq(0)
    expect(tsTile.right).eq(256)
    expect(tsTile.bottom).eq(256)
    expect(tsTile.count).eq(1)

    let g = tsTile.children[0] as Group
    expect(g.count).eq(3)

    // vite

    const viteTile = project.loadTile(viteSvg)
    expect(viteTile.right).eq(410)
    expect(viteTile.bottom).eq(404)
    expect(viteTile.count).eq(2)

    const grad = viteTile.getPaintServer('paint0_linear')
    expect(grad).toBeDefined()
    expect(grad.type).eq('linear')
    expect(grad.stops.length).eq(2)

    // npm

    const npmTile = project.loadTile(npmSvg)
    g = npmTile.children[0] as Group
    expect(g.count).eq(4)

    // svg

    const svgTile = project.loadTile(svgSvg)
    expect(svgTile.count).eq(6)
})