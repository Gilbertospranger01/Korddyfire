"use client";

import { useState } from "react";
import supabase from "../utils/supabase";
import Image from "next/image";

export default function UploadImage() {
  const [image, setImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    setImage(file);
  };

  const uploadImage = async () => {
    if (!image) return alert("Selecione uma imagem!");

    try {
      setUploading(true);

      const fileExt = image.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error } = await supabase.storage
        .from("korddyfire/uploads")
        .upload(filePath, image);

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from("korddyfire/uploads")
        .getPublicUrl(filePath);

      setImageUrl(publicUrlData.publicUrl);
      alert("Imagem enviada com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar imagem:", (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} accept="image/*" />
      <button onClick={uploadImage} disabled={uploading}>
        {uploading ? "Enviando..." : "Upload"}
      </button>
      {imageUrl && (
        <div>
          <p>Imagem enviada:</p>
          <Image src={imageUrl} alt="Imagem enviada" width={200} height={200} />
        </div>
      )}
    </div>
  );
}
