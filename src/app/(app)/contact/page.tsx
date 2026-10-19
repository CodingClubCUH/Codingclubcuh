"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import PageHeader from "@/components/page-header";
import { toast } from "sonner";
import { Send, CheckCircle2, Loader2, Mail, MessageSquare, Building, Sparkles } from "lucide-react";

export default function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
          channel: "website",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
        toast.success("Thank you! Your message has been sent to Coding Club CUH.");
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        toast.error(data.error || "Failed to send message. Please try again.");
      }
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-background min-h-screen">
      <PageHeader
        pagetitle={`Get in touch with us`}
        image1={"/images/icons/mail.png"}
        image2={"/images/icons/contact.png"}
        pagedescription={`We'd love to hear from you. Fill out the form below or drop us an email.`}
      />
      <div className="mx-auto max-w-4xl px-4 lg:px-0 pb-16 mt-8">
        <div className="grid border border-border rounded-2xl overflow-hidden md:grid-cols-2 md:gap-px bg-border glass-card">
          <div className="flex flex-col justify-between space-y-8 p-8 sm:p-12 bg-card">
            <div>
              <div className="flex items-center gap-2 text-primary mb-2">
                <Mail size={18} />
                <span className="text-xs uppercase font-bold tracking-wider">Official Email</span>
              </div>
              <h2 className="mb-3 text-xl font-semibold text-foreground font-handjet tracking-wider">
                General Inquiry
              </h2>
              <p className="text-muted-foreground text-sm mb-4">
                For any questions about the club, workshops, bootcamps, or student membership.
              </p>
              <a
                href="mailto:codingclub@cuh.ac.in"
                className="text-primary hover:text-accent transition-colors font-medium hover:underline block font-mono text-sm"
              >
                codingclub@cuh.ac.in
              </a>
            </div>
          </div>
          <div className="flex flex-col justify-between space-y-8 p-8 sm:p-12 bg-muted/30">
            <div>
              <div className="flex items-center gap-2 text-sky-400 mb-2">
                <Building size={18} />
                <span className="text-xs uppercase font-bold tracking-wider">Campus Desk</span>
              </div>
              <h2 className="mb-3 text-xl font-semibold text-foreground font-handjet tracking-wider">
                Admin & Technical Desk
              </h2>
              <p className="text-muted-foreground text-sm mb-4">
                Dept. of Computer Science & IT, Central University of Haryana.
              </p>
              <a
                href="mailto:cuhcodingclub@gmail.com"
                className="text-primary hover:text-accent transition-colors font-medium hover:underline block font-mono text-sm"
              >
                cuhcodingclub@gmail.com
              </a>
            </div>
          </div>
        </div>

        <div className="h-8 mx-auto w-px bg-gradient-to-b from-border to-transparent"></div>

        <div className="mt-8">
          <Card className="mx-auto max-w-2xl p-8 sm:p-12 bg-card glass-card border-border shadow-xl rounded-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />

            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-2xl font-bold font-handjet text-foreground tracking-wide">
                  Message Sent Successfully!
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Thank you for reaching out to Coding Club CUH. We have received your inquiry and our team will get back to you shortly.
                </p>
                <Button
                  onClick={() => setSubmitted(false)}
                  variant="outline"
                  className="mt-4 border-border hover:bg-muted text-xs"
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-semibold text-foreground font-handjet tracking-wider">
                    Send us a message
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
                    <Sparkles size={12} />
                    Direct to Admin Desk
                  </span>
                </div>
                <p className="text-muted-foreground text-sm mb-8">
                  Fill out the form below and we&apos;ll get back to you as soon as possible.
                </p>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-foreground text-sm font-medium">
                        Full name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="text"
                        id="name"
                        placeholder="e.g. Ajay Sharma"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="focus:ring-primary/50 focus:border-primary bg-background border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground text-sm font-medium">
                        Email Address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="email"
                        id="email"
                        placeholder="e.g. ajay@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="focus:ring-primary/50 focus:border-primary bg-background border-border"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-foreground text-sm font-medium">
                      Subject <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="subject"
                      placeholder="e.g. Workshop question, project collaboration, certificate inquiry"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="focus:ring-primary/50 focus:border-primary bg-background border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="msg" className="text-foreground text-sm font-medium">
                      Message <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="msg"
                      rows={5}
                      placeholder="Tell us what you need help with..."
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="focus:ring-primary/50 focus:border-primary bg-background border-border resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 transition-opacity border-0 py-5 text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Send Message</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
}
