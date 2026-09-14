"use server";

import prisma from "@backend/modules/prisma/Prisma";
import {getUserFromCookie} from "@/utils/serverComponents/user";
import * as fs from "fs/promises";
import * as path from "path";
import {createGzip, gunzipSync} from "zlib";

const BACKUP_DIR = path.join(process.cwd(), "backups");
const MAX_BACKUPS = 30;

async function requireAdmin() {
  const user = await getUserFromCookie();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");
  return user;
}

async function logBackup(action: string, status: string, fileName?: string, fileSize?: number, message?: string) {
  await prisma.backupLog.create({data: {action, status, fileName, fileSize, message}});
}

export interface BackupInfo {
  id: string;
  fileName: string;
  size: number;
  created_at: string;
  status: "success" | "failed";
}

export async function createBackup(): Promise<{fileName: string; size: number}> {
  await requireAdmin();

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `backup_${timestamp}.json.gz`;
  const filePath = path.join(BACKUP_DIR, fileName);

  await fs.mkdir(BACKUP_DIR, {recursive: true});

  const tables = {
    users: await prisma.user.findMany(),
    verifies: await prisma.verify.findMany(),
    categories: await prisma.category.findMany(),
    courses: await prisma.course.findMany(),
    views: await prisma.view.findMany(),
    likes: await prisma.like.findMany(),
    attachments: await prisma.attachment.findMany(),
    settings: await prisma.setting.findMany(),
    productCategories: await prisma.productCategory.findMany(),
    products: await prisma.product.findMany(),
    productLikes: await prisma.productLike.findMany(),
    userCourses: await prisma.userCourse.findMany(),
    payments: await prisma.payment.findMany(),
    paymentActions: await prisma.paymentAction.findMany(),
    orders: await prisma.order.findMany(),
    orderProducts: await prisma.orderProduct.findMany(),
    services: await prisma.service.findMany(),
    serviceUsers: await prisma.serviceUser.findMany(),
    taghvims: await prisma.taghvim.findMany(),
    blogPosts: await prisma.blogPost.findMany(),
  };

  const json = JSON.stringify({timestamp, data: tables});
  const gzipped = await new Promise<Buffer>((resolve, reject) => {
    const gzip = createGzip();
    const chunks: Buffer[] = [];
    gzip.on("data", (chunk) => chunks.push(chunk));
    gzip.on("end", () => resolve(Buffer.concat(chunks)));
    gzip.on("error", reject);
    gzip.write(json);
    gzip.end();
  });

  await fs.writeFile(filePath, gzipped);
  const size = gzipped.length;

  await logBackup("create", "success", fileName, size);

  await pruneOldBackups();

  return {fileName, size};
}

async function pruneOldBackups() {
  const files = await fs.readdir(BACKUP_DIR);
  const backups = files
    .filter((f) => f.startsWith("backup_") && f.endsWith(".json.gz"))
    .sort()
    .reverse();

  if (backups.length > MAX_BACKUPS) {
    for (const old of backups.slice(MAX_BACKUPS)) {
      await fs.unlink(path.join(BACKUP_DIR, old));
      await logBackup("delete", "success", old);
    }
  }
}

export async function listBackups(): Promise<BackupInfo[]> {
  await requireAdmin();
  await fs.mkdir(BACKUP_DIR, {recursive: true});
  const files = await fs.readdir(BACKUP_DIR);
  const backups: BackupInfo[] = [];

  for (const fileName of files.filter((f) => f.startsWith("backup_") && f.endsWith(".json.gz")).sort().reverse()) {
    const stat = await fs.stat(path.join(BACKUP_DIR, fileName));
    backups.push({
      id: fileName,
      fileName,
      size: stat.size,
      created_at: stat.mtime.toISOString(),
      status: "success",
    });
  }

  return backups;
}

export async function deleteBackup(fileName: string): Promise<void> {
  await requireAdmin();
  const filePath = path.join(BACKUP_DIR, fileName);
  await fs.unlink(filePath);
  await logBackup("delete", "success", fileName);
}

export async function restoreBackup(fileName: string): Promise<void> {
  await requireAdmin();
  const filePath = path.join(BACKUP_DIR, fileName);

  try {
    const compressed = await fs.readFile(filePath);
    const decompressed = gunzipSync(compressed);
    const data = JSON.parse(decompressed.toString());

    await prisma.$transaction([
      prisma.orderProduct.deleteMany(),
      prisma.order.deleteMany(),
      prisma.paymentAction.deleteMany(),
      prisma.payment.deleteMany(),
      prisma.serviceUser.deleteMany(),
      prisma.productLike.deleteMany(),
      prisma.userCourse.deleteMany(),
      prisma.product.deleteMany(),
      prisma.productCategory.deleteMany(),
      prisma.attachment.deleteMany(),
      prisma.like.deleteMany(),
      prisma.view.deleteMany(),
      prisma.course.deleteMany(),
      prisma.category.deleteMany(),
      prisma.setting.deleteMany(),
      prisma.verify.deleteMany(),
      prisma.blogPost.deleteMany(),
      prisma.taghvim.deleteMany(),
      prisma.service.deleteMany(),
      prisma.user.deleteMany(),
    ]);

    if (data.data.users?.length) await prisma.user.createMany({data: data.data.users});
    if (data.data.verifies?.length) await prisma.verify.createMany({data: data.data.verifies});
    if (data.data.categories?.length) await prisma.category.createMany({data: data.data.categories});
    if (data.data.courses?.length) await prisma.course.createMany({data: data.data.courses});
    if (data.data.views?.length) await prisma.view.createMany({data: data.data.views});
    if (data.data.likes?.length) await prisma.like.createMany({data: data.data.likes});
    if (data.data.attachments?.length) await prisma.attachment.createMany({data: data.data.attachments});
    if (data.data.settings?.length) await prisma.setting.createMany({data: data.data.settings});
    if (data.data.productCategories?.length) await prisma.productCategory.createMany({data: data.data.productCategories});
    if (data.data.products?.length) await prisma.product.createMany({data: data.data.products});
    if (data.data.productLikes?.length) await prisma.productLike.createMany({data: data.data.productLikes});
    if (data.data.userCourses?.length) await prisma.userCourse.createMany({data: data.data.userCourses});
    if (data.data.payments?.length) await prisma.payment.createMany({data: data.data.payments});
    if (data.data.paymentActions?.length) await prisma.paymentAction.createMany({data: data.data.paymentActions});
    if (data.data.orders?.length) await prisma.order.createMany({data: data.data.orders});
    if (data.data.orderProducts?.length) await prisma.orderProduct.createMany({data: data.data.orderProducts});
    if (data.data.services?.length) await prisma.service.createMany({data: data.data.services});
    if (data.data.serviceUsers?.length) await prisma.serviceUser.createMany({data: data.data.serviceUsers});
    if (data.data.taghvims?.length) await prisma.taghvim.createMany({data: data.data.taghvims});
    if (data.data.blogPosts?.length) await prisma.blogPost.createMany({data: data.data.blogPosts});

    await logBackup("restore", "success", fileName);
  } catch (error) {
    await logBackup("restore", "failed", fileName, undefined, String(error));
    throw error;
  }
}

export async function getBackupLogs(limit = 20) {
  await requireAdmin();
  return prisma.backupLog.findMany({
    take: limit,
    orderBy: {created_at: "desc"},
  });
}

export async function getBackupFileBuffer(fileName: string): Promise<Buffer> {
  await requireAdmin();
  return fs.readFile(path.join(BACKUP_DIR, fileName));
}
