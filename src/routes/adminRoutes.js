import { adminAuth } from "../middleware/auth.js";

router.get("/dashboard", adminAuth, async (req, res) => {
  res.json({ message: "Admin dashboard access granted!" });
});
