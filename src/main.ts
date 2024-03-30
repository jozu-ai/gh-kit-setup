import * as core from '@actions/core'
import { findMatchingRelease, getReleases } from './releases/kit-release'
import { downloadAndInstall } from './installer/install'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  core.info('ℹ️ Kit CLI will be installed')

  try {
    const versionSpec = core.getInput('version')
    const releases = await getReleases(
      core.getInput('token'),
      versionSpec === 'latest'
    )
    core.debug(`Found ${releases.length} releases`)
    let releaseToDownload = undefined

    if (releases.length === 1) {
      releaseToDownload = releases[0]
    } else {
      releaseToDownload = findMatchingRelease(releases, versionSpec)
    }
    if (releaseToDownload === undefined) {
      core.setFailed(`No release found for version ${versionSpec}`)
      return
    }
    downloadAndInstall(releaseToDownload)
  } catch (error) {
    // Handle any errors that occur during the request
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}
