@@ .. @@
app.delete('/api/tokens/:id', async (req, res) => {
  try {
  }
}
)
-    const { reason, deletedBy } = req.body;
+    const { reason, deletedBy } = req.body || {};
    
    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'Deletion reason is required' });
    }