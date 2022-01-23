import { globalStyle, style } from '@vanilla-extract/css'

/**
 * Theme
 */

const fontFamily = 'Arial, Helvetica, sans-serif'

const colors = {
    fg: '#222',
    bg: '#f8f8f8',
    button: '#08a',
    output: '#e8f0ff',
    border: '#ccc',
    preview: '#aaa',
    contact: '#f8f8f8'
}

const sizes = {
    pad: 12,
    font: 16,
    fieldHeight: 32,
    borderRadius: 4,
    formWidth: 420
}


/** 
 * Mixins
 */

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
    boxShadow: '0 1px 6px rgba(0, 0, 0, 0.2)'
}


/**
 * Global
 */

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


/**
 * Links
 */

globalStyle('a', {
    color: colors.button,
    cursor: 'pointer',
    userSelect: 'none',
    fontSize: sizes.font
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


/**
 * Shadows
 */

// const frameShadow = {
//     boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
// }

// const insetShadow = {
//     boxShadow: 'inset 0 1px 6px rgba(0, 0, 0, 0.1)'
// }


/**
 * Flex
 */

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


/**
 * Inputs
 */

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


/**
 * Labels
 */

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


/**
 * Viewport
 */

export const viewport = style({
    backgroundColor: '#f0f0f0',
    ...absoluteFill
})

export const tile = style({
    position: 'absolute',
    backgroundColor: '#fff',
    ...frameShadow
})