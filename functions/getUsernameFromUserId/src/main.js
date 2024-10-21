import { Client, Users } from 'node-appwrite';
import config from '../../../src/config/config.js'

// This Appwrite function will be executed every time your function is triggered
export default async ({ req, res, log, error }) => {
  // Initialize the Appwrite client
  const client = new Client()
    .setEndpoint(config.appwriteUrl)
    .setProject(config.appwriteProjectId)
    .setKey(req.headers['x-appwrite-key'] ?? '');
  const users = new Users(client);

  // Extract userId from request parameters
  const userId = req.body.userId ?? req.headers['x-user-id'] ?? '';

  if (!userId) {
    return res.json({ error: "UserId is required." });
  }

  try {
    // Fetch the user by userId
    const user = await users.get(userId);
    log(`User found: ${user.name}`);

    // Return the user object
    return res.json(user);
  } catch (err) {
    error("Could not retrieve user: " + err.message);
    return res.json({ error: "User not found: " + err.message });
  }

  // Example response for /ping path
  if (req.path === "/ping") {
    return res.text("Pong");
  }

  return res.json({
    motto: "Build like a team of hundreds_",
    learn: "https://appwrite.io/docs",
    connect: "https://appwrite.io/discord",
    getInspired: "https://builtwith.appwrite.io",
  });
};
