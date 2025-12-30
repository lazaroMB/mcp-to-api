"use client";

import { useState } from "react";
import { MessageCircle, XIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Dialog, DialogTrigger, DialogHeader, DialogTitle, DialogPanel, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Field, FieldLabel, FieldControl } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export function ContactForm() {
  const { addToast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (formData.name.trim().length > 100) {
      newErrors.name = "Name must be less than 100 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 20) {
      newErrors.message = "Message must be at least 20 characters";
    } else if (formData.message.trim().length > 500) {
      newErrors.message = "Message must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Try to parse server validation errors and map to form fields
        const errorMessage = data.error || "Failed to send message";
        
        // Map common server error messages to form fields
        if (errorMessage.includes("Name")) {
          setErrors({ name: errorMessage });
        } else if (errorMessage.includes("Email") || errorMessage.includes("email")) {
          setErrors({ email: errorMessage });
        } else if (errorMessage.includes("Message") || errorMessage.includes("message")) {
          setErrors({ message: errorMessage });
        } else if (errorMessage.includes("required")) {
          // If it's a general required error, validate again to show field-specific errors
          validateForm();
        }
        
        throw new Error(errorMessage);
      }

      // Show success toast
      addToast(
        "success",
        "Message sent!",
        "Thank you for contacting us. We'll get back to you soon."
      );

      // Reset form
      setFormData({ name: "", email: "", message: "" });
      setErrors({});
      setOpen(false);
    } catch (error) {
      // Show error toast
      addToast(
        "error",
        "Failed to send message",
        error instanceof Error ? error.message : "Please try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateField = (field: keyof ContactFormData) => {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = { ...errors };

    if (field === "name") {
      if (!formData.name.trim()) {
        newErrors.name = "Name is required";
      } else if (formData.name.trim().length < 2) {
        newErrors.name = "Name must be at least 2 characters";
      } else if (formData.name.trim().length > 100) {
        newErrors.name = "Name must be less than 100 characters";
      } else {
        delete newErrors.name;
      }
    } else if (field === "email") {
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else {
        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i;
        if (!emailRegex.test(formData.email.trim())) {
          newErrors.email = "Please enter a valid email address";
        } else {
          delete newErrors.email;
        }
      }
    } else if (field === "message") {
      if (!formData.message.trim()) {
        newErrors.message = "Message is required";
      } else if (formData.message.trim().length < 20) {
        newErrors.message = "Message must be at least 20 characters";
      } else if (formData.message.trim().length > 500) {
        newErrors.message = "Message must be less than 500 characters";
      } else {
        delete newErrors.message;
      }
    }

    setErrors(newErrors);
  };

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleBlur = (field: keyof ContactFormData) => {
    validateField(field);
  };

  return (
    <>
      {/* Floating Button */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <Button
              className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
              size="icon"
              aria-label="Contact us"
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
          }
        />

        {/* Custom Dialog positioned at bottom-right */}
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop
            className={cn(
              "fixed inset-0 z-50 bg-black/32 backdrop-blur-sm transition-all duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0"
            )}
          />
          <DialogPrimitive.Viewport
            className={cn(
              "fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6",
              "max-sm:items-end max-sm:justify-center max-sm:p-0"
            )}
          >
            <DialogPrimitive.Popup
              className={cn(
                "relative flex max-h-[calc(100vh-3rem)] min-h-0 w-full min-w-0 max-w-md flex-col rounded-2xl border bg-popover bg-clip-padding text-popover-foreground shadow-lg transition-[scale,opacity,translate] duration-300 ease-in-out will-change-transform",
                "data-starting-style:translate-y-4 data-starting-style:opacity-0 data-starting-style:scale-95",
                "data-ending-style:translate-y-4 data-ending-style:opacity-0 data-ending-style:scale-95",
                "max-sm:max-w-none max-sm:rounded-none max-sm:border-x-0 max-sm:border-t max-sm:border-b-0 max-sm:max-h-[90vh]",
                "before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-2xl)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] dark:bg-clip-border dark:before:shadow-[0_-1px_--theme(--color-white/8%)]"
              )}
            >
              <DialogHeader>
                <DialogTitle>Contact Us</DialogTitle>
                <DialogPrimitive.Close
                  aria-label="Close"
                  className="absolute end-2 top-2"
                  render={<Button size="icon" variant="ghost" />}
                >
                  <XIcon />
                </DialogPrimitive.Close>
              </DialogHeader>

              <DialogPanel>
                <Form onSubmit={handleSubmit}>
                  <Field
                    invalid={!!errors.name}
                  >
                    <FieldLabel>Name</FieldLabel>
                    <FieldControl
                      render={(props) => (
                        <Input
                          {...props}
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          onBlur={() => handleBlur("name")}
                          placeholder="Your name"
                          required
                          aria-invalid={!!errors.name}
                          aria-describedby={errors.name ? "name-error" : undefined}
                        />
                      )}
                    />
                    {errors.name && (
                      <div id="name-error" className="text-xs text-destructive-foreground">
                        {errors.name}
                      </div>
                    )}
                  </Field>

                  <Field
                    invalid={!!errors.email}
                  >
                    <FieldLabel>Email</FieldLabel>
                    <FieldControl
                      render={(props) => (
                        <Input
                          {...props}
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          onBlur={() => handleBlur("email")}
                          placeholder="your.email@example.com"
                          required
                          aria-invalid={!!errors.email}
                          aria-describedby={errors.email ? "email-error" : undefined}
                        />
                      )}
                    />
                    {errors.email && (
                      <div id="email-error" className="text-xs text-destructive-foreground">
                        {errors.email}
                      </div>
                    )}
                  </Field>

                  <Field
                    invalid={!!errors.message}
                  >
                    <div className="flex w-full items-center justify-between">
                      <FieldLabel>Message</FieldLabel>
                      <span
                        className={cn(
                          "text-xs text-muted-foreground",
                          formData.message.length >= 500 && "text-destructive font-medium"
                        )}
                      >
                        {formData.message.length}/500
                      </span>
                    </div>
                    <FieldControl
                      render={(props) => (
                        <Textarea
                          {...props}
                          value={formData.message}
                          onChange={(e) => handleInputChange("message", e.target.value)}
                          onBlur={() => handleBlur("message")}
                          placeholder="Your message..."
                          rows={6}
                          required
                          maxLength={500}
                          aria-invalid={!!errors.message}
                          aria-describedby={errors.message ? "message-error" : undefined}
                        />
                      )}
                    />
                    {errors.message && (
                      <div id="message-error" className="text-xs text-destructive-foreground">
                        {errors.message}
                      </div>
                    )}
                  </Field>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </DialogFooter>
                </Form>
              </DialogPanel>
            </DialogPrimitive.Popup>
          </DialogPrimitive.Viewport>
        </DialogPrimitive.Portal>
      </Dialog>
    </>
  );
}
