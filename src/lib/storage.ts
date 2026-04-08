'use server'

import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { env } from '#/env.ts'

const R2_ENDPOINT = `https://${env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`

const PRESIGNED_URL_EXPIRY_SECONDS = 3600

const client = new S3Client({
	region: 'auto',
	endpoint: R2_ENDPOINT,
	credentials: {
		accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID,
		secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
	},
	requestChecksumCalculation: 'WHEN_REQUIRED',
	responseChecksumValidation: 'WHEN_REQUIRED',
})

export async function uploadFile(key: string, body: Buffer, contentType: string): Promise<string> {
	await client.send(
		new PutObjectCommand({
			Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
			Key: key,
			Body: body,
			ContentType: contentType,
		}),
	)

	return `${env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`
}

export async function deleteFile(key: string): Promise<void> {
	await client.send(
		new DeleteObjectCommand({
			Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
			Key: key,
		}),
	)
}

export async function getPresignedUploadUrl(key: string, contentType: string): Promise<string> {
	return getSignedUrl(
		client,
		new PutObjectCommand({
			Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
			Key: key,
			ContentType: contentType,
		}),
		{ expiresIn: PRESIGNED_URL_EXPIRY_SECONDS },
	)
}

export function getPublicUrl(key: string): string {
	return `${env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`
}
