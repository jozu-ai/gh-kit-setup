export interface KitRelease {
  readonly tag: string
  readonly name: string
  readonly assets: KitArchiveFile[]
}
export interface KitArchiveFile {
  readonly archiveFilename: string
  readonly archiveFileUrl: string
}
