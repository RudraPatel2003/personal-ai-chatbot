import { zodResolver } from "@hookform/resolvers/zod";
import { JSX } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useConversation } from "@/hooks/use-conversation";
import { CreateConversationRequest } from "@/types";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type FormValues = z.infer<typeof formSchema>;

type CreateConversationFormProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CreateConversationForm({
  isOpen,
  onClose,
}: CreateConversationFormProps): JSX.Element {
  const { createConversation, isCreatingConversation } = useConversation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const handleSubmit = async (values: FormValues): Promise<void> => {
    try {
      const createConversationRequest: CreateConversationRequest = {
        name: values.name.trim(),
      };

      await createConversation(createConversationRequest);

      onClose();
    } finally {
      form.reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogHeader>
              <DialogTitle>Create New Conversation</DialogTitle>
              <DialogDescription>
                Enter a name for your new conversation.
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
                disabled={isCreatingConversation}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreatingConversation}>
                {isCreatingConversation ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
