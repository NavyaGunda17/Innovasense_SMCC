
// createFolder.ts

import { supabase } from "../lib/supabaseClient"
import { useSelector } from "react-redux";



export const createJobFolder = async (folderName: string,companyName:string) => {

    // Step 1: Create a small dummy Blob (can't be 0 bytes)
    const dummyFile = new Blob(['folder init'], { type: 'text/plain' });
    // Step 2: Upload dummy file to folder path
    const { data, error } = await supabase.storage
      .from(`${companyName}`)
      .upload(`${folderName}/.placeholder.txt`, dummyFile, {
        upsert: false,
      });
  
    if (error) {
        throw error;  
    } else { 
        return data; 
    }
  };

  export const renderFiles = async (folderName: string, companyName: any) => {
 
  
    const { data, error } = await supabase.storage
      .from(companyName)
      .list(folderName, {
        limit: 100,
        offset: 0,
      });
  
    if (error) {
      console.error("Error listing files:", error.message);
      throw error;
    }
  
    // Filter PDF files and construct public URL
    const pdfFiles = data
      ?.filter(item => item.name.toLowerCase().endsWith(".pdf"))
      .map(item => {
        const fullPath = `${folderName}/${item.name}`;
        const { data: publicUrlData } = supabase.storage
          .from(companyName)
          .getPublicUrl(fullPath);
  
        return {
          id: item.id,
          name: item.name,
          path: fullPath,
          webUrl: publicUrlData?.publicUrl || null,
        };
      }) || [];
  
    console.log("Filtered PDF files with public URLs:", pdfFiles);
    return pdfFiles;
  };
  

  export const createOrganizationFolder = async (folderName: string) => {
    // Step 1: Create a small dummy Blob (can't be 0 bytes)
   
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error("Error fetching bucket list:", listError.message);
      throw listError;
    }
    const exists = buckets.some(bucket => bucket.name === folderName);

  if (exists) {
    console.log(`Bucket "${folderName}" already exists.`);
    return { alreadyExists: true };
  }
    // Step 2: Upload dummy file to folder path
    const { data, error } = await supabase.storage
    .createBucket(folderName, {
        public: true, // or true if you want public access
      });
  
    if (error) {
        throw error;  
    } else {
        return data; 
    }
  };

