import sharp from "sharp";
import fs from "fs";
import path from "path";

// 表の設定
const headerHeight = 83; // ヘッダーの高さ(px)
const rowHeight = 90; // 一行の高さ(px)
const rowsPerSplit = 20; // 分割する行数

/**
 * 画像を縦に分割する関数（ヘッダー含む）
 * @param {string} inputPath - 入力画像のパス
 * @param {string} outputDir - 出力先ディレクトリ
 */
async function splitTableImage(inputPath, outputDir) {
  try {
    // 画像情報を取得
    const metadata = await sharp(inputPath).metadata();
    const totalHeight = metadata.height; // 画像全体の高さ
    const tableHeight = totalHeight - headerHeight; // ヘッダーを除いた高さ
    const totalRows = Math.floor(tableHeight / rowHeight); // 全行数

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    for (let startRow = 0; startRow < totalRows; startRow += rowsPerSplit) {
      // 分割の開始位置（Y座標）
      const startY = startRow === 0 ? 0 : headerHeight + startRow * rowHeight;

      // 分割の高さを計算
      const splitHeight =
        startRow === 0
          ? headerHeight + Math.min(rowsPerSplit, totalRows) * rowHeight
          : headerHeight +
            Math.min(rowsPerSplit, totalRows - startRow) * rowHeight;

      // 分割の高さが画像範囲を超えないよう調整
      const adjustedHeight =
        startY + splitHeight > totalHeight ? totalHeight - startY : splitHeight;

      const outputFileName = path.join(
        outputDir,
        `split_${Math.floor(startRow / rowsPerSplit) + 1}.png`
      );

      await sharp(inputPath)
        .extract({
          left: 0,
          top: Math.round(startY),
          width: metadata.width,
          height: Math.round(adjustedHeight),
        })
        .toFile(outputFileName);

      console.log(`分割画像を出力: ${outputFileName}`);
    }
  } catch (error) {
    console.error("画像分割中にエラーが発生しました:", error);
  }
}

// 使用例
const inputImagePath = "./TuringMachineTrace.png"; // 入力画像のパス
const outputDirectory = "./output"; // 出力先ディレクトリ

splitTableImage(inputImagePath, outputDirectory);
