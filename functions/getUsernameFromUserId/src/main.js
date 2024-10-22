// Import the Appwrite SDK using ES modules
import { Client, Users } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  // Initialize the client with your Appwrite API
  const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_URL) // Your Appwrite endpoint
    .setProject(process.env.VITE_PROJECT_ID) // Your project ID
    .setKey(req.headers['x-appwrite-key'] ?? ''); // Your secret API key

  // Initialize the Users service
  const users = new Users(client);

  try {
    // Extract userId from request body
    const { userId } = JSON.parse(req.body);
    
    // Validate that userId is provided
    if (!userId) {
      return res.json({ error: "userId is required" });
    }

    // Fetch user details from the Appwrite Users service
    const result = await users.get(userId);
    log(`User data: ${JSON.stringify(result)}`);

    // Return the user object in the response
    return res.json({
      success: true,
      user: result,
    });

  } catch (err) {
    error(`Error fetching user: ${err.message}`);
    return res.json({ success: false, error: err.message });
  }
};
