/**
 * Every piece of copy on the site lives here, so wording changes never require
 * touching a component.
 *
 * NOTE FOR YASH: the project blurbs are deliberately written only to the level
 * of detail the old site actually claimed. Where you know the real stack
 * (database, protocol, hosting), add it — specifics are what make this read as
 * engineering rather than marketing. Anything marked `verify` is a detail worth
 * confirming before it goes public.
 */

export const profile = {
  name: 'Yash Siwach',
  eyebrow: 'Gurugram, IN · Associate Software Engineer @ Accenture',
  statement: 'I build software end to end — schema to shader — and I care how they get used.',
  email: 'me@yashsiwach.in',
  phone: '+91 7206099609',
  phoneHref: 'tel:+917206099609',
  location: 'Gurugram, Haryana, India',
  resume: 'https://drive.google.com/file/d/1ZKDsqFIP8bYJbzc60ojeXw0EfuP5OBux/view?usp=sharing',
  socials: [
    { label: 'GitHub', href: 'https://github.com/iamyashsiwach' },
    { label: 'X', href: 'https://twitter.com/iamyashsiwach' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/yash-siwach' },
  ],
} as const;

export const nav = [
  { label: 'Who', href: '#about' },
  { label: 'Log', href: '#log' },
  { label: 'Stack', href: '#stack' },
  { label: 'Work', href: '#work' },
  { label: 'Certs', href: '#certifications' },
  { label: 'Proof', href: '#proof' },
  { label: 'Contact', href: '#contact' },
] as const;

/** Section ids in document order — drives the HUD's "X / Y" scroll-position
 * counter, which is a different count from the "01 / Who … 07 / Contact"
 * eyebrow numbers below: the HUD counts physically distinct scrollable
 * regions (Home included, Certifications excluded since it lives inside
 * #work's DOM, not its own scrollable section), while the eyebrows number
 * labeled content sections (Home excluded, Certifications included). Both
 * happen to total 7, which is a coincidence of the current section count,
 * not a guarantee — don't assume they'll always match if either list grows. */
export const sectionIds = ['home', 'about', 'log', 'stack', 'work', 'proof', 'contact'];

export const about = {
  eyebrow: '01 / Who',
  heading: 'Someone has to own the whole stack.',
  spec: [
    { term: 'Location', value: 'Gurugram, IN' },
    { term: 'Currently', value: 'Associate Software Engineer, Accenture' },
    { term: 'Stack', value: 'TypeScript · Next.js · Node · Three.js' },
    {
      term: 'Focus',
      value: 'Systems and cloud architecture, DevOps and MLOps, agent tooling and MCP',
    },
    { term: 'Shipping since', value: '2022' },
  ],
  paragraphs: [
    'I started building because I wanted things that did not exist yet — an air quality monitor for my parents’ flat, an AR game, a copy-trading bot at 3am during a hackathon.',
    'Most of what I know came from shipping small things badly and then fixing them. I have written the schema, the API, the frontend, the deploy config and the CSS for the same product often enough that I stopped thinking of them as separate jobs. Owning all of it is also what got me interested in why we were building any of it.',
    'That habit of owning the whole thing is what led me to run Blue Layer Studio for the better part of two years — client sites, start to finish, my own name on the invoice, growing from just me to a team of five or six working across time zones. These days most of that energy goes into shipping at Accenture.',
    'Right now I am drawn to the parts of engineering that are hard to fake: systems and cloud architecture, the DevOps and MLOps work that keeps things running once they ship, and building with MCP and agents rather than just around them.',
  ],
  portrait: { src: '/Hero_img.jpeg', alt: 'Yash Siwach' },
} as const;

export type Project = {
  title: string;
  year: string;
  role: string;
  blurb: string;
  tech: string[];
  href?: string;
  image: string;
};

export type Certification = {
  title: string;
  issuer: string;
  date: string;
  skills?: string[];
  credentialId?: string;
};

export const certifications = {
  // Numbered like every other section even though it renders as a small
  // column label inside the merged #work section (see CertWork.tsx), not
  // a full-width section of its own — it's still real, distinct content,
  // and the nav lists it as its own item ("Certs"), so it needs its own
  // number in that sequence (01 Who … 07 Contact) rather than being the
  // one nav entry with nothing to show for it.
  eyebrow: '05 / Certifications',
  heading: 'What I went and got certified in',
  items: [
    {
      title: 'Claude Certified Developer',
      issuer: 'Anthropic',
      date: 'Issued Aug 2026 · Expires Aug 2027',
      skills: ['Model Context Protocol (MCP)', 'Claude Agent SDK'],
    },
    {
      title: 'GitHub Foundations',
      issuer: 'DataCamp',
      date: 'Issued Jul 2026',
      credentialId: '905,059',
      skills: ['GitHub'],
    },
    {
      title: 'Using MySQL Database with PHP',
      issuer: 'Coursera',
      date: 'Issued May 2024',
    },
    {
      title: 'Clean Data in SQL using MySQL Workbench',
      issuer: 'Coursera',
      date: 'Issued May 2024',
    },
    {
      title: 'Build a MERN Application using Next.js',
      issuer: 'Coursera',
      date: 'Issued May 2024',
    },
    {
      title: "Angela Yu's iOS Bootcamp Course",
      issuer: 'Udemy',
      date: 'Issued Feb 2024',
      skills: ['Swift', 'iOS Development'],
    },
    {
      title: 'Introduction to Cyber Attacks',
      issuer: 'New York University',
      date: 'Issued Aug 2023',
      skills: ['Cloud Security'],
    },
    {
      title: 'Principles of UX/UI Design',
      issuer: 'Meta',
      date: 'Issued Apr 2023',
      skills: ['User Experience (UX)', 'User Interface Design'],
    },
  ] satisfies Certification[],
} as const;

export const work = {
  eyebrow: '04 / Work',
  heading: 'Things I shipped',
  projects: [
    {
      title: 'Archery Tournament Manager',
      year: '2026',
      role: 'Solo build',
      blurb:
        'Tournament management for my archery academy — coaches register archers, judges score qualification and matches, everyone sees live rankings and field target boards.',
      tech: ['Next.js', 'Supabase', 'TypeScript'],
      href: 'https://archery-tms.vercel.app',
      image: '/archery-tms.png',
    },
    {
      title: 'Tripsee',
      year: '2026',
      role: 'Solo build',
      blurb:
        'Travel discovery and booking site — browse destinations, plan a trip. Docker-containerized, served behind Nginx.',
      tech: ['Next.js', 'Docker', 'TypeScript'],
      href: 'https://tripseetravel.in',
      image: '/traveltripsee.png',
    },
    {
      title: 'GreenBytes',
      year: '2025',
      role: 'Solo build — frontend, backend and ML pipeline',
      blurb:
        'Crop disease detection for farmers — a photo plus a few diagnostic questions, fused through a YOLOv8 + TabNet model for a diagnosis. FastAPI backend, deployed on Azure.',
      tech: ['Next.js', 'FastAPI', 'PyTorch', 'YOLOv8', 'Azure'],
      href: 'https://greenbytes-ui.vercel.app',
      image: '/greenbytes.png',
    },
    {
      title: 'MGNREGA District Dashboard',
      year: '2025',
      role: 'Solo build',
      blurb:
        'District-level performance dashboard for a national rural employment scheme — bilingual (Hindi/English), built for low-literacy rural users, with automatic district detection.',
      tech: ['Next.js', 'PostgreSQL', 'Docker', 'GitHub Actions'],
      image: '/mgnrega-dashboard.png',
    },
    {
      title: 'SparkSync',
      year: '2025',
      role: 'Solo build',
      blurb:
        'Dating app for the South African market, web and mobile. GitHub Actions deploys straight to production.',
      tech: ['Next.js', 'GitHub Actions', 'TypeScript'],
      href: 'https://sparksync.in',
      image: '/sparksync.png',
    },
    {
      title: 'Blue Layer Studio',
      year: '2024',
      role: 'Design and build, solo',
      blurb:
        'Agency site with a Three.js hero and retrieval-augmented search over their case studies. Built the frontend, the retrieval layer and the deploy.',
      tech: ['Next.js', 'Three.js', 'RAG', 'TypeScript'],
      href: 'https://webagency-iamyashsiwachs-projects.vercel.app',
      image: '/Screenshot (2).jpeg',
    },
    {
      title: 'Revee Infotech',
      year: '2024',
      role: 'Sole developer',
      blurb:
        'Marketing and quote-request site for a systems integrator. Content-driven pages and a form pipeline their sales team actually uses.',
      tech: ['Next.js', 'TypeScript'],
      href: 'https://www.reveeinfotech.com',
      image: '/reveeinfotech.png',
    },
    {
      title: 'TonMate',
      year: '2024',
      role: 'Frontend and trade logic',
      blurb:
        'Copy-trading on TON. Wallet connection and the mirroring logic that replays one account’s trades onto another. Second of the field at the TON Hackathon Bootcamp, $1,500 — built with Jayanth and Kartik.',
      tech: ['TON', 'TypeScript', 'React'],
      image: '/p-4.png',
    },
    {
      title: 'Air Quality Monitor',
      year: '2024',
      role: 'Hardware and dashboard',
      blurb:
        'Portable IoT air-quality index monitor for indoor air. Built the device and the readout it reports to.',
      tech: ['IoT', 'Embedded', 'Dashboard'],
      href: 'https://www.linkedin.com/posts/yash-siwach_iot-airquality-smarthome-activity-7207296630738341889-wHXx',
      image: '/p-1.jpeg',
    },
    {
      title: 'Smile Foundation Society',
      year: '2024',
      role: 'Sole developer, pro bono',
      blurb:
        'Donation site for an NGO. Instrumented the donation funnel and tested the flow against real drop-off rather than guessing at it.',
      tech: ['Next.js', 'Analytics', 'Vercel'],
      href: 'https://smilefoudationsociety.vercel.app',
      image: '/p-3.png',
    },
    {
      title: 'AR Game',
      year: '2023',
      role: 'Solo build',
      blurb:
        'Augmented-reality game in Unity. Marker tracking, the mobile build pipeline, and shipping it to a real device.',
      tech: ['Unity', 'C#', 'Xcode'],
      href: 'https://www.linkedin.com/posts/yash-siwach_unity-csharp-argame-activity-7193535905696018432-jD3h',
      image: '/p-2.png',
    },
  ] satisfies Project[],
} as const;

export type LogEntry = {
  date: string;
  title: string;
  detail: string;
  metric?: { value: number; suffix?: string; prefix?: string; label: string };
  image?: string;
};

export const log = {
  eyebrow: '02 / Log',
  heading: 'Changelog',
  years: [
    {
      year: '2024',
      entries: [
        {
          date: '2024.10',
          title: 'TON Hackathon Bootcamp — 2nd place',
          detail:
            'TonMate, a copy-trading platform for TON, took second place and a $1,500 prize. Built with Jayanth and Kartik.',
          metric: { value: 1500, prefix: '$', label: 'prize' },
          image: '/2024-1.jpeg',
        },
        {
          date: '2024.06',
          title: 'Aleo Chandigarh zkMeetup — chapter lead',
          detail:
            'Ran the Chandigarh zkMeetup on zero-knowledge proofs, with people who work on privacy and security for a living.',
          image: '/2024-3.jpeg',
        },
        {
          date: '2024.04',
          title: 'Starknet India Roadshow — chapter lead',
          detail:
            'Organised the Starknet India Roadshow: workshops, gaming sessions, and 32,000 STRK in prizes.',
          metric: { value: 32000, suffix: ' STRK', label: 'in prizes' },
          image: '/2024-2.jpeg',
        },
      ],
    },
    {
      year: '2023',
      entries: [
        {
          date: '2023.11',
          title: 'TECHHACKS 3.0, Chitkara University',
          detail:
            'First 24-hour hackathon. Spent it on blockchain and NFTs, and learned what I could actually ship under a clock.',
          image: '/2023-2.jpeg',
        },
        {
          date: '2023.09',
          title: 'Gas Cylinder Regulator — team hardware project, software',
          detail:
            'A safer home gas cylinder rig — wheels so it can be moved without lifting, and an emergency shut-off valve. Built with a team; I handled the software. For elderly users handling cylinders alone.',
          image: '/2023-3.png',
        },
        {
          date: '2023.03',
          title: 'Government of Rajasthan hackathon, Jaipur',
          detail:
            'Built a peer-to-peer cash lending and investing app with my team at Rajasthan University.',
          image: '/2023-1.jpeg',
        },
      ],
    },
  ],
} as const;

export const stack = {
  eyebrow: '03 / Stack',
  heading: 'What I reach for',
  groups: [
    {
      label: 'Runtime',
      items: [
        { name: 'Node', note: 'APIs and build tooling' },
        { name: 'React', note: 'every frontend here' },
        { name: 'Next.js', note: 'App Router, this site included' },
      ],
    },
    {
      label: 'Language',
      items: [
        { name: 'TypeScript', note: 'default for anything that outlives a weekend' },
        { name: 'JavaScript', note: 'where the tooling insists' },
        { name: 'Python', note: 'FastAPI backends, the ML pipeline — GreenBytes' },
        { name: 'C#', note: 'Unity, the AR game' },
        { name: 'Arduino', note: 'hardware projects — air quality monitor, gas cylinder rig' },
      ],
    },
    {
      label: 'Data',
      items: [
        { name: 'MongoDB', note: 'document stores, client projects' },
        { name: 'RAG', note: "retrieval-augmented search, Blue Layer's case studies" },
        {
          name: 'Anthropic Claude SDK',
          note: 'MCP and the Claude Agent SDK — Claude Certified Developer',
        },
        {
          name: 'PyTorch / YOLOv8',
          note: 'multimodal crop-health detection — vision + tabular fusion',
        },
      ],
    },
    {
      label: 'Graphics',
      items: [
        { name: 'Three.js', note: 'the hero on this page' },
        { name: 'GLSL', note: 'custom shader material, no post-processing pass' },
        { name: 'GSAP', note: 'every transition on this site' },
      ],
    },
    {
      label: 'Infra',
      items: [
        { name: 'AWS', note: 'day-to-day at Accenture' },
        { name: 'Azure', note: 'production deployment, the crop-health project' },
        { name: 'Docker', note: 'multi-stage builds' },
        { name: 'Terraform', note: 'infrastructure as code' },
        { name: 'Vercel', note: 'hosting and analytics' },
        { name: 'Git / GitHub Actions', note: 'version control, CI/CD' },
        { name: 'Figma', note: 'where this design started' },
      ],
    },
  ],
} as const;

export const proof = {
  eyebrow: '06 / Proof',
  heading: 'Not just claims — the log',
  /** The plain-language framing a non-technical visitor needs: the sentence
   * has to make the point on its own, with the calendar grid as backup, not
   * the other way round. Filled in with the real count at render time. */
  captionTemplate: (activeDays: number) => `${activeDays} active days on GitHub.`,
  unavailable:
    'Live activity feed unavailable right now — everything else on this page is still real, this one just did not load.',
  activityUnavailable: 'Recent activity unavailable right now.',
} as const;

export const contact = {
  eyebrow: '07 / Contact',
  heading: 'Let’s build something',
  line: 'Freelance work, full-time roles, or a project you cannot get anyone else to take on.',
} as const;
