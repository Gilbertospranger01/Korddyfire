"use client";

import React, { useState, useEffect } from "react";
import supabase from "../utils/supabase";
import Image from "next/image";


interface BackgroundImageProps {
  className?: string;
}

const BackgroundImage: React.FC<BackgroundImageProps> = ({ className }) => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchImageUrls = async () => {
      const { data, error } = await supabase.storage
        .from("korddyfire-store-files/korddyfire/backgroundimages")
        .list("backgroundimages", { limit: 13 });

      if (error) {
        console.error("Erro ao buscar imagens:", error.message);
        return;
      }

      if (data.length === 0) {
        console.error("Nenhuma imagem encontrada.");
        return;
      }

      const urls = data.map(
        (file) =>
          supabase.storage
            .from("korddyfire-store-files/korddyfire/backgroundimages")
            .getPublicUrl(`backgroundimages/${file.name}`).data.publicUrl
      );

      setImageUrls(urls);
    };

    fetchImageUrls();
  }, []);

  useEffect(() => {
    if (imageUrls.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
      }, 1500);

      return () => clearInterval(interval);
    }
  }, [imageUrls]);

  if (imageUrls.length === 0) return null;

  return (
    <Image
      key={imageUrls[currentImageIndex]}
      src={imageUrls[currentImageIndex]}
      alt="Background"
      className={className}
      width={1920} 
      height={1080}
    />
  );
};

export default BackgroundImage;
