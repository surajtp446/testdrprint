import { useSEO } from '@/hooks/useSEO.js';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { fadeUp } from '@/data/animations.js';

function ImageCarousel({ images, alt }) {
  const [current, setCurrent] = useState(0);
  if (images.length === 1) return (
    <div className="w-full h-52 overflow-hidden">
      <img src={images[0]} alt={alt} loading="lazy" className="w-full h-full object-cover" />
    </div>
  );
  return (
    <div className="relative w-full h-52 overflow-hidden group">
      <img key={current} src={images[current]} alt={`${alt} ${current + 1}`} loading="lazy"
        className="w-full h-full object-cover" />
      <button aria-label="Previous image" onClick={e => { e.stopPropagation(); setCurrent((current - 1 + images.length) % images.length); }}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronLeft size={13} />
      </button>
      <button aria-label="Next image" onClick={e => { e.stopPropagation(); setCurrent((current + 1) % images.length); }}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight size={13} />
      </button>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
        {images.map((_, i) => (
          <button key={i} onClick={e => { e.stopPropagation(); setCurrent(i); }}
            className={`w-1 h-1 rounded-full transition-all ${i === current ? 'bg-white scale-125' : 'bg-white/35'}`} />
        ))}
      </div>
    </div>
  );
};

// Full carousel for inside the modal — always shows arrows, proper height
function ModalCarousel({ images, alt }) {
  const [current, setCurrent] = useState(0);
  return (
    <div className="relative w-full bg-[#111]" style={{minHeight: '320px'}}>
      <img
        key={current}
        src={images[current]}
        alt={`${alt} ${current + 1}`}
        className="w-full object-contain"
        style={{maxHeight: '420px', minHeight: '240px'}}
      />
      {images.length > 1 && (
        <>
          <button
            aria-label="Previous image"
            onClick={e => { e.stopPropagation(); setCurrent((current - 1 + images.length) % images.length); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/80 hover:bg-black text-white rounded-full p-2 transition-all">
            <ChevronLeft size={16} />
          </button>
          <button
            aria-label="Next image"
            onClick={e => { e.stopPropagation(); setCurrent((current + 1) % images.length); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/80 hover:bg-black text-white rounded-full p-2 transition-all">
            <ChevronRight size={16} />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 items-center">
            {images.map((_, i) => (
              <button key={i}
                aria-label={`Go to image ${i + 1}`}
                onClick={e => { e.stopPropagation(); setCurrent(i); }}
                className={`rounded-full transition-all ${i === current ? 'w-4 h-2 bg-white' : 'w-2 h-2 bg-white/35 hover:bg-white/60'}`} />
            ))}
          </div>
          <div className="absolute top-3 right-3 bg-black/60 text-white/78 text-[12px] font-mono px-2 py-0.5">
            {current + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
};

// Detail modal shown when card is clicked
function ProjectModal({ project, onClose }) {
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/88 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }} transition={{ type: 'tween', duration: 0.24 }}
        data-lenis-prevent
        className="relative w-full max-w-2xl max-h-[88vh] bg-[#0a0a0a] border border-white/10 overflow-y-auto">

        {/* Image carousel — full size, not cropped */}
        <ModalCarousel images={project.images} alt={project.title} />

        {/* Content */}
        <div className="p-8">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/65 hover:text-white transition-colors bg-black/60 rounded-full p-1.5">
            <X size={16} />
          </button>

          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="text-[13px] tracking-[0.38em] text-white/60 uppercase">{project.category}</span>
            {project.tag && (
              <span className="text-[13px] font-black tracking-widest uppercase border border-white/12 px-2 py-0.5 text-white/68">
                {project.tag}
              </span>
            )}
          </div>

          <h2 className="text-2xl font-black leading-tight mb-4">{project.title}</h2>
          <p className="text-white/78 text-sm leading-relaxed font-light mb-7">{project.description}</p>

          <ul className="space-y-2.5 border-t border-white/14 pt-6">
            {project.specs.map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-white/68">
                <span className="w-1 h-1 rounded-full bg-white/22 mt-1.5 shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Card — shows image, category, title, tag and "Read more" only
function ProjectCard({ project, index, onClick }) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={fadeUp}
      onClick={onClick}
      className="border border-white/15 bg-white/[0.012] hover:border-white/18 transition-all duration-300 overflow-hidden cursor-pointer group"
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        <div className="w-full h-52">
          <img src={project.images[0]} alt={project.title} loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
        {/* Tag badge */}
        {project.tag && (
          <div className="absolute top-3 left-3 bg-white text-black text-[13px] font-black uppercase tracking-widest px-2.5 py-1">
            {project.tag}
          </div>
        )}
        {/* Image count if multiple */}
        {project.images.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/60 text-white/78 text-[13px] font-mono px-1.5 py-0.5">
            {project.images.length} photos
          </div>
        )}
      </div>

      {/* Caption */}
      <div className="p-5">
        <p className="text-[13px] tracking-[0.38em] text-white/60 uppercase mb-2">{project.category}</p>
        <h3 className="font-black text-sm leading-snug mb-3 group-hover:text-white/90 transition-colors">{project.title}</h3>
        <span className="text-[13px] font-black uppercase tracking-widest text-white/62 group-hover:text-white/78 transition-colors flex items-center gap-1">
          Read more
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </span>
      </div>
    </motion.div>
  );
}

const projects = [
  {
    id: 1,
    title: 'FV01 — Full-Scale 3D Printed F1 Model',
    category: 'Scale Modelling',
    tag: 'Flagship Build',
    description: 'The FV01 is one of the most advanced 3D printed F1 scale models built in India — a full multi-part build of the Mercedes W11 #44, printed across hundreds of components in high-detail PLA. Assembled with accurate aerodynamic surfaces, carbon-look livery, and housed in a custom acrylic showcase. A benchmark in what precision FDM printing can achieve.',
    images: ['/projects/fv01_model.webp'],
    specs: ['Multi-part PLA assembly — 100+ components','Custom acrylic display case','Mercedes W11 #44 accurate livery','Full aerodynamic surface detail'],
  },
  {
    id: 2,
    title: "India's Fastest FPV Drone — 329 km/h",
    category: 'Aerospace · High Performance',
    tag: 'Record Build',
    description: "A fully custom high-speed FPV racing drone with a 3D printed structural frame, motor mounts, and aerodynamic shrouds — this build hit 329 km/h, making it India's fastest recorded drone. Every printed component was engineered for aerodynamic efficiency and weight minimisation while surviving extreme thrust loads.",
    images: ['/projects/drone_fast.webp'],
    specs: ['Top speed: 329 km/h','3D printed frame, mounts and shrouds','Aerodynamic profile optimised for speed','Lightweight PLA + carbon fibre hybrid'],
  },
  {
    id: 3,
    title: 'Autonomous Disaster Management Drone',
    category: 'Aerospace · Autonomous Systems',
    tag: 'Runner-Up · Aerothon',
    description: 'Built for Aerothon — a national-level autonomous UAV competition — this hexacopter completed a full mission without any human intervention, from takeoff through waypoint navigation to payload drop and safe return. State machine architecture, sensor-driven decision making, and layered failsafe logic. Runner-up at the national final.',
    images: ['/projects/drone_disaster.webp'],
    specs: ['Fully autonomous — zero human intervention during mission','State machine architecture with failsafe recovery','3D printed payload drop mechanism and landing legs','Runner-up at Aerothon national competition'],
  },
  {
    id: 4,
    title: 'Robotic Arm — Servo-Driven, Arduino Controlled',
    category: 'Robotics · Education',
    tag: 'Client Delivery',
    description: 'A fully 3D printed multi-joint robotic arm with servo actuation and Arduino control, delivered to BMS College of Engineering. The build includes a sturdy ventilated base housing, two articulated arm links with bearing-seated joints, and a functional gripper end-effector — all printed in clean white PLA with tight dimensional tolerances for smooth mechanical fit. The client was fully satisfied with the print quality and assembly.',
    images: ['/projects/robotic_arm_1.webp', '/projects/robotic_arm_2.webp', '/projects/robotic_arm_3.webp', '/projects/robotic_arm_4.webp'],
    specs: [
      'Delivered to BMS College of Engineering, Bengaluru',
      'Servo-driven joints with Arduino control',
      'Bearing-seated articulation for smooth movement',
      'Functional gripper end-effector',
      'Source model — MakerWorld #1134925',
    ],
  },
  {
    id: 5,
    title: 'Low-Bypass Turbofan Engine — Full Assembly',
    category: 'Mechanical Engineering',
    tag: 'Showcase Build',
    description: 'A fully 3D printed low-bypass turbofan based on 1960s jet engine architecture — the same configuration that powered the Boeing 727 and DC-9. Built with two-tone PLA (white casing, bronze-tan blades), the model shows the actual internal layout: fan stages, axial compressor, combustion section and turbine stages. Every blade row printed and assembled by hand.',
    images: ['/projects/turbofan_1.webp', '/projects/turbofan_2.webp', '/projects/turbofan_3.webp'],
    specs: ['10+ compressor and turbine stages','100+ individually printed and assembled parts','Dual-tone PLA — white casing, bronze-tan blades','Based on 1960s low-bypass turbofan architecture'],
  },
  {
    id: 6,
    title: 'Talon 1400 — Fixed-Wing UAV Airframe',
    category: 'Aerospace · Fixed-Wing',
    tag: 'Defence Client',
    description: 'A full-scale Talon 1400 fixed-wing UAV airframe, 3D printed and assembled for a defence-sector client. The build covers the complete fuselage body, nose cone, twin tail booms, vertical stabilisers, and all wing mating surfaces — printed in ASA for UV and weather resistance with PA6-CF reinforcement at all structural load points. Every panel was printed to tight dimensional tolerances to ensure correct wing-to-fuselage alignment and clean aerodynamic continuity across the 1400mm span. Client details and operational specifics are confidential.',
    images: ['/projects/talon_1400.png'],
    specs: [
      'Wingspan: 1400mm full-scale airframe',
      'Fuselage, nose cone, tail booms and stabilisers — fully 3D printed',
      'ASA outer surfaces — UV stable, weather resistant',
      'PA6-CF used at all structural load and wing-mount points',
      'Tight dimensional tolerance for aerodynamic surface continuity',
      'Delivered to a defence-sector client — operational details confidential',
    ],
  },
];


const pageVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, x: -50, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};
export default function ProjectsPage() {
  useSEO({
    title: '3D Printing Portfolio — Drone Frames, F1 Models, UAV Parts | Dr.PrinT Bengaluru',
    description: "See Dr.PrinT's 3D printing portfolio — India's fastest FPV drone (329 km/h), full-scale F1 car models, autonomous UAV systems, robotic arms, turbofan engines, and defence UAV airframes. All printed in Bengaluru.",
    canonical: 'https://drprint.in/projects',
  });

  const [selected, setSelected] = useState(null);

  return (
    <motion.div className="min-h-screen bg-black text-white pt-24 pb-24"
      variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-14 text-center">
          <p className="text-sm tracking-[0.5em] text-white/65 uppercase mb-4">Our Work</p>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4">Projects</h1>
          <div className="w-10 h-px bg-white/12 mx-auto mb-5" />
          <p className="text-white/70 text-sm font-light max-w-md mx-auto leading-relaxed">
            From scale models to aerospace systems. Click any project to learn more.
          </p>
        </motion.div>

        {/* 2-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i}
              onClick={() => setSelected(project)}
/>
          ))}
        </div>

        {/* CTA */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={fadeUp} custom={5}
          className="border border-white/15 p-10 flex flex-col sm:flex-row items-center justify-between gap-6 bg-white/[0.01]">
          <div>
            <p className="text-[12px] tracking-[0.5em] text-white/60 uppercase mb-2">Have a Project in Mind?</p>
            <h2 className="text-2xl font-black">Let's Build Something</h2>
            <p className="text-white/70 text-sm font-light mt-1 max-w-xs leading-relaxed">
              Replica, prototype, or aerospace component — we are ready.
            </p>
          </div>
          <Link to="/contact"
            className="shrink-0 px-8 py-3.5 bg-white text-black text-[13px] font-black uppercase tracking-[0.18em] hover:bg-white/85 transition-all duration-300">
            Start a Project
          </Link>
        </motion.div>
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>

    </motion.div>
  );
};
