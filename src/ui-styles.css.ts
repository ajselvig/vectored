import { globalStyle, style } from '@vanilla-extract/css'

/// Mixins

const scalePush = {
    ':hover': {
        transform: 'scale(1.04)'
    },
    ':active': {
        transform: 'scale(0.96)'
    }
}

const absoluteFill = {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
} as const

const frameShadow = {
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
}
// const insetShadow = {
//     boxShadow: 'inset 0 1px 6px rgba(0, 0, 0, 0.1)'
// }



/// Theme

const fontFamily = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif'

const colors = {
    fg: '#222',
    bg: '#f8f8f8',
    button: '#08a',
    border: '#ccc',
    plane: '#f8f8f8',
    planeGrid: '#ccc',
    pane: '#f0f0f0',
    tool: '#2d2d2d',
    header: '#d8d8d8',
    selection: '#f3a536',
    hoverBg: 'rgba(0, 0, 0, 0.06)',
    activeBg: 'rgba(0, 0, 0, 0.12)'
}

const sizes = {
    pad: 12,
    font: 16,
    fieldHeight: 32,
    borderRadius: 4,
    formWidth: 420,
    projectColumnWidth: 200,
    topBar: 48,
    bottomBar: 24
}


/// Global

globalStyle('html, body', {
    fontFamily: fontFamily,
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    color: colors.fg,
    backgroundColor: colors.bg,
    fontSize: sizes.font,
    boxSizing: 'border-box',
    margin: 0
})

globalStyle('body', {
    paddingBottom: '4em'
})

globalStyle('*', {
    boxSizing: 'border-box'
})


/// Typography

export const header = style({
    fontWeight: 'bold',
    backgroundColor: colors.header,
    textShadow: '0 1px 0 rgba(255, 255, 255, 0.5)'
})


/// Positioning

export const stickyTop = style({
    position: 'sticky',
    top: 0
})


/// Links

globalStyle('a', {
    cursor: 'pointer',
    userSelect: 'none'
})

export const button = style({
    display: 'block',
    backgroundColor: colors.button,
    color: '#fff',
    borderRadius: sizes.borderRadius,
    fontWeight: 'bold',
    padding: `${sizes.pad}px ${sizes.pad*2}px`,
    textAlign: 'center',
    textDecoration: 'none',
    ...scalePush
})


/// Flex

export const flex = {
    row: style({
        display: 'flex'
    }),
    column: style({
        display: 'flex',
        flexDirection: 'column'
    }),
    stretch: style({
        flex: '1 1 auto'
    }),
    shrink: style({
        flex: '0 0 auto'
    })
}


/// Inputs

globalStyle('input, textarea', {
    fontSize: sizes.font,
    height: sizes.fieldHeight,
    padding: '6px 8px',
    display: 'block',
    border: `1px solid ${colors.border}`,
    borderRadius: sizes.borderRadius-1,
    width: '100%'
})
globalStyle('textarea', {
    height: 'initial',
    fontFamily: fontFamily
})

globalStyle('input[type=checkbox], input[type=radio]', {
    width: 'initial',
    display: 'inline-block',
    height: 'initial',
    padding: 0,
    margin: 0,
    transform: 'scale(1.2)'
})


/// Labels

globalStyle('label', {
    display: 'flex',
    cursor: 'pointer',
    gap: 8,
    fontSize: 14,
    alignItems: 'center'
})

globalStyle('label input', {
    flex: '0 0 auto',
    width: 'initial'
})


/// Main Layout

globalStyle('#app-container', {
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex'
})

export const appLayout = style({
    display: 'flex',
    flexDirection: 'column',
    ...absoluteFill
})

export const projectLayout = style({
    flex: '1 1 auto',
    display: 'flex',
    alignItems: 'stretch',
    minHeight: 0,
    zIndex: 0
})


/// Top Bar

export const topBar = style({
    backgroundColor: colors.tool,
    display: 'flex',
    flex: `0 0 ${sizes.topBar}px`,
    zIndex: 1,
    ...frameShadow
})


/// Bottom Bar

export const bottomBar = style({
    backgroundColor: colors.tool,
    display: 'flex',
    flex: `0 0 ${sizes.bottomBar}px`,
    zIndex: 1,
    ...frameShadow
})


/// Tree

const treeSizes = {
    font: 15,
    gap: 5
}

export const treeLayout = style({
    flex: `0 0 ${sizes.projectColumnWidth}px`,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.pane,
    zIndex: 1,
    overflowX: 'scroll',
    ...frameShadow
})

export const treeItem = style({
    flex: '0 0 auto',
    lineHeight: 1
})

export const treeItemSelf = style({
    display: 'flex',
    gap: treeSizes.gap,
    ':hover': {
        backgroundColor: colors.hoverBg
    },
    ':active': {
        backgroundColor: colors.activeBg
    }
})

export const treeItemSelected = style({
    backgroundColor: colors.selection,
    ':hover': {
        backgroundColor: colors.selection
    },
    ':active': {
        backgroundColor: colors.selection
    }
})

export const treeItemTitle = style({
    flex: '1 1 auto',
    fontSize: treeSizes.font,
    padding: `${treeSizes.gap}px ${treeSizes.gap*2}px`
})

export const treeItemChildren = style({
    paddingLeft: treeSizes.gap*3
})


/// Viewport

export const viewport = style({
    position: 'relative',
    flex: '1 1 auto',
    zIndex: 0,
    overflow: 'scroll'
})

export const plane = style({
    backgroundColor: colors.plane,
    backgroundImage: `radial-gradient(${colors.planeGrid} 1px, transparent 0)`,
})

export const tileContainer = style({
    position: 'absolute',
    backgroundColor: '#fff',
    ...frameShadow
})

export const tile = style({
    ...absoluteFill
})

export const tileLabel = style({
    position: 'absolute',
    fontSize: 13,
    padding: 2,
    lineHeight: 1,
    top: -18,
    left: 0
})


/// Settings

export const settingsLayout = style({
    flex: `0 1 ${sizes.projectColumnWidth}px`,
    minWidth: 0,
    maxWidth: 0, // for now
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.pane,
    zIndex: 1,
    ...frameShadow
})