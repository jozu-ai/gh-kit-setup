import * as ghCore from '@actions/core'
import * as ghIO from '@actions/io'
import * as ghToolCache from '@actions/tool-cache'
import path from 'path'
import * as fs from 'fs'
import { KitArchiveFile, KitRelease } from '../types'
import { downloadFile } from './download'
import {
  getArch,
  getExecutableBinaryName,
  getOS,
  getTmpDir
} from '../utils/utils'
import { verifyHash } from './hash'

export async function downloadAndInstall(release: KitRelease): Promise<string> {
  ghCore.debug(`Downloading and installing release ${release.tag}`)
  const files = release.assets
    .filter(filterAssetsByOS)
    .filter(filterAssetsByArch)
  if (files.length === 0) {
    throw new Error(`No matching release found for ${getOS()} and ${getArch()}`)
  }
  const file = files[0]
  const downloadPath = await downloadFile(file)
  const checksum = release.assets.find(asset =>
    asset.archiveFilename.includes('checksums')
  ) as KitArchiveFile
  await verifyHash(downloadPath, checksum)
  const dir = await getExecutableTargetDir()
  const finalPath = await extract(downloadPath, dir)
  const finalExecPath = path.join(finalPath, getExecutableBinaryName())
  const chmod = '755'
  ghCore.debug(`chmod ${chmod} ${finalExecPath}`)
  await fs.promises.chmod(finalExecPath, chmod)
  return finalExecPath
}

export async function getExecutableTargetDir(): Promise<string> {
  let parentDir

  const tmpDir = getTmpDir()
  if (tmpDir) {
    ghCore.info('Using temporary directory for storage')
    parentDir = tmpDir
  } else {
    ghCore.info('Using CWD for storage')
    parentDir = process.cwd()
  }
  const targetDir = path.join(parentDir, 'jozu-bin')

  await ghIO.mkdirP(targetDir)
  ghCore.info(`CLIs will be downloaded to ${targetDir}`)
  ghCore.addPath(targetDir)
  ghCore.info(`Added ${targetDir} to PATH`)

  return targetDir
}

async function extract(archive: string, dest: string): Promise<string> {
  const basename = path.basename(archive)
  const extname = path.extname(basename)
  if (extname === '.zip') {
    return await ghToolCache.extractZip(archive, dest)
  }
  if (basename.endsWith('.tar.gz') || basename.endsWith('.tgz')) {
    return await ghToolCache.extractTar(archive, dest)
  }
  throw new Error(
    `No way to extract ${archive}:
         Unknown file type "${basename}" - Supported formats are .zip and .tar.gz`
  )
}

function filterAssetsByOS(file: KitArchiveFile): boolean {
  const os = getOS()
  const lowerCaseFilename = file.archiveFilename.toLowerCase()
  return lowerCaseFilename.includes(os)
}

function filterAssetsByArch(file: KitArchiveFile): boolean {
  const arch = getArch()
  const lowerCaseFilename = file.archiveFilename.toLowerCase()
  return lowerCaseFilename.includes(arch)
}
