export type ImageTransformOptions = {
	width?: number
	height?: number
	quality?: number
	format?: 'webp' | 'avif' | 'jpeg' | 'png'
	fit?: 'cover' | 'contain' | 'fill'
}
