import { Client, Users } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_URL) // Your Appwrite endpoint
    .setProject(process.env.VITE_PROJECT_ID) // Your project ID
    .setKey(process.env.VITE_API_KEY); // Your secret API key

  const users = new Users(client);

  try {
    // Ensure the request body is parsed as JSON
    let userId;
    if (req.body) {
      userId = req.body.userId;
    } else if (req.query) {
      userId = req.query.userId;
    }

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
