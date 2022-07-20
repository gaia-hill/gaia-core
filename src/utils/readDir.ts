import fs from 'fs';
import path from 'path';

export default async function readDir(dirPath: string, appType: 'ts' | 'js', callback: (str: string) => any, deep = true) {
  try {
    if (!fs.statSync(dirPath).isDirectory()) return;
  } catch (e) {
    return;
  }

  // 先处理 index
  const resultDirs = fs.readdirSync(dirPath);
  const indexFile = `index.${appType}`;
  await eachPath(path.join(dirPath, indexFile));

  // 在处理其他文件

  for (const file of resultDirs) {
    if (file === indexFile) continue;
    await eachPath(path.join(dirPath, file));
  }

  // 处理每个 path
  async function eachPath(filePath: string) {
    // 检测是否文件或者文件夹
    let isFile = false;
    let isDirectory = false;
    try {
      const stat = fs.statSync(filePath);
      isFile = stat.isFile();
      isDirectory = stat.isDirectory();
    } catch (e) {
      return;
    }

    const { dir, name, ext } = path.parse(filePath);
    if (isFile) {
      if (!`.${appType}`.includes(ext)) return;
      await callback(name === 'index' ? dir : filePath);
    }
    if (deep && isDirectory) await readDir(filePath, appType, callback, deep);
  }
}
