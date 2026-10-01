import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // --- Default admin account ---
  const adminEmail = "admin@textbookhub.local";
  const existingAdmin = await prisma.admin.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash("ChangeMe123!", 10);
    await prisma.admin.create({
      data: { name: "Site Admin", email: adminEmail, passwordHash },
    });
    console.log(`Created admin: ${adminEmail} / ChangeMe123!  (change this password after first login)`);
  }

  // --- Default settings ---
  const defaults: Record<string, string> = {
    siteName: "TextbookHub",
    // default fee to unlock a paid book, in kobo. 50000 kobo = NGN 500
    defaultFeeKobo: "50000",
    currency: "NGN",
    adsenseClientId: "",
    adsenseSlot: "",
  };
  for (const [key, value] of Object.entries(defaults)) {
    await prisma.setting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }

  // --- A few starter class levels ---
  const classes = [
    { name: "Primary 5", section: "Primary", order: 5 },
    { name: "Primary 6", section: "Primary", order: 6 },
    { name: "JSS1", section: "Junior Secondary", order: 7 },
    { name: "JSS2", section: "Junior Secondary", order: 8 },
    { name: "JSS3", section: "Junior Secondary", order: 9 },
    { name: "SS1", section: "Senior Secondary", order: 10 },
    { name: "SS2", section: "Senior Secondary", order: 11 },
    { name: "SS3", section: "Senior Secondary", order: 12 },
  ];
  for (const c of classes) {
    await prisma.classLevel.upsert({
      where: { name: c.name },
      update: {},
      create: c,
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
