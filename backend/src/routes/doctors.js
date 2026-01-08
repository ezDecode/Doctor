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
      .order("name");
  } else {
    result = await db
      .from("doctors")
      .select("*")
      .order("name");
  }
  
  if (result.error) {
    return res.status(500).json(result.error);
  }
  
  res.json(result.data);
});

router.post("/", async (req, res) => {
  const { name, specialization, age, experience } = req.body;
  
  const doctorData = {
    name,
    specialization
  };
  
  // Only include age and experience if provided
  if (age !== undefined && age !== null) {
    doctorData.age = age;
  }
  if (experience !== undefined && experience !== null) {
    doctorData.experience = experience;
  }
  
  const result = await db
    .from("doctors")
    .insert([doctorData])
    .select()
    .single();
  
  if (result.error) {
    console.error("Insert error:", result.error);
    return res.status(500).json(result.error);
  }
  
  res.status(201).json(result.data);
});

router.put("/:id", async (req, res) => {
  const doctorId = req.params.id;
  const { name, specialization, age, experience } = req.body;
  
  const updateData = {
    name,
    specialization
  };
  
  // Only include age and experience if provided
  if (age !== undefined && age !== null) {
    updateData.age = age;
  }
  if (experience !== undefined && experience !== null) {
    updateData.experience = experience;
  }
  
  const result = await db
    .from("doctors")
    .update(updateData)
    .eq("id", doctorId)
    .select()
    .single();
  
  if (result.error) {
    console.error("Update error:", result.error);
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
    console.error("Delete error:", result.error);
    return res.status(500).json(result.error);
  }
  
  res.json({ ok: true });
});

module.exports = router;
