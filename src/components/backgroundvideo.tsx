"use client";
import React, { useState, useEffect, useRef } from "react";
import supabase from "../utils/supabase";

interface BackgroundVideoProps {
  className?: string;
}

const BackgroundVideo: React.FC<BackgroundVideoProps> = ({ className }) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchMediaUrls = async () => {
      try {
        const { data: videoData, error: videoError } = await supabase.storage
          .from("korddyfire-store-files/korddyfire/backgroundvideos")
          .list("backgroundvideos", { limit: 1 });

        if (videoError) throw new Error("Erro ao buscar vídeo: " + videoError.message);
        if (!videoData || videoData.length === 0) throw new Error("Nenhum vídeo encontrado.");

        const videoPath = `backgroundvideos/${videoData[0].name}`;
        const { data: videoUrlData } = supabase.storage
          .from("korddyfire-store-files/korddyfire/backgroundvideos")
          .getPublicUrl(videoPath);
        setVideoUrl(videoUrlData.publicUrl);

        const { data: audioData, error: audioError } = await supabase.storage
          .from("korddyfire-store-files/korddyfire/backgroundvideos")
          .list("songs", { limit: 1 });

        if (audioError) throw new Error("Erro ao buscar áudio: " + audioError.message);
        if (!audioData || audioData.length === 0) throw new Error("Nenhuma música encontrada.");

        const audioPath = `songs/${audioData[0].name}`;
        const { data: audioUrlData } = supabase.storage
          .from("korddyfire-store-files/korddyfire/backgroundvideos")
          .getPublicUrl(audioPath);
        setAudioUrl(audioUrlData.publicUrl);
      } catch (error) {
        console.error(error);
      }
    };

    fetchMediaUrls();
  }, []);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play().catch((err) => console.error("Erro ao reproduzir áudio:", err));
    }
  }, [audioUrl]);

  if (!videoUrl || !audioUrl) return null;

  return (
    <div className="relative">
      <video
        key={videoUrl}
        src={videoUrl}
        autoPlay
        loop
        muted={true}
        controls={false}
        className={className}
      />

    </div>
  );
};

export default BackgroundVideo;
