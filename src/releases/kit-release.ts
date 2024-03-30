import * as core from '@actions/core'
import * as gh from '@actions/github'
import * as ghToolCache from "@actions/tool-cache";
import { KitRelease, KitArchiveFile } from '../types'


export async function getReleases(token: string, latest: boolean ): Promise<KitRelease[]>{

        // Make a GET request to the GitHub API to retrieve the releases
        let route ='GET /repos/jozu-ai/kitops/releases' 
        if(latest){
            route = 'GET /repos/jozu-ai/kitops/releases/latest'
        } 
        const ghApi = gh.getOctokit(token)
        const response = await ghApi.request(route)
        if (response.status === 200) {
          let releases = response.data
          if (latest){
              releases = [releases]
          }
          
          // Process the releases
          const kitReleases: KitRelease[] = []
          releases.forEach((release: any) => {
            const kitRelase = {
                tag: release.tag_name,
                name: release.name,
                assets: Array<KitArchiveFile>(),
            }
            release.assets.forEach((asset: any) => {
                const kitAsset = {
                    archiveFilename: asset.name,
                    archiveFileUrl: asset.browser_download_url,
                }
              kitRelase.assets.push(kitAsset)
            })
            kitReleases.push(kitRelase)
          })
          return kitReleases
        } else {
        // Handle the case when the request was not successful
          core.warning(`Failed to retrieve releases. Status code: ${response.status}`)
          return Promise.reject(new Error('Failed to retrieve releases'))
        }
}


export function findMatchingRelease(releases: KitRelease[], version: string): KitRelease | undefined {
    const selectedVersion = ghToolCache.evaluateVersions(releases.map(release => release.tag), version)
    return releases.find(release => release.tag === selectedVersion)
}