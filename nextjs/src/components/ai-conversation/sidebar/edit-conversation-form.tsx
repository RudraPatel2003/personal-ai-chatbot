import { zodResolver } from "@hookform/resolvers/zod";
import { JSX, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Conversation } from "@/types";

import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../../ui/form";
import { Input } from "../../ui/input";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type FormValues = z.infer<typeof formSchema>;

type EditConversationFormProps = {
  conversation: Conversation;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (conversationId: string, newName: string) => Promise<void>;
};

export default function EditConversationForm({
  conversation,
  isOpen,
  onClose,
  onSubmit,
}: EditConversationFormProps): JSX.Element {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: conversation.name,
    },
  });

  const handleSubmit = async (values: FormValues): Promise<void> => {
    setIsSubmitting(true);

    try {
      await onSubmit(conversation.id, values.name.trim());
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogHeader>
              <DialogTitle>Edit Conversation</DialogTitle>
              <DialogDescription>
                Update the name of your conversation.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Conversation name"
                        {...field}
                        autoFocus
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
