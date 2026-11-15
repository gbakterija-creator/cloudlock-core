import { NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const dynamic = "force-dynamic";

const r2Client = new S3Client({
  region: "auto",
  endpoint: "https://7cf3ff3893ff429e8753bf27a2eb24a7.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: "d4f18b28e5af7207892e363dfa62d1ca",
    secretAccessKey: "d445d6d9d76010d7935611352ab51df1402beaa3e0913b500dfdb78c1b7f2185",
  },
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { filePath, token, expiresIn = 86400 } = body;

    if (!filePath || !token) {
      return NextResponse.json(
        { error: "Missing required parameters: filePath or token" },
        { status: 400 }
      );
    }

    const sanitizedPath = filePath.replace(/^Z:[\\/]/, "").replace(/\\/g, "/");
    const bucketKey = `vault-${token.substring(0, 8)}/${sanitizedPath}`;

    const command = new GetObjectCommand({
      Bucket: "cloudlock-vault",
      Key: bucketKey,
      ResponseContentDisposition: `attachment; filename="${sanitizedPath.split("/").pop()}"`,
    });

    const signedUrl = await getSignedUrl(r2Client, command, {
      expiresIn: Math.min(Number(expiresIn), 604800),
    });

    return NextResponse.json({
      success: true,
      shareUrl: signedUrl,
      expiresInSeconds: expiresIn,
    });
  } catch (error: any) {
    console.error("Presigned URL error:", error);
    return NextResponse.json(
      { error: "Failed to generate presigned URL", details: error.message },
      { status: 500 }
    );
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
  const bucketKey = `vault-${token.substring(0, 8)}/${sanitizedPath}`;

  try {
    const command = new GetObjectCommand({
      Bucket: "cloudlock-vault",
      Key: bucketKey,
    });

    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 86400 });

    return NextResponse.json({ success: true, shareUrl: signedUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}