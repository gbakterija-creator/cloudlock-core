"use client";

import { useEffect, useState, useRef, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Download, FileText, Image as ImageIcon, Film, HardDrive, 
  Folder, ChevronRight, Archive, GitFork, X, Check, Loader2, UploadCloud
} from "lucide-react";

interface SubFolder {
  name: string;
  path: string;
}

interface SharedFile {
  name: string;
  key: string;
  size: number;
  type: "video" | "image" | "document" | "other";
  url: string;
}

export default function SharePage({ params }: { params: Promise<{ id: string[] }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const segments = Array.isArray(resolvedParams.id) ? resolvedParams.id : [resolvedParams.id];
  const currentPath = segments.join("/");

  const [files, setFiles] = useState<SharedFile[]>([]);
  const [subfolders, setSubfolders] = useState<SubFolder[]>([]);
  const [folderName, setFolderName] = useState("");
  const [selectedFile, setSelectedFile] = useState<SharedFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fork state
  const [isForkOpen, setIsForkOpen] = useState(false);
  const [branchName, setBranchName] = useState("");
  const [forking, setForking] = useState(false);
  const [forkError, setForkError] = useState("");

  const selectedFileRef = useRef<SharedFile | null>(null);
  selectedFileRef.current = selectedFile;

  const filesRef = useRef<SharedFile[]>([]);
  filesRef.current = files;

  const subfoldersRef = useRef<SubFolder[]>([]);
  subfoldersRef.current = subfolders;

  const fetchData = async (isBackground = false) => {
    if (isBackground) setIsSyncing(true);
    try {
      const res = await fetch(`/api/share/${currentPath}`, { cache: "no-store" });
      const data = await res.json();

      if (data.files) {
        const newFiles: SharedFile[] = data.files;
        const newSubfolders: SubFolder[] = data.subfolders || [];

        const oldFingerprint = filesRef.current.map((f) => `${f.key}:${f.size}`).join("|");
        const newFingerprint = newFiles.map((f) => `${f.key}:${f.size}`).join("|");
        const foldersFingerprint = subfoldersRef.current.map((s) => s.path).join("|");
        const newFoldersFingerprint = newSubfolders.map((s) => s.path).join("|");

        if (oldFingerprint !== newFingerprint || !isBackground) {
          setFiles(newFiles);
          if (selectedFileRef.current) {
            const stillExists = newFiles.find((f) => f.key === selectedFileRef.current?.key);
            if (!stillExists && newFiles.length > 0) {
              setSelectedFile(newFiles[0]);
            }
          } else if (newFiles.length > 0) {
            setSelectedFile(newFiles[0]);
          }
        }

        if (foldersFingerprint !== newFoldersFingerprint || !isBackground) {
          setSubfolders(newSubfolders);
        }

        setFolderName(data.folderName || "");
      }
    } catch (e) {
      console.error("Auto-sync greška:", e);
    } finally {
      if (isBackground) {
        setTimeout(() => setIsSyncing(false), 500);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData(false);
    setBranchName(`${decodeURIComponent(segments[0])} - Radna Kopija`);
  }, [currentPath]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible" && !isUploading) {
        fetchData(true);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [currentPath, isUploading]);

  // Upload handler
  const handleFileUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1. Zatraži Presigned PUT URL
      const urlRes = await fetch("/api/share/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folderPath: currentPath,
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
        }),
      });

      const { uploadUrl, error } = await urlRes.json();
      if (error) throw new Error(error);

      // 2. Direct upload na R2 preko XMLHttpRequest radi preciznog progress bara
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl, true);
        // Content-Type izostavljen radi agnostičkog R2 binary uploada

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => reject(new Error("Mrežna greška tijekom uploada."));
        xhr.send(file);
      });

      // 3. Osvježi lokalni Rclone VFS cache
      fetch("http://127.0.0.1:5572/vfs/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recursive: true }),
      }).catch(() => {});

      // 4. Ažuriraj prikaz datoteka
      await fetchData(false);
    } catch (err: any) {
      alert(`Greška pri slanju: ${err.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFork = async () => {
    if (!branchName.trim()) return;
    setForking(true);
    setForkError("");

    try {
      const res = await fetch("/api/share/fork", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourcePath: segments[0],
          targetName: branchName.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Greška pri grananju.");

      setIsForkOpen(false);
      router.push(data.redirectUrl);
    } catch (err: any) {
      setForkError(err.message);
      setForking(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0f12] text-white flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 text-sm">Povezivanje na CloudLock Vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-[#0d0f12] text-zinc-100 flex flex-col font-sans relative"
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        handleFileUpload(e.dataTransfer.files);
      }}
    >
      {/* Drag Over Overlay */}
      {isDragOver && (
        <div className="fixed inset-0 bg-emerald-500/10 border-2 border-dashed border-emerald-500 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-[#12151a] px-6 py-4 rounded-xl border border-emerald-500/40 flex items-center gap-3 shadow-2xl">
            <UploadCloud className="w-8 h-8 text-emerald-400 animate-bounce" />
            <span className="text-sm font-semibold text-white">Ispustite datoteku za prijenos u ovu mapu</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="h-16 border-b border-zinc-800/80 px-6 flex items-center justify-between bg-[#12151a]/60 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
            CL
          </div>

          <nav className="flex items-center gap-1.5 text-xs">
            {segments.map((seg, idx) => {
              const segPath = segments.slice(0, idx + 1).join("/");
              const isLast = idx === segments.length - 1;
              return (
                <div key={segPath} className="flex items-center gap-1.5">
                  {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />}
                  {isLast ? (
                    <span className="font-semibold text-white">{decodeURIComponent(seg)}</span>
                  ) : (
                    <Link href={`/share/${segPath}`} className="text-zinc-400 hover:text-emerald-400 transition">
                      {decodeURIComponent(seg)}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div 
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400"
            title="Automatska pozadinska sinkronizacija"
          >
            <span className={`w-2 h-2 rounded-full ${isSyncing ? "bg-amber-400 animate-ping" : "bg-emerald-500"}`} />
            <span>{isSyncing ? "Sinkronizacija..." : "Uživo"}</span>
          </div>

          <button
            onClick={() => setIsForkOpen(true)}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-zinc-700/60 transition"
          >
            <GitFork className="w-3.5 h-3.5 text-sky-400" />
            <span>Fork Grana</span>
          </button>

          <a
            href={`/api/share/zip/${currentPath}`}
            className="bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Preuzmi ZIP</span>
          </a>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Preview Player */}
        <div className="flex-1 bg-black/40 flex flex-col items-center justify-center p-6 border-b lg:border-b-0 lg:border-r border-zinc-800/80 min-h-[420px]">
          {selectedFile ? (
            <div className="w-full max-w-4xl flex flex-col items-center gap-4">
              <div className="w-full aspect-video bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center shadow-2xl relative">
                {selectedFile.type === "video" && (
                  <video
                    key={selectedFile.key}
                    src={selectedFile.url}
                    controls
                    preload="metadata"
                    playsInline
                    className="w-full h-full object-contain"
                  />
                )}
                {selectedFile.type === "image" && (
                  <img src={selectedFile.url} alt={selectedFile.name} className="w-full h-full object-contain" />
                )}
                {selectedFile.type === "document" && (
                  <div className="flex flex-col items-center gap-3 text-zinc-400">
                    <FileText className="w-16 h-16 text-zinc-600" />
                    <p className="text-sm">Dokument spreman za preuzimanje</p>
                  </div>
                )}
                {selectedFile.type === "other" && (
                  <div className="flex flex-col items-center gap-3 text-zinc-400">
                    <HardDrive className="w-16 h-16 text-zinc-600" />
                    <p className="text-sm">Izvorna datoteka spremna za preuzimanje</p>
                  </div>
                )}
              </div>

              <div className="w-full flex items-center justify-between px-2">
                <div>
                  <h3 className="text-sm font-medium text-white truncate max-w-md">{selectedFile.name}</h3>
                  <p className="text-xs text-zinc-500">{formatSize(selectedFile.size)}</p>
                </div>
                <a
                  href={selectedFile.url}
                  download={selectedFile.name}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition"
                >
                  <Download className="w-4 h-4" /> Preuzmi Datoteku
                </a>
              </div>
            </div>
          ) : (
            <p className="text-zinc-600 text-sm">
              {subfolders.length > 0 ? "Odaberite podmapu ili datoteku sa popisa" : "Ova mapa je prazna"}
            </p>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-96 bg-[#101317] flex flex-col h-full overflow-hidden border-zinc-800">
          <div className="flex-1 overflow-y-auto">
            {subfolders.length > 0 && (
              <div>
                <div className="p-3.5 border-b border-zinc-800/80 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-amber-400" /> Podmape
                </div>
                <div className="divide-y divide-zinc-800/40">
                  {subfolders.map((sf) => (
                    <Link
                      key={sf.path}
                      href={`/share/${sf.path}`}
                      className="p-3 flex items-center justify-between hover:bg-zinc-800/40 transition group"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Folder className="w-4 h-4 text-amber-400/80 group-hover:text-amber-400 transition" />
                        <span className="text-xs font-medium text-zinc-300 group-hover:text-white truncate">
                          {sf.name}
                        </span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3.5 border-b border-t border-zinc-800/80 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Datoteke
            </div>
            <div className="divide-y divide-zinc-800/40">
              {files.map((file) => {
                const isSelected = selectedFile?.key === file.key;
                return (
                  <div
                    key={file.key}
                    onClick={() => setSelectedFile(file)}
                    className={`p-3.5 flex items-center justify-between gap-3 cursor-pointer transition ${
                      isSelected ? "bg-emerald-500/10 border-l-2 border-emerald-500" : "hover:bg-zinc-800/30"
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                        {file.type === "video" && <Film className="w-4 h-4 text-sky-400" />}
                        {file.type === "image" && <ImageIcon className="w-4 h-4 text-emerald-400" />}
                        {file.type === "document" && <FileText className="w-4 h-4 text-amber-400" />}
                        {file.type === "other" && <HardDrive className="w-4 h-4 text-zinc-400" />}
                      </div>
                      <div className="truncate">
                        <p className={`text-xs font-medium truncate ${isSelected ? "text-white" : "text-zinc-300"}`}>
                          {file.name}
                        </p>
                        <p className="text-[11px] text-zinc-500">{formatSize(file.size)}</p>
                      </div>
                    </div>

                    <a
                      href={file.url}
                      download={file.name}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition"
                      title="Preuzmi"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Web Dropzone na dnu sidebara */}
          <div className="p-4 border-t border-zinc-800 bg-[#0d0f12]/90">
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />

            {isUploading ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-300">
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" /> Prijenos na R2...
                  </span>
                  <span className="font-semibold text-emerald-400">{uploadProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-200 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border border-dashed border-zinc-700 hover:border-emerald-500/80 rounded-xl p-3 text-center transition group bg-zinc-900/40 hover:bg-emerald-500/5"
              >
                <div className="flex items-center justify-center gap-2 text-zinc-400 group-hover:text-emerald-400 transition">
                  <UploadCloud className="w-4 h-4" />
                  <span className="text-xs font-medium">Učitaj datoteku u ovu mapu</span>
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">Kliknite ili povucite datoteku ovdje</p>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Fork Modal Dialog */}
      {isForkOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#14181f] border border-zinc-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <GitFork className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-semibold text-white">Fork / Nova radna grana</h3>
              </div>
              <button onClick={() => setIsForkOpen(false)} className="text-zinc-500 hover:text-white transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Izvorni projekt ostat će netaknut. Sustav stvara novu granu u koju partner može dodavati svoje verzije.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Naziv nove grane / radnog prostora:</label>
              <input
                type="text"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                className="w-full bg-[#0a0c0f] border border-zinc-700 focus:border-sky-500 text-white text-xs rounded-lg px-3 py-2 outline-none transition"
              />
            </div>

            {forkError && <p className="text-xs text-rose-400">{forkError}</p>}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsForkOpen(false)}
                className="px-3.5 py-1.5 text-xs text-zinc-400 hover:text-white transition"
              >
                Odustani
              </button>
              <button
                type="button"
                onClick={handleFork}
                disabled={forking || !branchName.trim()}
                className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition"
              >
                {forking ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Kopiranje...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Potvrdi i Otvori</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
