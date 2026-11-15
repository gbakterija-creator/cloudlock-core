import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

export async function GET() {
  const mountLetter = "Z:";
  const fallbackPath = "C:\\CloudLock_VirtualStorage";

  // Provjeri postoji li montirani disk Z:, ako ne gledaj lokalnu mapu
  const targetDir = fs.existsSync(mountLetter + "\\")
    ? mountLetter + "\\"
    : fs.existsSync(fallbackPath)
    ? fallbackPath
    : null;

  if (!targetDir) {
    return NextResponse.json({
      isMounted: false,
      scratch: {
        stagedGb: 0,
        pinnedGb: 0,
        purgeableGb: 0,
        totalCapacityGb: 100,
      },
      files: [],
      error: "Disk Z: nije montiran, a fallback mapa ne postoji.",
    });
  }

  // 1. Očitavanje stvarnog kapaciteta diska preko Windows WMI
  let totalCapacityGb = 100;
  let freeGb = 50;

  try {
    const driveLetter = targetDir.startsWith("Z:") ? "Z" : "C";
    const stdout = execSync(
      `powershell -Command "Get-CimInstance Win32_LogicalDisk -Filter 'DeviceID=\\'${driveLetter}:\\'' | Select-Object -ExpandProperty FreeSpace, Size"`,
      { encoding: "utf8", timeout: 2500 }
    ).trim();

    const lines = stdout.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length >= 2) {
      const freeBytes = parseInt(lines[0], 10);
      const sizeBytes = parseInt(lines[1], 10);
      freeGb = parseFloat((freeBytes / 1024 / 1024 / 1024).toFixed(1));
      totalCapacityGb = parseFloat((sizeBytes / 1024 / 1024 / 1024).toFixed(1));
    }
  } catch (err) {
    console.warn("Nije moguće očitati WMI podatke diska, koristim procijenjene vrijednosti:", err);
  }

  // 2. Čitanje stvarnih datoteka iz korijena diska
  let files = [];
  let totalScannedBytes = 0;

  try {
    const entries = fs.readdirSync(targetDir, { withFileTypes: true });

    files = entries.map((entry, idx) => {
      const fullPath = path.join(targetDir, entry.name);
      let sizeBytes = 0;
      let isDir = entry.isDirectory();

      try {
        if (!isDir) {
          const stats = fs.statSync(fullPath);
          sizeBytes = stats.size;
          totalScannedBytes += sizeBytes;
        }
      } catch (e) {
        // Ignoriraj locked datoteke
      }

      const sizeGb = parseFloat((sizeBytes / 1024 / 1024 / 1024).toFixed(2));
      const ext = path.extname(entry.name).toLowerCase();

      let type: "folder" | "video" | "project" | "sequence" = "project";
      if (isDir) type = "folder";
      else if ([".mov", ".mp4", ".mkv", ".braw", ".ari"].includes(ext)) type = "video";
      else if ([".blend", ".nk", ".hip", ".prproj"].includes(ext)) type = "project";

      return {
        id: `f_${idx}_${entry.name}`,
        name: entry.name,
        path: fullPath,
        sizeGb: sizeGb > 0 ? sizeGb : 0.05, // vizualni minimum za tablicu
        type,
        isPinned: false,
        status: "replicated" as const,
      };
    });
  } catch (err) {
    console.error("Greška pri čitanju datoteka s diska:", err);
  }

  const occupiedGb = parseFloat((totalScannedBytes / 1024 / 1024 / 1024).toFixed(1));
  const usedGb = Math.max(occupiedGb, parseFloat((totalCapacityGb - freeGb).toFixed(1)));

  return NextResponse.json({
    isMounted: true,
    mountPath: targetDir,
    scratch: {
      stagedGb: parseFloat((usedGb * 0.1).toFixed(1)), // simulacija staged dijela
      pinnedGb: parseFloat((usedGb * 0.6).toFixed(1)), // simulacija pinanog dijela
      purgeableGb: parseFloat((usedGb * 0.3).toFixed(1)),
      totalCapacityGb: totalCapacityGb || 100,
    },
    files,
  });
}