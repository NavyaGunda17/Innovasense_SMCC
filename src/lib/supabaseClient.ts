// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qdwkznmbngbdnldckens.supabase.co";

// "https://172.64.149.246/";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkd2t6bm1ibmdiZG5sZGNrZW5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxMzQwNTMsImV4cCI6MjA2NzcxMDA1M30.kyS_M95tfV5VdD0tocff3u6MaULA_0T4w3GHwR-BSqw";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: "public",
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});


// export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
//   db: { schema: "public" },
//   realtime: { params: { eventsPerSecond: 10 } },
//   global: {
//     headers: {
//       // You can add custom headers here
//       "Access-Control-Allow-Origin": "*",   // ⚠️ browsers usually ignore this
//       "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
//     },
//   },
// });
