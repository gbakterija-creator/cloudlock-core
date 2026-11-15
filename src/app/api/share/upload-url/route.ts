import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2 } from "../../../../lib/r2";

export async function POST(req: NextRequest) {
  try {
    const { folderPath, fileName, contentType } = await req.json();

    if (!fileName) {
      return NextResponse.json({ error: "fileName je obavezan." }, { status: 400 });
    }

    // Dekodiramo segmente kako ne bi ostao %20 u R2 ključu
    const rawSegments = (folderPath || "").split("/").filter(Boolean);
    const decodedSegments = rawSegments.map((s: string) => decodeURIComponent(s));
    const cleanFolder = decodedSegments.join("/").replace(/^\/+|\/+$/g, "");

    const rootPrefix = (process.env.R2_ROOT_PREFIX || "vault-trial-de").replace(/^\/+|\/+$/g, "");
    
    // Čistimo naziv datoteke
    const cleanFileName = fileName.replace(/[\\:*?"<>|]/g, "_");

    const key = cleanFolder
      ? `${rootPrefix}/${cleanFolder}/${cleanFileName}`
      : `${rootPrefix}/${cleanFileName}`;

    const putCommand = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType || "application/octet-stream",
    });

    const uploadUrl = await getSignedUrl(r2, putCommand, { expiresIn: 1800 });

    return NextResponse.json({ uploadUrl, key });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}