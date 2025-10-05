import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function CreateSessionPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [slides, setSlides] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      slides.forEach((slide, index) => {
        formData.append('slides', slide);
        formData.append('orders', index.toString());
      });
      
      return await apiRequest<{ sessionId: string; code: string }>(
        'POST',
        '/api/sessions',
        formData
      );
    },
    onSuccess: (data) => {
      toast({
        title: "세션이 생성되었습니다",
        description: `세션 코드: ${data.code}`,
      });
      setLocation(`/presenter/${data.sessionId}`);
    },
    onError: () => {
      toast({
        title: "세션 생성 실패",
        description: "다시 시도해주세요",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      toast({
        title: "이미지 파일만 업로드 가능합니다",
        variant: "destructive",
      });
      return;
    }

    setSlides(prev => [...prev, ...imageFiles]);
    
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrls(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeSlide = (index: number) => {
    setSlides(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateSession = () => {
    if (slides.length === 0) {
      toast({
        title: "슬라이드를 추가해주세요",
        variant: "destructive",
      });
      return;
    }
    createSessionMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">세션 생성</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>슬라이드 업로드</CardTitle>
            <CardDescription>
              프레젠테이션에 사용할 이미지를 업로드하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="border-2 border-dashed rounded-lg p-12 text-center hover-elevate">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">
                    클릭하여 이미지 업로드
                  </p>
                  <p className="text-sm text-muted-foreground">
                    JPG, PNG 등의 이미지 파일
                  </p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  data-testid="input-slides"
                />
              </label>
            </div>

            {previewUrls.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  슬라이드 미리보기 ({slides.length}개)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {previewUrls.map((url, index) => (
                    <div 
                      key={index} 
                      className="relative group aspect-video bg-muted rounded-lg overflow-hidden"
                      data-testid={`slide-preview-${index}`}
                    >
                      <img
                        src={url}
                        alt={`Slide ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {index + 1}
                      </div>
                      <button
                        onClick={() => removeSlide(index)}
                        className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        data-testid={`button-remove-slide-${index}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                onClick={handleCreateSession}
                disabled={slides.length === 0 || createSessionMutation.isPending}
                className="flex-1 bg-presenter hover:bg-presenter/90 text-presenter-foreground"
                size="lg"
                data-testid="button-create"
              >
                {createSessionMutation.isPending ? "생성 중..." : "세션 생성"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
