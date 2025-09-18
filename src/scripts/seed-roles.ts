import { db } from "@/db/config";
import { roles, actions, rolePermissions, PERMISSION_DEFINITIONS, DEFAULT_ROLE_PERMISSIONS } from "@/db/schemas";
import { eq } from "drizzle-orm";

async function seedRoles() {
  console.log("🌱 Seeding roles and permissions...");

  try {
    // Check if roles already exist
    const existingRoles = await db.select().from(roles);
    if (existingRoles.length > 0) {
      console.log("✅ Roles already exist, skipping seeding");
      return;
    }

    // Insert roles
    console.log("📝 Creating roles...");
    const roleData = [
      { name: "student", description: "Dance students who can book classes and studios" },
      { name: "artist", description: "Dance artists who can teach classes and apply for gigs" },
      { name: "studio_owner", description: "Studio owners who can rent out their spaces" },
      { name: "admin", description: "System administrators with full access" },
    ];

    const insertedRoles = await db.insert(roles).values(roleData).returning();
    console.log("✅ Roles created:", insertedRoles.map(r => r.name));

    // Insert actions/permissions
    console.log("📝 Creating permissions...");
    const insertedActions = await db.insert(actions).values([...PERMISSION_DEFINITIONS]).returning();
    console.log("✅ Permissions created:", insertedActions.length);

    // Create role-permission mappings
    console.log("📝 Creating role-permission mappings...");
    const rolePermissionMappings = [];

    for (const role of insertedRoles) {
      const rolePermissions = DEFAULT_ROLE_PERMISSIONS[role.name as keyof typeof DEFAULT_ROLE_PERMISSIONS];
      if (rolePermissions) {
        for (const permissionName of rolePermissions) {
          if (permissionName === '*') {
            // Admin gets all permissions
            for (const action of insertedActions) {
              rolePermissionMappings.push({
                roleId: role.id,
                actionId: action.id,
                isActive: true,
              });
            }
          } else {
            // Find the action by name
            const action = insertedActions.find(a => a.name === permissionName);
            if (action) {
              rolePermissionMappings.push({
                roleId: role.id,
                actionId: action.id,
                isActive: true,
              });
            }
          }
        }
      }
    }

    await db.insert(rolePermissions).values(rolePermissionMappings);
    console.log("✅ Role-permission mappings created");

    console.log("🎉 Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
}

// Run the seeding function
seedRoles()
  .then(() => {
    console.log("✅ Seeding completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  });

export default seedRoles;
