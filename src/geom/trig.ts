/// These are just wrappers around the standard Math functions
/// that assume everything is in degrees.

const deg2rad = Math.PI/180

export function cos(degrees: number): number {
    return Math.cos(degrees * deg2rad)
}

export function sin(degrees: number): number {
    return Math.sin(degrees * deg2rad)
}

export function tan(degrees: number): number {
    return Math.tan(degrees * deg2rad)
}