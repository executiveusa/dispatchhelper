
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface UploadSectionProps {
  onUploadComplete?: (data: any) => void;
}

export function UploadSection({ onUploadComplete }: UploadSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('ai-dispatch', {
        body: formData,
      });

      if (error) throw error;

      toast({
        title: "Upload Successful",
        description: "File processed and AI model updated",
      });

      if (onUploadComplete) {
        onUploadComplete(data);
      }
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "There was an error uploading the file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
    }
  };

  return (
    <div className='upload-section bg-white p-6 rounded-lg shadow-md'>
      <h2 className="text-2xl font-bold mb-4 text-blue-600">Upload Documents for AI Training</h2>
      <div className="mb-4">
        <input 
          type="file" 
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4 file:rounded-md
            file:border-0 file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>
      <Button 
        onClick={handleUpload}
        disabled={!selectedFile || isUploading}
        className="w-full"
      >
        {isUploading ? "Uploading..." : "Upload & Train AI"}
      </Button>
    </div>
  );
}

export default UploadSection;
