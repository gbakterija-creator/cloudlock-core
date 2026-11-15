import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2 } from "../../../../lib/r2";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { filePath, token, expiresIn = 86400 } = body;

    if (!filePath || !token) {
      return NextResponse.json({ error: "Missing required parameters: filePath or token" }, { status: 400 });
    }

    const sanitizedPath = filePath.replace(/^Z:[\\/]/, "").replace(/\\/g, "/");
    const rootPrefix = (process.env.R2_ROOT_PREFIX || "vault-trial-de").replace(/^\/+|\/+$/g, "");
    const bucketKey = `${rootPrefix}/vault-${token.substring(0, 8)}/${sanitizedPath}`;

    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: bucketKey,
      ResponseContentDisposition: `attachment; filename="${sanitizedPath.split("/").pop()}"`,
    });

    const signedUrl = await getSignedUrl(r2, command, {
      expiresIn: Math.min(Number(expiresIn), 604800),
    });

    return NextResponse.json({ success: true, shareUrl: signedUrl, expiresInSeconds: expiresIn });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const filePath = searchParams.get("path");
  const token = searchParams.get("token") || "trial-demo-token";

  if (!filePath) {
    return NextResponse.json({ error: "Missing path query parameter" }, { status: 400 });
  }

  const sanitizedPath = filePath.replace(/^Z:[\\/]/, "").replace(/\\/g, "/");
  const rootPrefix = (process.env.R2_ROOT_PREFIX || "vault-trial-de").replace(/^\/+|\/+$/g, "");
  const bucketKey = `${rootPrefix}/vault-${token.substring(0, 8)}/${sanitizedPath}`;

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: bucketKey,
    });

    const signedUrl = await getSignedUrl(r2, command, { expiresIn: 86400 });
    return NextResponse.json({ success: true, shareUrl: signedUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
