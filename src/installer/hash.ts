import * as ghCore from '@actions/core'
import * as http from '@actions/http-client'
import * as crypto from 'crypto'
import * as fs from 'fs'

import { KitArchiveFile } from '../types'

type HashAlgorithm = 'md5' | 'sha256'

/**
 * Verify that the downloadedArchive has the hash that matches the one published.
 * @param downloadedArchivePath The path to the downloaded archive.
 * @param file The KitArchiveFile object that contains the hash to verify against.
 * @returns void, and throws an error if the verification fails.
 */
export async function verifyHash(
  downloadedArchivePath: string,
  file: KitArchiveFile
): Promise<void> {
  const hashes = await getPublishedHash(file)
  if (!hashes) {
    return
  }
  const correctHash = hashes.find((hash: { hashFileName: string }) =>
    downloadedArchivePath.endsWith(hash.hashFileName)
  )

  const actualHash = await hashFile(downloadedArchivePath, 'sha256')
  ghCore.debug(
    `Correct hash for ${file.archiveFilename} is ${correctHash?.hash}`
  )
  ghCore.debug(`Actual hash for ${file.archiveFilename} is  ${actualHash}`)

  if (correctHash?.hash !== actualHash) {
    throw new Error(
      `sha256 hash for ${downloadedArchivePath} downloaded from ${file.archiveFileUrl} ` +
        `did not match the hash downloaded from ${file.archiveFileUrl}.` +
        `\nExpected: "${correctHash?.hash}"\nReceived: "${actualHash}"`
    )
  }

  ghCore.info(`sha256 verification of ${downloadedArchivePath} succeeded.`)
}

/**
 * @returns The hash for the given file, using the given algorithm.
 */
async function hashFile(
  file: string,
  algorithm: HashAlgorithm
): Promise<string> {
  ghCore.debug(`${algorithm} hashing ${file}...`)
  const hash = crypto.createHash(algorithm).setEncoding('hex')

  return new Promise<string>((resolve, reject) => {
    fs.createReadStream(file)
      .on('error', reject)
      .pipe(hash)
      .once('finish', () => {
        hash.end()
        resolve(hash.read())
      })
  })
}

type HashFileContents = { hash: string; hashFileName: string }

/**
 * Get the hash from the published hash file.
 * @param file The KitArchiveFile object that contains the hash file URL.
 * @returns The hash from the published hash file, or undefined if the hash file is not found.
 * @throws An error if the hash file is found but its contents are not in the expected format.
 */
async function getPublishedHash(
  file: KitArchiveFile
): Promise<HashFileContents[] | undefined> {
  const httpc = new http.HttpClient()
  const resp = await httpc.get(file.archiveFileUrl, {
    'Content-Type': 'text/plain; charset=utf-8'
  })
  const hashes = await resp.readBody()
  const hashLines = hashes.split('\n')
  const hashContents = Array<HashFileContents>()
  for (const line of hashLines) {
    const parts = line.split('  ')
    if (parts.length === 2) {
      const hash = parts[0]
      const fileName = parts[1]
      hashContents.push({ hash: hash, hashFileName: fileName })
    }
  }
  return hashContents
}
