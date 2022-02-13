
import Flatten from '@flatten-js/core'
type RawPoint = [number, number]



/// Point Helpers

export type Point = Flatten.Point

export const p = Flatten.point

/**
 * Creates a +Point+ object from an array of its x and y values.
 * @param numbers an array of numbers (should be 2 of them)
 * @returns a +Point+ object
 */
export const a2p = (numbers: number[]): Point => {
    if (numbers.length == 2) {
        return p(numbers[0], numbers[1])
    }
    throw `Point arrays must have exactly two entries, not ${numbers.length}`
}


/// Vector Helpers

export type Vector = Flatten.Vector

export const v = Flatten.vector

/**
 * Creates a +Point+ object from an array of its x and y values.
 * @param numbers an array of numbers (should be 2 of them)
 * @returns a +Point+ object
 */
export const a2v = (numbers: number[]): Vector => {
    if (numbers.length == 2) {
        return v(numbers[0], numbers[1])
    }
    throw `Vector arrays must have exactly two entries, not ${numbers.length}`
}


// Box Helpers

export const b = (xmin?: number, ymin?: number, xmax?: number, ymax?: number): Flatten.Box => {
    return new Flatten.Box(xmin, ymin, xmax, ymax)
}

export const boxSize = (box: Flatten.Box): Flatten.Vector => {
    return new Flatten.Vector(box.xmax-box.xmin, box.ymax-box.ymin)
}


// Matric Helpers

export const identityMatrix = (): Flatten.Matrix => {
    return new Flatten.Matrix(1, 0, 0, 1, 0, 0)
}

export const transformBox = (box: Flatten.Box, transform: Flatten.Matrix): Flatten.Box => {
    let upperLeft: RawPoint = [box.xmin, box.ymin]
    let lowerRight: RawPoint = [box.xmax, box.ymax]
    upperLeft = transform.transform(upperLeft)
    lowerRight = transform.transform(lowerRight)
    return new Flatten.Box(upperLeft[0], upperLeft[1], lowerRight[0], lowerRight[1])
}