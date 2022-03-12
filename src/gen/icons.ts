export {}

// import {optimize} from 'svgo'
import * as fs from 'fs'
// import * as path from 'path'
import * as tuff from 'tuff-core'
const strings = tuff.strings

// TODO: move this to tuff
function camelCase(str: string) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase()
    }).replace(/[\s-_]+/g, '')
}

const log = console.log


/// Color Maps

type ColorMap = {
    "#000000": string
}

type ColorMaps = {
    light: ColorMap
    dark: ColorMap
}

type Theme = keyof ColorMaps

// map colors to light/dark
const colorMaps: ColorMaps = {
    light: {
        "#000000": "#f0f0f0"
    },
    dark: {
        "#000000": "#222222"
    }
}

type IconDef = {
    path: string
    theme: Theme
    name: string
    varName: string
}

const iconDefs = Array<IconDef>()

/// Process the Icons

const iconsDir = './assets/icons'
const files = fs.readdirSync(iconsDir)
for (let file of files) {
    if (!file.endsWith('.svg')) { continue }
    log('Processing', file)

    const raw = fs.readFileSync(`${iconsDir}/${file}`, {encoding: 'utf8'})
    for (let [theme, map] of Object.entries(colorMaps)) {
        let themeRaw = raw
        for (let [inColor, outColor] of Object.entries(map)) {
            themeRaw = themeRaw.replaceAll(inColor, outColor)
        }
        const name = file.replace('.svg', '')
        const outName = `${name}.${theme}.svg`
        const outPath = `${iconsDir}/gen/${outName}`
        log('Writing', outPath)
        fs.writeFileSync(outPath, themeRaw, {encoding: 'utf8'})
        const camelName = camelCase(name)
        iconDefs.push({
            path: outPath.slice(1), // remove the leading period
            theme: theme as Theme,
            name: camelName,
            varName: camelName+strings.capitalize(theme)
        })
    }
}


/// Generate icons.ts

const defsPath = "./src/ui/icons.ts"
log(`Generating ${defsPath} with ${iconDefs.length} icons`)

const lines = Array<string>()
lines.push(`/// Auto-generated file, do not edit!!`)

// import the raw files
for (let def of iconDefs) {
    lines.push(`import ${def.varName} from '${def.path}?raw'`)
}

// export the icons
lines.push('export default {')
for (let def of iconDefs) {
    lines.push(`  ${def.varName},`)
}
lines.push('}')


fs.writeFileSync(defsPath, lines.join("\n"))