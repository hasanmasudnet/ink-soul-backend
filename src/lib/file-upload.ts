import path from "path"
import fs from "fs"
import { v4 as uuidv4 } from "uuid"

export async function HandleFileUploads(reqFiles: any) {
try {
    let uploadedFiles: { [key: string]: string } = {};
    if (!reqFiles || Object.keys(reqFiles).length === 0) {
    return uploadedFiles;
    }

    const fileKeys = Object.keys(reqFiles);
    
    for (const key of fileKeys) {
    const file: any = reqFiles[key];
    const ext = path.extname(file.name);
    const uniqueFileName = uuidv4() + ext;
    const uploadPath = path.join(__dirname, '../../uploads', uniqueFileName);

    await new Promise<void>((resolve, reject) => {
        file.mv(uploadPath, (err: any) => {
        if (err) {
            reject(err);
        } else {
            resolve();
        }
        });
    });

    uploadedFiles[key] = uniqueFileName;
    }

    return uploadedFiles;
} catch (err) {
    return {}
}
}

// handle delete files
export function HandleDeleteFiles(fileNames: (string | null | undefined)[]) {
return new Promise<void>((resolve, reject) => {
    let filesProcessed = 0
    let totalFiles = fileNames.length

    fileNames.forEach((fileName) => {
    if (!fileName) {
        filesProcessed++
        if (filesProcessed === totalFiles) {
        resolve()
        }
        return
    }

    const filePath = path.join(__dirname, '../../uploads', fileName)

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
        filesProcessed++
        if (filesProcessed === totalFiles) {
            resolve()
        }
        return
        }

        fs.unlink(filePath, (err) => {
        if (err) {
            reject(err)
            return
        }

        filesProcessed++
        if (filesProcessed === totalFiles) {
            resolve()
        }
        })
    })
    })
})
}