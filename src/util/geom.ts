
import Flatten from '@flatten-js/core'
type RawPoint = [number, number]


/// Point Helpers

export type Point = Flatten.Point

export const point = Flatten.point


/// Vector Helpers

export type Vector = Flatten.Vector

export const vector = Flatten.vector


// Box Helpers

export const box = (xmin?: number, ymin?: number, xmax?: number, ymax?: number): Flatten.Box => {
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