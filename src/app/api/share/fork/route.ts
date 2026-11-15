import { NextRequest, NextResponse } from "next/server";
import { ListObjectsV2Command, CopyObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "../../../../lib/r2";

export async function POST(req: NextRequest) {
  try {
    const { sourcePath, targetName } = await req.json();

    if (!sourcePath || !targetName) {
      return NextResponse.json(
        { error: "sourcePath i targetName su obavezni." },
        { status: 400 }
      );
    }

    // Sanitizacija naziva nove grane
    const cleanTargetName = targetName
      .trim()
      .replace(/[\\/:*?"<>|]/g, "-")
      .replace(/\s+/g, " ");

    const rootPrefix = process.env.R2_ROOT_PREFIX || "vault-trial-de";
    const cleanSourcePath = sourcePath.replace(/^\/+|\/+$/g, "");
    const sourcePrefix = `${rootPrefix}/${cleanSourcePath}/`;
    const targetPrefix = `${rootPrefix}/${cleanTargetName}/`;

    if (sourcePrefix === targetPrefix) {
      return NextResponse.json(
        { error: "Nova grana mora imati drugačiji naziv od originala." },
        { status: 400 }
      );
    }

    const bucketName = process.env.R2_BUCKET_NAME;

    // 1. Dohvati sve objekte iz izvornog foldera
    const listCmd = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: sourcePrefix,
    });

    const listed = await r2.send(listCmd);
    const contents = (listed.Contents || []).filter(
      (item) => item.Key && !item.Key.endsWith("/")
    );

    if (contents.length === 0) {
      return NextResponse.json(
        { error: "Izvorni folder je prazan ili ne postoji." },
        { status: 404 }
      );
    }

    // 2. Izvrši Server-Side Copy na R2 za svaki fajl
    const copyPromises = contents.map((item) => {
      const sourceKey = item.Key!;
      const relativePath = sourceKey.replace(sourcePrefix, "");
      const destinationKey = `${targetPrefix}${relativePath}`;

      const copyCmd = new CopyObjectCommand({
        Bucket: bucketName,
        CopySource: encodeURIComponent(`${bucketName}/${sourceKey}`),
        Key: destinationKey,
      });

      return r2.send(copyCmd);
    });

    await Promise.all(copyPromises);

    return NextResponse.json({
      success: true,
      newBranchPath: cleanTargetName,
      fileCount: contents.length,
      redirectUrl: `/share/${encodeURIComponent(cleanTargetName)}`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}