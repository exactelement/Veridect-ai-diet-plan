import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareCardProps {
  foodName: string;
  verdict: string;
  explanation: string;
  calories?: string;
}

export function ShareCard({ foodName, verdict, explanation, calories }: ShareCardProps) {
  const { toast } = useToast();

  const handleTextShare = async () => {
    try {
      const shareText = `${verdict} for ${foodName}\n\n${explanation}\n\nAnalyzed with Veridect AI - Ask Veri at veridect.com`;
      
      if (navigator.share) {
        await navigator.share({
          text: shareText
        });
        toast({ 
          title: "Shared successfully!", 
          description: "Your result has been shared"
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        toast({ 
          title: "Copied to clipboard", 
          description: "Share text copied! You can paste it on social media."
        });
      } else {
        toast({ 
          title: "Share manually", 
          description: `Copy this: ${shareText}`,
          duration: 8000
        });
      }
    } catch (error) {
      console.error('Text share error:', error);
      toast({ 
        title: "Share manually", 
        description: `${verdict} for ${foodName}! Share your result on social media`,
        duration: 5000
      });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button 
        onClick={handleTextShare}
        variant="outline" 
        size="sm"
        className="w-full"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>
    </div>
  );
}