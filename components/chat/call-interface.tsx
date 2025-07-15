
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Video, VideoOff, PhoneOff, User, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { cn } from '@/lib/utils';

type CallInterfaceProps = {
  groupName: string;
};

export function CallInterface({ groupName }: CallInterfaceProps) {
  const router = useRouter();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getMedia = async () => {
      setIsLoading(true);
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setHasPermission(true);
      } catch (error) {
        console.error('Error accessing media devices.', error);
        setHasPermission(false);
        toast({
          variant: 'destructive',
          title: 'Permissions Denied',
          description: 'Camera and microphone access are required for video calls.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    getMedia();

    return () => {
      // Cleanup: stop all tracks when component unmounts
      stream?.getTracks().forEach(track => track.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(prev => !prev);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(prev => !prev);
    }
  };
  
  const handleLeaveCall = () => {
    stream?.getTracks().forEach(track => track.stop());
    router.back();
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-[calc(100vh_-_10rem)] bg-background text-foreground rounded-lg border">
      <div className="absolute top-4 left-4 text-lg font-semibold">{groupName} Call</div>
      
      <div className="flex-1 flex items-center justify-center w-full relative">
        {isLoading ? (
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Starting camera...</p>
            </div>
        ) : hasPermission ? (
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <video ref={videoRef} className={cn("h-full w-full object-contain transition-opacity scale-x-[-1]", isVideoOff && "opacity-0")} autoPlay playsInline muted />
            {isVideoOff && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted rounded-md">
                    <User className="h-24 w-24 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">Your video is off</p>
                </div>
            )}
          </div>
        ) : (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Permissions Required</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>
                  You need to grant camera and microphone permissions in your browser settings to join the call.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 p-4 bg-background/80 backdrop-blur-sm rounded-b-lg w-full">
        <Button variant={isMuted ? "destructive" : "secondary"} size="icon" className="rounded-full h-14 w-14" onClick={toggleMute} disabled={!hasPermission}>
          {isMuted ? <MicOff /> : <Mic />}
        </Button>
        <Button variant={isVideoOff ? "destructive" : "secondary"} size="icon" className="rounded-full h-14 w-14" onClick={toggleVideo} disabled={!hasPermission}>
          {isVideoOff ? <VideoOff /> : <Video />}
        </Button>
        <Button variant="destructive" size="icon" className="rounded-full h-14 w-14" onClick={handleLeaveCall}>
          <PhoneOff />
        </Button>
      </div>
    </div>
  );
}
