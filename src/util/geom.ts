
import Flatten from '@flatten-js/core'
type RawPoint = [number, number]
import * as box from '../geom/box'



// Matric Helpers

export const identityMatrix = (): Flatten.Matrix => {
    return new Flatten.Matrix(1, 0, 0, 1, 0, 0)
}

export const transformBox = (b: box.Box, transform: Flatten.Matrix): box.Box => {
    let upperLeft: RawPoint = [b.x, b.y]
    let lowerRight: RawPoint = [b.x+b.width, b.y+b.height]
    upperLeft = transform.transform(upperLeft)
    lowerRight = transform.transform(lowerRight)
    return box.make(upperLeft[0], upperLeft[1], lowerRight[0]-upperLeft[0], lowerRight[1]-upperLeft[1])
}