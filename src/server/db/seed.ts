import { db } from "./client";

async function seed() {
  try {
    // Insert a default user (system or admin)
    await db.query(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       ON CONFLICT (email) DO NOTHING`,
      ["system@handshake.app", ""], // empty password_hash for system user
    );

    // Insert example handshake(s)
    await db.query(
      `INSERT INTO handshakes (user_id, slug, title, description, created_at)
       SELECT id, $2, $3, $4, NOW() FROM users WHERE email = $1
       ON CONFLICT (slug) DO NOTHING`,
      [
        "system@handshake.app",
        "example-handshake",
        "Example Handshake",
        "This is an example handshake for seeding.",
      ],
    );

    console.log("✅ Database seeded successfully");
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  } finally {
    await db.end();
  }
}

seed();
