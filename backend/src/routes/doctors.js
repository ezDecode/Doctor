const router = require("express").Router();
const db = require("../db/supabase");

router.get("/", async (req, res) => {
  const searchQuery = req.query.q;
  let result;
  
  if (searchQuery && searchQuery.trim()) {
    const term = searchQuery.trim();
    result = await db
      .from("doctors")
      .select("*")
      .or(`name.ilike.%${term}%,specialization.ilike.%${term}%`)
      .order("id");
  } else {
    result = await db
      .from("doctors")
      .select("*")
      .order("id");
  }
  
  if (result.error) {
    return res.status(500).json(result.error);
  }
  
  res.json(result.data);
});

router.post("/", async (req, res) => {
  const result = await db
    .from("doctors")
    .insert([req.body])
    .select()
    .single();
  
  if (result.error) {
    return res.status(500).json(result.error);
  }
  
  res.status(201).json(result.data);
});

router.put("/:id", async (req, res) => {
  const doctorId = req.params.id;
  
  const result = await db
    .from("doctors")
    .update(req.body)
    .eq("id", doctorId)
    .select()
    .single();
  
  if (result.error) {
    return res.status(500).json(result.error);
  }
  
  res.json(result.data);
});

router.delete("/:id", async (req, res) => {
  const doctorId = req.params.id;
  
  const result = await db
    .from("doctors")
    .delete()
    .eq("id", doctorId);
  
  if (result.error) {
    return res.status(500).json(result.error);
  }
  
  res.json({ ok: true });
});

module.exports = router;
