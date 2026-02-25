import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/portal/context/AuthContext';
import { useMessages, useSendMessage, useMarkMessagesRead } from '@/portal/hooks/useMessages';
import { formatDateTime } from '@/portal/utils/formatters';
import { MAX_MESSAGE_LENGTH } from '@/portal/utils/constants';
import type { Patient } from '@/portal/types';

interface MessageThreadProps {
  patient: Patient;
}

export function MessageThread({ patient }: MessageThreadProps) {
  const [body, setBody] = useState('');
  const { user } = useAuth();
  const { data: messages, isLoading } = useMessages(patient.id);
  const sendMessage = useSendMessage();
  const markRead = useMarkMessagesRead();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Mark messages as read when viewing
  useEffect(() => {
    if (user && messages && messages.length > 0) {
      const hasUnread = messages.some(m => !m.is_read && m.sender_id !== user.id);
      if (hasUnread) {
        markRead.mutate({ patientId: patient.id, userId: user.id });
      }
    }
  }, [messages, user, patient.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!body.trim() || !user) return;

    try {
      await sendMessage.mutateAsync({
        patient_id: patient.id,
        project_id: patient.project_id,
        sender_id: user.id,
        body: body.trim(),
      });
      setBody('');
    } catch {
      toast.error('Failed to send message');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">
        Messages about {patient.first_name} {patient.last_name}
      </p>

      {/* Message list */}
      <div
        ref={scrollRef}
        className="max-h-64 overflow-y-auto space-y-2 rounded-lg border bg-background p-3"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin mx-auto my-4" />
        ) : messages && messages.length > 0 ? (
          messages.map((msg: any) => {
            const isOwn = msg.sender_id === user?.id;
            return (
              <div
                key={msg.id}
                className={cn(
                  'rounded-lg p-2.5 text-sm max-w-[85%]',
                  isOwn
                    ? 'ml-auto bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                {!isOwn && (
                  <p className="text-xs font-medium mb-0.5">
                    {msg.profiles?.full_name || 'Unknown'}{' '}
                    <span className="font-normal text-muted-foreground">
                      ({msg.profiles?.role || 'unknown'})
                    </span>
                  </p>
                )}
                <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                <p className={cn(
                  'text-[10px] mt-1',
                  isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                )}>
                  {formatDateTime(msg.created_at)}
                </p>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No messages yet. Start the conversation.
          </p>
        )}
      </div>

      {/* Message input */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Textarea
            placeholder="Type a message..."
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
            onKeyDown={handleKeyDown}
            rows={2}
            className="resize-none"
          />
          <div className="flex justify-end mt-0.5">
            <span className="text-xs text-muted-foreground">
              {body.length}/{MAX_MESSAGE_LENGTH}
            </span>
          </div>
        </div>
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!body.trim() || sendMessage.isPending}
          className="shrink-0 self-end mb-5 min-h-[44px] min-w-[44px]"
        >
          {sendMessage.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
