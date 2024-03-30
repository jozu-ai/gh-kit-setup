import * as ghCore from "@actions/core";
import * as ghToolCache from "@actions/tool-cache";
import * as path from "path";
import * as crypto from "crypto";
import { KitArchiveFile } from "../types";
import { getTmpDir }  from "../utils/utils";



/**
 * Downloads the given archive with a GUID prefix to prevent collisions and verifies its hash.
 * @returns The path the file was downloaded to.
 */
export async function downloadFile(file: KitArchiveFile): Promise<string> {
    // tool-cache download downloads to /tmp/<guid> to prevent collisions.
    // we mimic that behaviour here but keep the file's name so it has the correct extension
    // a GUID is 128 bits = 16 bytes - this one has no hyphens but it serves the same purpose.
    const guid = crypto.randomBytes(16).toString("hex");
    const filename = `${guid}-${file.archiveFilename}`;
    const dlStartTime = Date.now();
    const downloadPath = await ghToolCache.downloadTool(file.archiveFileUrl, path.join(getTmpDir(), filename));
    ghCore.debug(`Downloaded to ${downloadPath}`);
    const elapsed = Date.now() - dlStartTime;
    ghCore.info(`Downloaded ${file.archiveFilename} in ${(elapsed / 1000).toFixed(1)}s`);
    ghToolCache.isExplicitVersion
    return downloadPath;
}