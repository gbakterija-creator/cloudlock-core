import { NextRequest, NextResponse } from "next/server";
import { ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2 } from "../../../../lib/r2";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string[] }> }
) {
  try {
    const { id } = await params;
    const folderSegments = Array.isArray(id) ? id.map(decodeURIComponent) : [decodeURIComponent(id)];
    const folderPath = folderSegments.join("/").replace(/^\/+|\/+$/g, "");
    
    const rootPrefix = (process.env.R2_ROOT_PREFIX || "vault-trial-de").replace(/^\/+|\/+$/g, "");
    const fullPrefix = folderPath ? `${rootPrefix}/${folderPath}/` : `${rootPrefix}/`;

    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
      Prefix: fullPrefix,
      Delimiter: "/",
    });

    const response = await r2.send(listCommand);

    const subfolders = (response.CommonPrefixes || []).map((cp) => {
      const fullSubPath = cp.Prefix!.replace(fullPrefix, "").replace(/\/$/, "");
      return {
        name: fullSubPath,
        path: `${folderPath}/${fullSubPath}`,
      };
    });

    const files = await Promise.all(
      (response.Contents || [])
        .filter((item) => item.Key && item.Key !== fullPrefix && !item.Key.endsWith("/"))
        .map(async (item) => {
          const key = item.Key!;
          const fileName = key.replace(fullPrefix, "");
          const ext = fileName.split(".").pop()?.toLowerCase() || "";

          const getCommand = new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
          });

          const downloadUrl = await getSignedUrl(r2, getCommand, { expiresIn: 86400 });

          let type: "video" | "image" | "document" | "other" = "other";
          if (["mp4", "webm", "mov", "m4v"].includes(ext)) type = "video";
          else if (["jpg", "jpeg", "png", "webp", "gif", "exr"].includes(ext)) type = "image";
          else if (["pdf", "txt", "doc", "docx"].includes(ext)) type = "document";

          return {
            name: fileName,
            key,
            size: item.Size || 0,
            lastModified: item.LastModified,
            type,
            url: downloadUrl,
          };
        })
    );

    return NextResponse.json({
      currentPath: folderPath,
      folderName: folderSegments[folderSegments.length - 1] || "Root",
      parentPath: folderSegments.length > 1 ? folderSegments.slice(0, -1).join("/") : null,
      subfolders,
      files,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}