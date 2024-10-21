import { Client, Users } from 'node-appwrite';

// This Appwrite function will be executed every time your function is triggered
export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_URL)
    .setProject(process.env.VITE_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key'] ?? '');
  
  const users = new Users(client);

  try {
    const userId = req.body?.userId; // Assume userId is sent in the request body
    if (!userId) {
      return res.json({ error: "User ID is required" });
    }

    const response = await users.get(userId); // Fetch the user by userId
    log(`User fetched successfully: ${response}`);

    return res.json({
      success: true,
      user: response, // Return the user object as part of the response
    });
  } catch (err) {
    error("Error fetching user: " + err.message);
    return res.json({ success: false, error: err.message }); // Return an error message in the response
  }
};
