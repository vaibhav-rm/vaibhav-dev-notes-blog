import { Client, Users } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  // Initialize the Appwrite client
  const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_URL) // Your Appwrite endpoint
    .setProject(process.env.VITE_PROJECT_ID) // Your project ID
    .setKey(process.env.VITE_API_KEY); // Your secret API key

  // Initialize the Users service
  const users = new Users(client);

  try {
    // Parse the request body
    const { userId } = JSON.parse(req.body);

    // Validate the userId
    if (!userId) {
      return res.json({ success: false, error: "userId is required" });
    }

    // Fetch user details
    const result = await users.get(userId);
    log(`User data: ${JSON.stringify(result)}`);

    // Return the user data
    return res.json({
      success: true,
      user: {
        id: result.$id,
        name: result.name,
        email: result.email
      }
    });
  } catch (err) {
    error(`Error fetching user: ${err.message}`);
    return res.json({ success: false, error: err.message });
  }
};
