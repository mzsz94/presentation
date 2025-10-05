import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import type { Session, Slide } from "@shared/schema";

export default function ParticipantView() {
  const [, params] = useRoute("/participant/:sessionId");
  const [, setLocation] = useLocation();
  const sessionId = params?.sessionId;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  const { data: session } = useQuery<Session>({
    queryKey: ['/api/sessions', sessionId],
    enabled: !!sessionId,
  });

  const { data: slides = [] } = useQuery<Slide[]>({
    queryKey: ['/api/sessions', sessionId, 'slides'],
    enabled: !!sessionId,
  });

  useEffect(() => {
    if (session) {
      setCurrentSlide(session.currentSlide);
    }
  }, [session]);

  useEffect(() => {
    if (!sessionId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const websocket = new WebSocket(`${protocol}//${window.location.host}/ws`);

    websocket.onopen = () => {
      setIsConnected(true);
      websocket.send(JSON.stringify({
        type: 'join',
        sessionId,
        role: 'participant',
      }));
    };

    websocket.onclose = () => {
      setIsConnected(false);
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'slideChange') {
        setCurrentSlide(data.slideIndex);
      }
    };

    return () => {
      websocket.close();
    };
  }, [sessionId]);

  if (!session || slides.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-participant/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">참여자 모드</h1>
              <Badge 
                variant="outline" 
                className="mt-1 font-mono bg-participant/10 border-participant"
                data-testid="text-session-code"
              >
                {session.code}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}
              data-testid="indicator-connection"
            />
            <span className="text-sm text-muted-foreground">
              {isConnected ? '연결됨' : '연결 끊김'}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-6xl">
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            <img
              src={slides[currentSlide]?.imageUrl}
              alt={`Slide ${currentSlide + 1}`}
              className="w-full h-full object-contain"
              data-testid="image-current-slide"
            />
            <div className="absolute top-4 right-4 backdrop-blur-md bg-black/30 text-white px-3 py-1 rounded-full text-sm">
              {currentSlide + 1} / {slides.length}
            </div>
          </div>
          
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              발표자가 슬라이드를 제어하고 있습니다
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
