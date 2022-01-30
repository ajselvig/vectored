
import Flatten from '@flatten-js/core'
// const vector = Flatten.vector
// const point = Flatten.point
type RawPoint = [number, number]

export const box = (xmin?: number, ymin?: number, xmax?: number, ymax?: number): Flatten.Box => {
    return new Flatten.Box(xmin, ymin, xmax, ymax)
}

export const identityMatrix = (): Flatten.Matrix => {
    return new Flatten.Matrix(1, 0, 0, 1, 0, 0)
}

export const boxSize = (box: Flatten.Box): Flatten.Vector => {
    return new Flatten.Vector(box.xmax-box.xmin, box.ymax-box.ymin)
}

export const transformBox = (box: Flatten.Box, transform: Flatten.Matrix): Flatten.Box => {
    let upperLeft: RawPoint = [box.xmin, box.ymin]
    let lowerRight: RawPoint = [box.xmax, box.ymax]
    upperLeft = transform.transform(upperLeft)
    lowerRight = transform.transform(lowerRight)
    return new Flatten.Box(upperLeft[0], upperLeft[1], lowerRight[0], lowerRight[1])
}