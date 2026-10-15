"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SectionHeading } from "@/components/ui/section-heading";
import { Quote, Star } from "lucide-react";
import { InfiniteSlider } from "@/components/motion-primitives/infinite-slider";

type Testimonial = {
  name: string;
  role: string;
  image: string;
  quote: string;
  stars?: number;
};

const testimonials: Testimonial[] = [
  {
    name: "Arjun Sharma",
    role: "B.Tech CSE, 3rd Year",
    image: "https://res.cloudinary.com/khxwr1df/image/upload/v1789927153/codingclub/teams/members/cuh_team_2026.jpg",
    quote: "Joining Coding Club CUH completely changed my trajectory. The peer-led sessions on DSA and Web Dev gave me the confidence to crack my first internship interview.",
    stars: 5,
  },
  {
    name: "Priya Mehra",
    role: "B.Sc IT, 2nd Year",
    image: "https://res.cloudinary.com/khxwr1df/image/upload/v1789927153/codingclub/teams/members/cuh_team_2026.jpg",
    quote: "The hackathon was an incredible experience! Building a real-world project overnight with teammates I'd just met taught me more than any classroom session ever could.",
    stars: 5,
  },
  {
    name: "Rohit Nanda",
    role: "M.Sc CS, 1st Year",
    image: "https://res.cloudinary.com/khxwr1df/image/upload/v1789927153/codingclub/teams/members/cuh_team_2026.jpg",
    quote: "The AI chatbot on the website is super helpful! It guided me through setting up my first Next.js project step by step. The club's tech infrastructure itself is impressive.",
    stars: 5,
  },
  {
    name: "Anjali Singh",
    role: "B.Tech CSE, Final Year",
    image: "https://res.cloudinary.com/khxwr1df/image/upload/v1789927153/codingclub/teams/members/cuh_team_2026.jpg",
    quote: "From attending sessions as a fresher to leading Python workshops as a senior — Coding Club CUH shaped who I am as a developer. The certificate I earned opened doors for me.",
    stars: 5,
  },
  {
    name: "Karan Yadav",
    role: "B.Tech CSE, 2nd Year",
    image: "https://res.cloudinary.com/khxwr1df/image/upload/v1789927153/codingclub/teams/members/cuh_team_2026.jpg",
    quote: "The Full-Stack Web Development Workshop was mind-blowing. We went from 'what is an API' to deploying a live app in one session. Senior mentors are genuinely passionate.",
    stars: 5,
  },
  {
    name: "Neha Kumari",
    role: "B.Sc IT, 3rd Year",
    image: "https://res.cloudinary.com/khxwr1df/image/upload/v1789927153/codingclub/teams/members/cuh_team_2026.jpg",
    quote: "I was nervous about coding, but the friendly environment at Coding Club made me comfortable to ask even basic questions. Now I'm helping others code — full circle!",
    stars: 5,
  },
  {
    name: "Rahul Verma",
    role: "MCA, 1st Year",
    image: "https://res.cloudinary.com/khxwr1df/image/upload/v1789927153/codingclub/teams/members/cuh_team_2026.jpg",
    quote: "The Coding Club is what every university CS society should aspire to be. Real projects, verified certificates, and sessions that feel like professional dev meetups.",
    stars: 5,
  },
  {
    name: "Sita Devi",
    role: "B.Tech ECE, 2nd Year",
    image: "https://res.cloudinary.com/khxwr1df/image/upload/v1789927153/codingclub/teams/members/cuh_team_2026.jpg",
    quote: "Even as an ECE student, I felt incredibly welcomed. The C & Python Masterclass was perfectly structured for beginners. I built my first GUI app by the end of week one!",
    stars: 5,
  },
];

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="glass-card glass-card-hover relative w-[320px] flex-shrink-0 rounded-3xl p-6 flex flex-col gap-4 overflow-hidden group">
      {/* Subtle hover gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none rounded-3xl" />
      
      {/* Stars */}
      <div className="flex gap-0.5">
        {Array.from({ length: testimonial.stars ?? 5 }).map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        ))}
      </div>

      {/* Quote icon */}
      <Quote className="w-7 h-7 text-primary/20 -mb-2" />

      {/* Quote text */}
      <blockquote className="text-sm text-foreground/85 leading-relaxed flex-1">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-3 pt-3 border-t border-border/50">
        <Avatar className="size-9 ring-2 ring-primary/15">
          <AvatarImage alt={testimonial.name} src={testimonial.image} loading="lazy" width={80} height={80} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
            {testimonial.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-bold text-sm text-foreground leading-tight">{testimonial.name}</p>
          <p className="text-[11px] text-muted-foreground">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
}

export default function WallOfLoveSection() {
  return (
    <section className="py-16 md:py-28 relative overflow-hidden">
      {/* Background */}
      <div aria-hidden className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />
      <div aria-hidden className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-6xl px-6 relative z-10">
        <SectionHeading
          title="Loved by the Community"
          subtitle="Hear from students whose journeys were shaped by Coding Club CUH."
          badge="💬 Testimonials"
        />
      </div>

      {/* Infinite marquee row 1 — forward */}
      <div className="mt-12 relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 w-24 h-full bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        <InfiniteSlider speedOnHover={20} gap={16} speed={55} className="py-2">
          {testimonials.slice(0, 4).map((t) => (
            <TestimonialCard key={t.name} testimonial={t} />
          ))}
        </InfiniteSlider>
      </div>

      {/* Infinite marquee row 2 — reverse */}
      <div className="mt-4 relative">
        <div className="absolute left-0 top-0 w-24 h-full bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        <InfiniteSlider speedOnHover={20} gap={16} speed={55} reverse className="py-2">
          {testimonials.slice(4).map((t) => (
            <TestimonialCard key={t.name} testimonial={t} />
          ))}
        </InfiniteSlider>
      </div>
    </section>
  );
}
