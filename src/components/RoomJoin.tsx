import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Door, Plus } from '@phosphor-icons/react';
import { Language, getTranslation } from '@/lib/i18n';
import { toast } from 'sonner';

interface RoomJoinProps {
  onJoinRoom: (roomId: string, language: Language) => void;
}

export function RoomJoin({ onJoinRoom }: RoomJoinProps) {
  const [roomId, setRoomId] = useState('');
  const [language, setLanguage] = useState<Language>('en');
  
  const t = getTranslation(language);

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      onJoinRoom(roomId.trim(), language);
      toast.success(t.toasts.roomJoined);
    } else {
      toast.error(t.toasts.invalidRoomId);
    }
  };

  const handleCreateRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    onJoinRoom(newRoomId, language);
    toast.success(`${t.toasts.roomCreated}: ${newRoomId}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && roomId.trim()) {
      handleJoinRoom();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">{t.room.title}</h1>
          <p className="text-muted-foreground">{t.room.subtitle}</p>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">{t.room.languageLabel}</Label>
              <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="tr">Türkçe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="roomId">{t.room.roomIdLabel}</Label>
              <Input
                id="roomId"
                type="text"
                placeholder={t.room.roomIdPlaceholder}
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                className="uppercase"
              />
            </div>

            <div className="space-y-2 pt-2">
              <Button 
                className="w-full" 
                onClick={handleJoinRoom}
                disabled={!roomId.trim()}
              >
                <Door className="mr-2" size={18} weight="duotone" />
                {t.room.joinButton}
              </Button>
              
              <Button 
                className="w-full" 
                variant="outline"
                onClick={handleCreateRoom}
              >
                <Plus className="mr-2" size={18} weight="bold" />
                {t.room.createButton}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
