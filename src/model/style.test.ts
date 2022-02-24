import { expect, test } from 'vitest'
import { attributes2StyleDef } from './style'


test("Basic style parsing", () => {
    const attrs: Record<string,string> = {
        fill: '#fff',
        stroke: '#000',
        'stroke-width': '2'
    }
    const def = attributes2StyleDef(attrs)
    expect(def).toBeDefined()
    expect(def?.fill).eq('#FFFFFF')
    expect(def?.stroke).eq('#000000')
    expect(def?.strokeWidth).eq(2)
})