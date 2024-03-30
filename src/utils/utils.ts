import * as os from "os";
import * as http from "@actions/http-client";
import * as ghCore from "@actions/core";
export const HttpClient = new http.HttpClient();

export function getTmpDir(): string {
    // this is what Actions runners use
    const runnerTmp = process.env.RUNNER_TEMP;
    if (runnerTmp) {
        return runnerTmp;
    }
    // fallback
    return os.tmpdir();
}

type OS = "linux" | "darwin" | "windows";

let currentOS: OS | undefined;

export function getOS(): OS {
    if (currentOS == null) {
        const rawOS = process.platform;
        switch (rawOS) {
            case "win32":
                currentOS = "windows";
                break;
            case "linux":
            case "darwin":
                currentOS = rawOS;
                break;
            default:
                currentOS = "linux";
        }
        ghCore.info(`Current operating system is ${currentOS}`);
    }
    return currentOS;
}

type Arch = "arm64" | "x86_64" |"i386" ;

let currentArch: Arch | undefined;

export function getArch(): string {
    if (currentArch == null) {
        const rawArch = process.arch;
        switch (rawArch) {
            case "x64":
                currentArch = "x86_64";
                break;
            case "arm64":
                currentArch = "arm64";
                break;
            case "ia32":
                currentArch = "i386";
                break;
            default:
                currentArch = "x86_64";
        }
        ghCore.info(`Current architecture is ${currentArch}`);
    }
    return process.arch;
}

export function getExecutableBinaryName(): string { 
    if (getOS() === "windows") {
        return "kit.exe";
    }
   return "kit";
}