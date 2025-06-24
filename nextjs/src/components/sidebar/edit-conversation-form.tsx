import { zodResolver } from "@hookform/resolvers/zod";
import { JSX } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useConversation } from "@/hooks/use-conversation";
import { Conversation, UpdateConversationRequest } from "@/types";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type FormValues = z.infer<typeof formSchema>;

type EditConversationFormProps = {
  conversation: Conversation;
  isOpen: boolean;
  onClose: () => void;
};

export default function EditConversationForm({
  conversation,
  isOpen,
  onClose,
}: EditConversationFormProps): JSX.Element {
  const { updateConversation, isUpdatingConversation } = useConversation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: conversation.name,
    },
  });

  const handleSubmit = async (values: FormValues): Promise<void> => {
    try {
      const updateConversationRequest: UpdateConversationRequest = {
        conversationId: conversation.id,
        name: values.name.trim(),
      };

      const updatedConversation = await updateConversation(
        updateConversationRequest,
      );

      form.reset({
        name: updatedConversation.name,
      });

      onClose();
    } catch (error) {
      console.error(error);
      form.reset();
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
                disabled={isUpdatingConversation}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdatingConversation}>
                {isUpdatingConversation ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
