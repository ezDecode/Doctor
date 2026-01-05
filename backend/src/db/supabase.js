const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (supabaseUrl && supabaseKey) {
  module.exports = createClient(supabaseUrl, supabaseKey);
} else {
  // In-memory fallback when Supabase isn't configured
  let nextId = 1;
  let doctors = [];
  
  const ok = data => ({ data, error: null });
  
  module.exports = {
    from: tableName => ({
      select: columns => ({
        order: async orderBy => ok(doctors)
      }),
      
      insert: rows => ({
        select: () => ({
          single: async () => {
            const newDoc = { id: nextId++, ...rows[0] };
            doctors.push(newDoc);
            return ok(newDoc);
          }
        })
      }),
      
      update: updates => ({
        eq: (column, value) => ({
          select: () => ({
            single: async () => {
              const doc = doctors.find(d => d.id == value);
              if (doc) {
                Object.assign(doc, updates);
              }
              return ok(doc);
            }
          })
        })
      }),
      
      delete: () => ({
        eq: (column, value) => {
          doctors = doctors.filter(d => d.id != value);
          return ok(null);
        }
      })
    })
  };
}
