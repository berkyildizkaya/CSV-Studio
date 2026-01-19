import { readFile, writeTextFile } from "@tauri-apps/plugin-fs";

/**
 * Binary buffer içeriğini analiz ederek doğru encoding ile string'e çevirir.
 * UTF-16LE, UTF-16BE ve UTF-8 (BOM'lu veya BOM'suz) formatlarını destekler.
 */
export function decodeFileContent(buffer: Uint8Array): string {
  // UTF-16 LE BOM kontrolü (0xFF 0xFE)
  if (buffer.length >= 2 && buffer[0] === 0xFF && buffer[1] === 0xFE) {
    return new TextDecoder("utf-16le").decode(buffer.subarray(2));
  }
  // UTF-16 BE BOM kontrolü (0xFE 0xFF)
  if (buffer.length >= 2 && buffer[0] === 0xFE && buffer[1] === 0xFF) {
    return new TextDecoder("utf-16be").decode(buffer.subarray(2));
  }
  
  // Basit bir null byte kontrolü ile UTF-16 tahmini
  let nullCount = 0;
  const sampleSize = Math.min(buffer.length, 1000);
  for(let i=0; i<sampleSize; i++) {
      if (buffer[i] === 0x00) nullCount++;
  }
  
  // Eğer örneklemin %30'undan fazlası null byte ise UTF-16LE varsayalım
  if (nullCount > 0 && nullCount > sampleSize * 0.3) {
       return new TextDecoder("utf-16le").decode(buffer);
  }

  // Varsayılan UTF-8
  return new TextDecoder("utf-8").decode(buffer);
}

/**
 * Belirtilen yoldaki dosyayı binary olarak okur ve text olarak döndürür.
 */
export async function readAndDecodeFile(filePath: string): Promise<string> {
  const buffer = await readFile(filePath);
  return decodeFileContent(buffer);
}

/**
 * Belirtilen yola metin içeriğini yazar.
 */
export async function saveFileContent(filePath: string, content: string): Promise<void> {
  await writeTextFile(filePath, content);
}
