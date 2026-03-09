export interface Project {
  slug: string;
  name: string;
  url: string;
  iconPath: string;
  boxartPath: string;
  description: string;
  videoUrl: string | null;
  screenshots: string[];
}

export const projects: Project[] = [
  {
    slug: "biscoidino",
    name: "Biscoidino",
    url: "https://www.biscoidino.com.br",
    iconPath: "/img/icon/biscoidino_logo.png",
    boxartPath: "/img/boxart/biscoidino_pixel .png",
    description:
      "The official website of Biscoidino — a family-owned cookie store in Brazil. Browse our handcrafted cookies and learn about our story.",
    videoUrl: null,
    screenshots: [],
  },
  {
    slug: "city_of_god_flight",
    name: "City of God Flight",
    url: "https://satolg.github.io/city_of_god_flight/",
    iconPath: "/img/icon/city_of_god_flight.png",
    boxartPath: "/img/boxart/city_of_god_flight.png",
    description:
      "An exciting side-scrolling flight game set above the rooftops. Navigate through obstacles and reach new heights in this fast-paced arcade experience.",
    videoUrl: null,
    screenshots: [],
  },
  {
    slug: "trystero_walking_pkmn_trainer",
    name: "Trystero Walking Trainer",
    url: "https://satolg.github.io/trystero_walking_pkmn_trainer/",
    iconPath: "/img/icon/trystero_walking_pkmn_trainer.png",
    boxartPath: "/img/boxart/trystero_walking_pkmn_trainer.png",
    description:
      "A multiplayer version of the Walking Pokémon Trainer, powered by Trystero for peer-to-peer connectivity. Walk alongside friends in real time.",
    videoUrl: null,
    screenshots: [],
  },
  {
    slug: "trystero_3d_lab",
    name: "Trystero 3D Lab",
    url: "https://satolg.github.io/trystero_3d_lab/",
    iconPath: "/img/icon/trystero_3d_lab.png",
    boxartPath: "/img/boxart/trystero_3d_lab.png",
    description:
      "A real-time multiplayer 3D sandbox environment built with Three.js and Trystero. Experiment with 3D objects and interact with other users in shared space.",
    videoUrl: null,
    screenshots: [],
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
