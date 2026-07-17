"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useRef, useEffect, useCallback } from "react";
import { TextRise } from "../custom/TextRise";
import { Heading, Paragraph } from "../includes/TypoGraphy";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

interface Event {
  id: string;
  img: string;
  title: string;
  desc: string;
  date: string;
  year: string;
  theme?: string;
  venue?: string;
  highlights?: string[];
  chiefGuests?: string[];
  gallery?: string[];
}

const events: Event[] = [
  {
    id: "1",
    img: "/images/tensymp.png",
    title: "Tensymp'24",
    desc: "IEEE TENSYMP'24, is a premier symposium showcasing cutting-edge technological advancements, fostering global collaboration, and empowering researchers, professionals, and students through insightful sessions, workshops, and networking opportunities across diverse domains.",
    date: "12 MAR",
    year: "2024",
    theme: "Technology & Innovation",
    venue: "Main Auditorium, NSUT",
    highlights: [
      "Over 500+ participants from 10 countries",
      "Interactive coding sessions and hackathons",
      "Keynote speeches by industry leaders"
    ],
    chiefGuests: ["Dr. Anuradha Tomar", "Dr. Prerna Gaur"],
    gallery: ["/images/image1.jpg", "/images/image2.png", "/images/image4.png", "/images/image5.png"]
  },
  {
    id: "2",
    img: "/images/dssywlc.png",
    title: "DSSYWLC'24",
    desc: "IEEE DSSYWLC is a dynamic event focused on networking, knowledge-sharing, and community building through technical symposiums, discussions and cultural festivities.",
    date: "5 APR",
    year: "2024",
    theme: "Networking & Community",
    venue: "APJ Abdul Kalam Block",
    highlights: [
      "Cultural festivities and technical symposiums",
      "Interactive panel discussions",
    ]
  },
  {
    id: "3",
    img: "/images/image2.png",
    title: "Algoverse 3.0",
    desc: "IEEE NSUT AlgoVerse is a vibrant, community-driven initiative that provides an engaging and structured platform to thoroughly master DSA through consistent, daily problem-solving challenges like Problem of the Day (POTD), fostering both collaboration and growth.",
    date: "22 APR",
    year: "2024",
    theme: "Competitive Coding",
    venue: "CS Lab 2, NSUT",
    highlights: [
      "Daily problem-solving challenges (POTD)",
      "Live leaderboard tracking",
      "Prizes for top 3 competitive coders"
    ],
    chiefGuests: ["Prof. XYZ"],
    gallery: ["/images/image2.png", "/images/image4.png"]
  },
  {
    id: "4",
    img: "/images/pedal.png",
    title: "Pedal Playground",
    desc: "Pedal Playground, organized by IEEE NSUT in collaboration with Crescendo, is an interactive workshop exploring the art of sound design and audio synthesis through pedals. Dive into creative experimentation, music tech.",
    date: "9 MAY",
    year: "2024",
    theme: "Sound Design",
    venue: "Mini Auditorium",
    highlights: [
      "Hands-on workshop with sound synthesis",
      "Collaboration with Crescendo"
    ],
    gallery: ["/images/image5.png"]
  },
  {
    id: "5",
    img: "/images/image1.jpg",
    title: "AI Summit 2025",
    desc: "A summit discussing the future of AI and machine learning across industries. Connect with leading researchers and industry professionals.",
    date: "15 JAN",
    year: "2025",
    theme: "Artificial Intelligence",
    venue: "Main Auditorium, NSUT",
    highlights: [
      "Future of AI across global industries",
      "Connect with leading researchers"
    ]
  },
];

const THEME_BLUE = "#29ABE2";
const DRAG_THRESHOLD = 8;

export default function PastEvents() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [isSweeping, setIsSweeping] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [sweepDir, setSweepDir] = useState(1);
  const isSweepingRef = useRef(false);
  const isPreparingRef = useRef(false);
  const hasEnteredRef = useRef(false);
  const [dialogEvent, setDialogEvent] = useState<Event | null>(null);
  const [pluckedCardIdx, setPluckedCardIdx] = useState<number | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const hoveredIdxRef = useRef(hoveredIdx);

  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);
  const dragMoved = useRef(0);
  const isDragging = useRef(false);
  const lastInteractionTime = useRef(Date.now());
  const activeRef = useRef(active);
  const sweepRafRef = useRef(0);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    hoveredIdxRef.current = hoveredIdx;
  }, [hoveredIdx]);

  const registerInteraction = useCallback(() => {
    lastInteractionTime.current = Date.now();
  }, []);

  const performSweep = useCallback((fromIdx: number, toIdx: number, duration = 2000) => {
    const container = scrollRef.current;
    const cards = cardsRef.current;
    if (!container || !cards) return;

    const fromCard = cards.children[fromIdx + 1] as HTMLElement;
    const toCard = cards.children[toIdx + 1] as HTMLElement;
    if (!fromCard || !toCard) return;

    const fromScroll = fromCard.offsetLeft - container.offsetWidth / 2 + fromCard.offsetWidth / 2;
    const toScroll = toCard.offsetLeft - container.offsetWidth / 2 + toCard.offsetWidth / 2;

    const direction = toIdx > fromIdx ? 1 : -1;
    setSweepDir(direction);

    isPreparingRef.current = true;
    setIsPreparing(true);

    container.style.scrollBehavior = "auto";
    container.scrollLeft = fromScroll;

    cancelAnimationFrame(sweepRafRef.current);

    setTimeout(() => {
      if (!isPreparingRef.current) return;

      isSweepingRef.current = true;
      setIsSweeping(true);

      const startTime = performance.now();
      const distance = toScroll - fromScroll;

      const ease = (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const step = (now: number) => {
        const progress = Math.min((now - startTime) / duration, 1);
        container.scrollLeft = fromScroll + distance * ease(progress);

        if (progress < 1) {
          sweepRafRef.current = requestAnimationFrame(step);
        } else {
          isSweepingRef.current = false;
          setIsSweeping(false);
          isPreparingRef.current = false;
          setIsPreparing(false);
          setActive(toIdx);
          container.style.scrollBehavior = "smooth";
          lastInteractionTime.current = Date.now();
        }
      };

      sweepRafRef.current = requestAnimationFrame(step);
    }, 150);
  }, []);

  const scrollToCard = useCallback((index: number) => {
    if (index < 0 || index >= events.length) return;
    setActive(index);
    const container = scrollRef.current;
    const cards = cardsRef.current;
    if (!container || !cards) return;
    const card = cards.children[index + 1] as HTMLElement;
    if (!card) return;
    container.scrollTo({
      left: card.offsetLeft - container.offsetWidth / 2 + card.offsetWidth / 2,
      behavior: "smooth",
    });
  }, []);

  const syncFromScroll = useCallback(() => {
    if (isSweepingRef.current) return;
    const container = scrollRef.current;
    const cards = cardsRef.current;
    if (!container || !cards) return;
    const center = container.scrollLeft + container.offsetWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < events.length; i++) {
      const el = cards.children[i + 1] as HTMLElement;
      if (!el) continue;
      const cardCenter = el.offsetLeft + el.offsetWidth / 2;
      const d = Math.abs(cardCenter - center);
      if (d < bestDist) { bestDist = d; best = i; }
    }
    setActive(best);
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    registerInteraction();
    cancelAnimationFrame(sweepRafRef.current);
    if (isSweepingRef.current) {
      isSweepingRef.current = false;
      setIsSweeping(false);
      isPreparingRef.current = false;
      setIsPreparing(false);
    }
    const container = scrollRef.current;
    if (!container) return;
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragScrollLeft.current = container.scrollLeft;
    dragMoved.current = 0;
    container.style.scrollBehavior = "auto";
    container.style.cursor = "grabbing";
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    registerInteraction();
    e.preventDefault();
    const container = scrollRef.current;
    if (!container) return;
    const dx = e.clientX - dragStartX.current;
    dragMoved.current = Math.abs(dx);
    container.scrollLeft = dragScrollLeft.current - dx;
  };

  const onMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const container = scrollRef.current;
    if (container) {
      container.style.scrollBehavior = "smooth";
      container.style.cursor = "grab";
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    registerInteraction();
    cancelAnimationFrame(sweepRafRef.current);
    if (isSweepingRef.current) {
      isSweepingRef.current = false;
      setIsSweeping(false);
      isPreparingRef.current = false;
      setIsPreparing(false);
    }
    const container = scrollRef.current;
    if (!container) return;
    isDragging.current = true;
    dragStartX.current = e.touches[0].clientX;
    dragScrollLeft.current = container.scrollLeft;
    dragMoved.current = 0;
    container.style.scrollBehavior = "auto";
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    registerInteraction();
    const container = scrollRef.current;
    if (!container) return;
    const dx = e.touches[0].clientX - dragStartX.current;
    dragMoved.current = Math.abs(dx);
    container.scrollLeft = dragScrollLeft.current - dx;
  };

  const onTouchEnd = () => {
    isDragging.current = false;
    const container = scrollRef.current;
    if (container) container.style.scrollBehavior = "smooth";
  };

  const onScroll = () => {
    syncFromScroll();
  };

  const handleCardClick = (idx: number) => {
    registerInteraction();
    if (dragMoved.current > DRAG_THRESHOLD) return;
    if (active !== idx) {
      scrollToCard(idx);
    } else {
      setPluckedCardIdx(idx);
      setTimeout(() => {
        setDialogEvent(events[idx]);
      }, 250);
    }
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasEnteredRef.current) {
          hasEnteredRef.current = true;
          setTimeout(() => {
            performSweep(events.length - 1, 0, 2000);
          }, 300);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(section);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(sweepRafRef.current);
    };
  }, [performSweep]);

  useEffect(() => {
    if (isSweeping) return;
    if (!hasEnteredRef.current) return;
    const interval = setInterval(() => {
      if (isDragging.current || dialogEvent !== null || hoveredIdxRef.current !== null) {
        registerInteraction();
        return;
      }

      const now = Date.now();
      const currentActive = activeRef.current;
      const isAtEnd = currentActive === events.length - 1;

      if (now - lastInteractionTime.current >= 2500) {
        if (isAtEnd) {
          performSweep(events.length - 1, 0, 2000);
        } else {
          scrollToCard(currentActive + 1);
        }
        lastInteractionTime.current = Date.now();
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isSweeping, dialogEvent, scrollToCard, performSweep, registerInteraction]);

  return (
    <section
      ref={sectionRef}
      className="flex flex-col w-full min-h-[50vh] text-white bg-black relative overflow-hidden pt-4 md:pt-6 pb-4 md:pb-6"
      id="events"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&display=swap');
        
        .font-postcard {
          font-family: 'Wilzten', 'Caveat', cursive;
        }
        
        #past-events-scroll::-webkit-scrollbar{display:none}
        @keyframes gentle-swing {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(2.5deg); }
          75% { transform: rotate(-2.5deg); }
        }
        @keyframes rod-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .rod-glossy {
          background: linear-gradient(
            180deg,
            rgba(255,255,255,0.55) 0%,
            rgba(41,171,226,0.95) 18%,
            rgba(0,180,255,1) 50%,
            rgba(41,171,226,0.95) 82%,
            rgba(10,60,90,0.7) 100%
          );
          box-shadow:
            0 0 18px 4px rgba(41,171,226,0.55),
            0 0 48px 8px rgba(0,180,255,0.22),
            inset 0 1px 0 rgba(255,255,255,0.7);
          border-radius: 9999px;
          position: relative;
        }
        .rod-glossy::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255,255,255,0.38) 40%,
            rgba(255,255,255,0.6) 50%,
            rgba(255,255,255,0.38) 60%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: rod-shimmer 3.5s linear infinite;
        }
      `}</style>



      <div className="w-full max-w-7xl mx-auto flex flex-col items-center text-center z-10 mb-4 px-6">
        <Heading className="text-4xl md:text-5xl lg:text-6xl mb-6 font-bold leading-tight tracking-tight">
          <TextRise
            text="Crafting Excellence: Pioneering Events by IEEE NSUT"
            delay={0.2}
            perWord
            duration={0.8}
          />
        </Heading>
        <Paragraph className="max-w-4xl text-gray-400 text-lg md:text-xl leading-relaxed">
          A Showcase of Innovation, Learning, and Collaboration. With a strong
          focus on excellence and innovation, IEEE NSUT&apos;s events provide
          truly unparalleled opportunities for meaningful networking, hands-on
          skill-building, immersive learning, and effective real-world
          problem-solving.
        </Paragraph>
      </div>

      <div className="w-full relative select-none mt-1 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(41,171,226,0.15) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(41,171,226,0.15) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            maskImage: 'radial-gradient(ellipse 70% 60% at center, black 30%, transparent 90%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at center, black 30%, transparent 90%)',
          }}
        />

        <div
          id="past-events-scroll"
          ref={scrollRef}
          className="w-full overflow-x-scroll cursor-grab touch-pan-x relative z-10"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onScroll={onScroll}
          onWheel={registerInteraction}
          onKeyDown={registerInteraction}
        >
          <div
            ref={cardsRef}
            className="relative flex items-start gap-6 sm:gap-12 md:gap-20 lg:gap-28 px-[50vw] pt-4 pb-8 min-w-max"
            style={{ perspective: "1000px" }}
          >
            <div
              className="absolute left-0 right-0 h-[6px] z-0 pointer-events-none rod-glossy"
              style={{ top: "26px" }}
            />
            {events.map((event, idx) => {
              const isHovered = !isSweeping && hoveredIdx === idx;

              return (
                <div
                  key={event.id}
                  className="relative z-10 flex flex-col items-center w-[160px] sm:w-[200px] md:w-[240px] shrink-0"
                  onClick={() => handleCardClick(idx)}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  <div
                    className="flex flex-col items-center z-20"
                    style={{ marginBottom: 0 }}
                  >
                    <div className="h-[22px]" />
                    <div className="w-[6px] h-[6px] flex items-center justify-center z-30 shrink-0">
                      <motion.div
                        className="rounded-full w-full h-full"
                        animate={
                          pluckedCardIdx === idx
                            ? { y: -40, opacity: 0, scale: 0 }
                            : {
                              y: 0, opacity: 1, scale: isHovered ? 1.2 : 1,
                            }
                        }
                        transition={{ type: "tween", duration: pluckedCardIdx === idx ? 0.25 : 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                        style={{
                          background: isHovered
                            ? "radial-gradient(circle at 35% 30%, #ffffff, #29ABE2 55%, #0a5070)"
                            : "radial-gradient(circle at 35% 30%, #a8eaff, #29ABE2 60%, #0a3a55)",
                          boxShadow: isHovered
                            ? "0 0 8px 2px rgba(41,171,226,0.6), inset 0 1px 2px rgba(255,255,255,0.6)"
                            : "0 0 4px 1px rgba(41,171,226,0.4), inset 0 1px 1px rgba(255,255,255,0.4)",
                        }}
                      />
                    </div>
                    <motion.div
                      className="w-[1.5px] h-10 sm:h-14"
                      animate={{ opacity: pluckedCardIdx === idx ? 0 : 1 }}
                      transition={{ duration: 0.1 }}
                      style={{
                        background: `linear-gradient(to bottom, ${THEME_BLUE}, rgba(41,171,226,0.3))`,
                        boxShadow: "0 0 2px rgba(41,171,226,0.2)",
                      }}
                    />
                  </div>

                  {/* Card */}
                  <motion.div
                    className={cn(
                      "relative p-2 sm:p-3 bg-white rounded-md flex flex-col w-[160px] h-[220px] sm:w-[200px] sm:h-[280px] md:w-[240px] md:h-[340px] cursor-pointer",
                      isHovered
                        ? "shadow-[0_0_20px_rgba(41,171,226,0.2)] z-50"
                        : "shadow-xl z-10"
                    )}
                    style={{
                      transformOrigin: "top center",
                      border: `2px solid ${THEME_BLUE}`,
                      animation: (isSweeping || pluckedCardIdx !== null || isHovered)
                        ? "none"
                        : `gentle-swing ${3 + (idx % 3) * 0.5}s ease-in-out infinite`,
                    }}
                    animate={
                      pluckedCardIdx === idx
                        ? {
                          y: 20,
                          scale: 1,
                          rotate: 0,
                          opacity: 1,
                          zIndex: 100,
                        }
                        : {
                          rotate: isHovered ? 0 : isSweeping ? [8 * sweepDir, 10 * sweepDir, 6 * sweepDir] : (idx % 2 === 0 ? 3 : -3),
                          scale: isHovered ? 1.08 : (isSweeping || isPreparing) ? 0.95 : 1,
                          y: isHovered ? 0 : (isSweeping || isPreparing) ? 14 : 6,
                          opacity: isHovered ? 1 : (isSweeping || isPreparing) ? 0.35 : 0.9,
                          zIndex: isHovered ? 50 : 10,
                        }
                    }
                    transition={
                      pluckedCardIdx === idx
                        ? { duration: 0 }
                        : {
                          rotate: isSweeping
                            ? { repeat: Infinity, duration: 0.6 + (idx % 3) * 0.1, repeatType: "mirror", ease: "easeInOut" }
                            : { type: "spring", stiffness: 200, damping: 15 },
                          default: { type: "spring", stiffness: 200, damping: 15 }
                        }
                    }
                  >
                    <div className="w-full h-[110px] sm:h-[160px] md:h-[200px] bg-gray-100 rounded-sm overflow-hidden relative mb-3 sm:mb-4 pointer-events-none shrink-0">
                      <Image
                        src={event.img}
                        alt={event.title}
                        fill
                        className="object-cover"
                        draggable={false}
                      />
                    </div>

                    {/* Title & Theme */}
                    <div className="flex flex-col flex-1 justify-center items-center px-1 sm:px-2 pointer-events-none gap-1 sm:gap-2">
                      <h3 className="text-slate-900 font-bold text-lg sm:text-xl md:text-2xl text-center leading-snug tracking-tight">
                        {event.title}
                      </h3>
                      {event.theme && (
                        <p className="text-[#29ABE2] font-semibold text-[10px] sm:text-xs tracking-wide text-center">
                          ~{event.theme}
                        </p>
                      )}
                    </div>
                  </motion.div>
                </div>
              );
            })}

          </div>
        </div>
      </div>


      <Dialog open={!!dialogEvent} onOpenChange={(o) => {
        if (!o) {
          setDialogEvent(null);
          setPluckedCardIdx(null);
        }
      }}>
        {dialogEvent && (
          <DialogContent 
            showCloseButton={false} 
            className="bg-transparent border-none shadow-none sm:max-w-none max-w-none p-0 flex items-center justify-center"
          >
            <DialogTitle className="sr-only">{dialogEvent.title}</DialogTitle>
            
            <div 
              className="absolute inset-0 z-0" 
              onClick={() => {
                setDialogEvent(null);
                setPluckedCardIdx(null);
              }}
              aria-label="Close dialog"
            />

            <motion.div
              initial={{ rotateY: -90, scale: 0.8, opacity: 0 }}
              animate={{ rotateY: 0, scale: 1, opacity: 1 }}
              exit={{ rotateY: 90, scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="w-[1024px] h-[400px] sm:h-[480px] md:h-[576px] max-w-[95vw] max-h-[95vh] bg-white text-black rounded-sm shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative overflow-hidden border border-[#29ABE2]/20 mt-12 z-10"
            >
              <button
                onClick={() => {
                  setDialogEvent(null);
                  setPluckedCardIdx(null);
                }}
                className="absolute top-3 right-3 text-[#29ABE2] z-50 focus:outline-none"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </button>

              <div className="w-full h-full flex flex-col md:flex-row overflow-y-auto overflow-x-hidden custom-scrollbar overscroll-contain">
                
                <div className="w-full md:w-[55%] p-5 sm:p-6 md:p-8 flex flex-col border-b md:border-b-0 md:border-r border-black/10 relative shrink-0 h-max">
                  <div className="relative w-full aspect-video md:h-[220px] rounded-sm overflow-hidden mb-5 shadow-md border-[4px] border-white ring-1 ring-[#29ABE2]/30 bg-white rotate-[-1deg] shrink-0">
                    <Image src={dialogEvent.img} alt={dialogEvent.title} fill className="object-cover" />
                  </div>

                  <div className="mb-4 shrink-0">
                    <p className="text-black/80 text-xs sm:text-sm md:text-base leading-relaxed font-medium">
                      {dialogEvent.desc}
                    </p>
                  </div>

                  <div className="mt-auto pt-3 shrink-0 border-t border-black/5">
                    <span className="text-[10px] sm:text-xs uppercase tracking-widest text-black/40 font-bold mb-2 block">Gallery Preview</span>
                    <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                      {dialogEvent.gallery && dialogEvent.gallery.length > 0 ? (
                        dialogEvent.gallery.map((img, i) => (
                          <div key={i} className="relative w-20 h-14 sm:w-24 sm:h-16 rounded-sm overflow-hidden shrink-0 border-[2px] border-white shadow-sm rotate-[1deg]">
                            <Image src={img} alt="Gallery image" fill className="object-cover" />
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-center w-full h-14 sm:h-16 text-xs text-black/30 font-medium border-2 border-dashed border-black/10 rounded-sm">
                          Photos coming soon
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-[45%] p-5 sm:p-6 md:p-8 flex flex-col relative bg-white shrink-0 h-max">
                  
                  <div className="absolute top-3 right-14 w-16 h-6 opacity-60 mix-blend-multiply rotate-[2deg] hidden md:block">
                    <Image src="/IEEE_logo.svg" alt="IEEE Logo" fill className="object-contain" />
                  </div>

                  <div className="mt-1 mb-5 md:mt-4">
                    <h2 className="font-postcard text-3xl sm:text-4xl md:text-5xl text-black leading-tight mb-1.5 transform -rotate-2">
                      {dialogEvent.title}
                    </h2>
                    {dialogEvent.theme && (
                      <div className="transform -rotate-1">
                        <p className="text-[#29ABE2] font-bold text-xs sm:text-sm md:text-base tracking-wide">
                          ~{dialogEvent.theme}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-5 border-b border-black/10 pb-5 shrink-0">
                    <div className="flex flex-col">
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-black/40 font-bold mb-0.5">Date</span>
                      <span className="font-postcard text-lg sm:text-xl md:text-2xl text-black/80 transform -rotate-1">{dialogEvent.date}, {dialogEvent.year}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-black/40 font-bold mb-0.5">Venue</span>
                      <span className="font-postcard text-base sm:text-lg md:text-xl text-black/80 transform -rotate-1">{dialogEvent.venue || "TBA"}</span>
                    </div>
                  </div>

                  <div className="mb-5 shrink-0 flex-1">
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-black/40 font-bold mb-2 block">Highlights</span>
                    {dialogEvent.highlights && dialogEvent.highlights.length > 0 ? (
                      <ul className="list-none space-y-1.5">
                        {dialogEvent.highlights.map((h, i) => (
                          <li key={i} className="flex items-start text-xs sm:text-sm md:text-base text-black/70 font-medium">
                            <span className="text-[#29ABE2] mr-1.5 text-lg leading-none mt-[-1px]">•</span>
                            {h}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs sm:text-sm md:text-base text-black/40 italic">Details to be announced.</p>
                    )}
                  </div>

                  <div className="mt-auto pt-3 border-t border-black/10 shrink-0">
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-black/40 font-bold mb-2 block">Chief Guests</span>
                    <div className="flex flex-wrap gap-1.5">
                      {dialogEvent.chiefGuests && dialogEvent.chiefGuests.length > 0 ? (
                        dialogEvent.chiefGuests.map((guest, i) => (
                          <span key={i} className="text-xs sm:text-sm md:text-base font-postcard text-black/80 bg-black/5 px-2.5 py-0.5 rounded-sm transform rotate-1 border border-black/5">
                            {guest}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs sm:text-sm md:text-base text-black/40 italic">N/A</span>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          </DialogContent>
        )}
      </Dialog>
    </section>
  );
}
